import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft, Play, Pause, Volume2, VolumeX, Camera, CameraOff,
    CheckCircle, Image, Star, Clock, Hash, Check,
    Zap, ChevronRight, Maximize2, Minimize2, Keyboard, Info, MoreHorizontal,
    Star as StarIcon, Activity, Trophy, RefreshCw, ArrowRight
} from 'lucide-react';

import { moduleService } from '../api/moduleService';
import { recognitionService } from '../api/recognitionService';
import { progressService } from '../api/progressService';
import { Hands, HAND_CONNECTIONS } from '@mediapipe/hands';
import { Camera as MPCamera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';

const ModuleLearning = () => {
    const navigate = useNavigate();
    const { moduleId } = useParams();

    // --- ESTADOS ---
    const [moduleInfo, setModuleInfo] = useState(() => {
        try {
            const cached = localStorage.getItem(`api_cache_/modules/${moduleId}`);
            return cached ? JSON.parse(cached).data : null;
        } catch (e) { return null; }
    });

    const [elements, setElements] = useState(() => {
        try {
            const cached = localStorage.getItem(`api_cache_/modules/${moduleId}`);
            return cached ? (JSON.parse(cached).data?.elements || []) : [];
        } catch (e) { return []; }
    });

    const [currentElementIndex, setCurrentElementIndex] = useState(0);
    const [accuracy, setAccuracy] = useState(0);
    const [accuracyHistory, setAccuracyHistory] = useState(new Array(40).fill(5));
    const [isDetecting, setIsDetecting] = useState(false);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);
    const [sessionScore, setSessionScore] = useState(0);
    const [sessionTime, setSessionTime] = useState(0);

    // Si ya tenemos info del cache, no mostramos loading
    const [isLoading, setIsLoading] = useState(!moduleInfo);

    const [practiceTimer, setPracticeTimer] = useState(10);
    const [correctStreak, setCorrectStreak] = useState(0);
    const [isMuted, setIsMuted] = useState(() => localStorage.getItem('app_muted') === 'true');
    const [activeTab, setActiveTab] = useState('guide');
    const [zenMode, setZenMode] = useState(false);
    const [elementsProgress, setElementsProgress] = useState({});
    const [sessionProgress, setSessionProgress] = useState({}); // Progreso de esta sesión específica
    const [isModuleFinished, setIsModuleFinished] = useState(false); // Modal de fin de módulo
    const [showImage, setShowImage] = useState(false);
    const [lastPrediction, setLastPrediction] = useState("");

    // Referencias para evitar cierres obsoletos (stale closures) en onResults
    const isDetectingRef = useRef(isDetecting);
    const isProcessingRef = useRef(isProcessing);
    const isCompletingRef = useRef(isCompleting);
    const currentIndexRef = useRef(currentElementIndex);
    const elementsRef = useRef(elements);

    useEffect(() => { isDetectingRef.current = isDetecting; }, [isDetecting]);
    useEffect(() => { isProcessingRef.current = isProcessing; }, [isProcessing]);
    useEffect(() => { isCompletingRef.current = isCompleting; }, [isCompleting]);
    useEffect(() => { currentIndexRef.current = currentElementIndex; }, [currentElementIndex]);
    useEffect(() => { elementsRef.current = elements; }, [elements]);

    // Referencias MediaPipe
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const videoMobileRef = useRef(null);
    const canvasMobileRef = useRef(null);
    const handsRef = useRef(null);
    const cameraRef = useRef(null);
    const activeItemRef = useRef(null);

    // 0. CARGA DEL MÓDULO Y PROGRESO REAL
    useEffect(() => {
        const fetchModule = async () => {
            try {
                // Solo mostrar loader si no tenemos datos previos
                if (!moduleInfo) setIsLoading(true);

                const data = await moduleService.getModuleBySlug(moduleId);

                // Actualizar estado solo si cambió algo importante (opcional, React maneja diffs)
                setModuleInfo(data);
                const moduleElements = data.elements || [];
                setElements(moduleElements);

                // Cargar progreso desde el backend
                try {
                    const progressData = await progressService.getModuleProgress(data.id);
                    const mappedProgress = {};

                    // Mapear element_id a el índice en el array de elementos para la UI
                    moduleElements.forEach((el, idx) => {
                        const record = progressData.find(p => p.element_id === el.id);
                        if (record) {
                            mappedProgress[idx] = Math.round(record.confidence_score * 100);
                        }
                    });

                    setElementsProgress(mappedProgress);
                    // También guardar en localStorage como redundancia
                    localStorage.setItem(`progress_module_${moduleId}`, JSON.stringify(mappedProgress));
                } catch (pErr) {
                    console.error("Error loading progress from API:", pErr);
                    // Fallback a localStorage
                    const saved = localStorage.getItem(`progress_module_${moduleId}`);
                    if (saved) setElementsProgress(JSON.parse(saved));
                }
            } catch (err) {
                console.error("Error loading module:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchModule();
    }, [moduleId]);

    // Listener para actualizaciones de cache en background
    useEffect(() => {
        const handleCacheUpdate = (event) => {
            if (event.detail && event.detail.url && event.detail.url.includes(`/modules/${moduleId}`)) {
                const newData = event.detail.data;
                // Verificar que los datos sean válidos antes de actualizar el estado
                if (newData) {
                    setModuleInfo(newData);
                    setElements(newData.elements || []);
                }
            }
        };
        window.addEventListener('api-cache-updated', handleCacheUpdate);
        return () => window.removeEventListener('api-cache-updated', handleCacheUpdate);
    }, [moduleId]);

    // SEO: Actualizar título de la página
    useEffect(() => {
        if (moduleInfo) {
            document.title = `${moduleInfo.title} | Aprende Lenguaje de Señas`;
        }
    }, [moduleInfo]);

    // 1. Inicializar MediaPipe Hands
    useEffect(() => {
        if (!isLoading && moduleInfo) {
            handsRef.current = new Hands({
                locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
            });

            handsRef.current.setOptions({
                maxNumHands: 1,
                modelComplexity: 0,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });

            handsRef.current.onResults(onResults);
        }

        return () => {
            if (cameraRef.current) cameraRef.current.stop();
            if (handsRef.current) handsRef.current.close();
        };
    }, [isLoading, moduleInfo]);


    const onResults = async (results) => {
        // OPTIMIZACIÓN DE DIBUJO: Función reutilizable de alto rendimiento
        const drawHand = (ctx, lm, width, height) => {
            // Estilo Neón Premium
            ctx.shadowColor = '#00d2ff';
            ctx.shadowBlur = 15;
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            ctx.beginPath();
            for (const [start, end] of HAND_CONNECTIONS) {
                const p1 = lm[start];
                const p2 = lm[end];
                ctx.moveTo(p1.x * width, p1.y * height);
                ctx.lineTo(p2.x * width, p2.y * height);
            }
            ctx.stroke();

            // Puntos Blancos Brillantes
            ctx.shadowColor = '#ffffff';
            ctx.shadowBlur = 5;
            ctx.fillStyle = '#ffffff';

            for (const point of lm) {
                ctx.beginPath();
                ctx.arc(point.x * width, point.y * height, 4, 0, 2 * Math.PI);
                ctx.fill();
            }
        };

        // Dibujar en ambos canvas si existen (Desktop y Mobile)
        [canvasRef, canvasMobileRef].forEach(ref => {
            if (ref.current) {
                const canvasCtx = ref.current.getContext('2d');
                const w = ref.current.width;
                const h = ref.current.height;

                canvasCtx.save();
                canvasCtx.clearRect(0, 0, w, h);

                if (results.multiHandLandmarks) {
                    for (const landmarks of results.multiHandLandmarks) {
                        drawHand(canvasCtx, landmarks, w, h);
                    }
                }
                canvasCtx.restore();
            }
        });

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];

            if (isDetectingRef.current && !isProcessingRef.current && !isCompletingRef.current) {
                isProcessingRef.current = true;
                setIsProcessing(true);

                const expected = elementsRef.current[currentIndexRef.current]?.name;

                try {
                    const res = await recognitionService.predict(landmarks, moduleId, expected);
                    setLastPrediction(res.prediction);

                    setAccuracy(prev => {
                        // Si enviamos expected_label, res.confidence ya es el porcentaje de similitud
                        // con la seña que el usuario DEBE hacer.
                        const newVal = res.confidence * 100;

                        setAccuracyHistory(h => [...h.slice(1), newVal]);
                        return newVal;
                    });
                } catch (error) {
                    console.error("Error en predicción detectada:", error);
                } finally {
                    setTimeout(() => {
                        isProcessingRef.current = false;
                        setIsProcessing(false);
                    }, 100); // 100ms para alta respuesta
                }
            }
        } else {
            if (isDetectingRef.current) setAccuracy(prev => Math.max(0, prev - 10));
        }
    };

    const toggleCamera = async () => {
        if (isCameraActive) {
            if (cameraRef.current) cameraRef.current.stop();
            setIsCameraActive(false);
            setIsDetecting(false);
        } else {
            try {
                // Seleccionar el video ref que esté disponible (Desktop o Mobile)
                const activeVideo = videoRef.current || videoMobileRef.current;
                if (!cameraRef.current && activeVideo) {
                    cameraRef.current = new MPCamera(activeVideo, {
                        onFrame: async () => {
                            if (handsRef.current) {
                                await handsRef.current.send({ image: activeVideo });
                            }
                        },
                        width: 640,
                        height: 480
                    });
                }
                await cameraRef.current.start();
                setIsCameraActive(true);
            } catch (err) {
                console.error("Error al activar cámara:", err);
                alert("No se pudo acceder a la cámara.");
            }
        }
    };

    // Sincronizar Mute Global
    useEffect(() => {
        localStorage.setItem('app_muted', isMuted);
        if (isMuted) window.speechSynthesis.cancel();
    }, [isMuted]);

    const currentElement = (elements && elements.length > 0 && elements[currentElementIndex])
        ? elements[currentElementIndex]
        : { name: 'Cargando...', image_url: '' };

    // Tema de Color Seguro
    let themeColor = 'blue-500';
    let glowColor = 'rgba(59, 130, 246, 0.5)';
    const glowShadowStyle = {
        boxShadow: `0 0 10px ${glowColor}`
    };
    if (moduleInfo && moduleInfo.color && typeof moduleInfo.color === 'string') {
        const parts = moduleInfo.color.split(' ');
        if (parts.length > 0) themeColor = parts[0].replace('from-', '');
        if (themeColor.includes('green')) glowColor = 'rgba(34, 197, 94, 0.5)';
        else if (themeColor.includes('purple')) glowColor = 'rgba(168, 85, 247, 0.5)';
        else if (themeColor.includes('orange')) glowColor = 'rgba(249, 115, 22, 0.5)';
        else if (themeColor.includes('red')) glowColor = 'rgba(239, 68, 68, 0.5)';
    }

    // --- EFECTOS & LÓGICA ---

    // 1. Timer Global
    useEffect(() => {
        const timer = setInterval(() => setSessionTime(t => t + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    // 2. Scroll Automático
    useEffect(() => {
        if (activeItemRef.current && !zenMode) {
            activeItemRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [currentElementIndex, zenMode]);

    // 3. Atajos de Teclado
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (isCompleting) return;
            switch (e.code) {
                case 'Space': e.preventDefault(); toggleDetection(); break;
                case 'ArrowRight': if (!isDetecting) handleNav('next'); break;
                case 'ArrowLeft': if (!isDetecting) handleNav('prev'); break;
                case 'KeyF': setZenMode(prev => !prev); break;
                default: break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isDetecting, isCompleting, currentElementIndex]);

    // 4. TTS 
    const speak = (text) => {
        if ('speechSynthesis' in window && !isMuted) {
            window.speechSynthesis.cancel();
            const speech = new SpeechSynthesisUtterance(text);
            speech.lang = 'es-ES';
            speech.rate = 1.0;
            window.speechSynthesis.speak(speech);
        }
    };

    // 5. Lógica de Práctica Eliminada (Sustituida por MediaPipe en onResults)

    // 6. Efecto para detectar Éxito
    useEffect(() => {
        if (isDetecting && accuracy > 85 && !isCompleting) {
            handleSuccess(accuracy, 'excelencia');
        }
    }, [accuracy, isDetecting, isCompleting]);

    // 7. Temporizador Regresivo
    useEffect(() => {
        let timerInterval;
        if (isDetecting && !isCompleting) {
            timerInterval = setInterval(() => {
                setPracticeTimer(prevTime => {
                    if (prevTime <= 1) {
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
        } else if (!isCompleting) {
            setPracticeTimer(10);
        }
        return () => clearInterval(timerInterval);
    }, [isDetecting, isCompleting]);

    // 8. Efecto para detectar Fin de Tiempo
    useEffect(() => {
        if (isDetecting && practiceTimer === 0 && !isCompleting) {
            handleSuccess(accuracy, 'timeout');
        }
    }, [practiceTimer, isDetecting, isCompleting, accuracy]);

    // --- ACCIONES ---

    const handleSuccess = (finalScore, reason) => {
        setIsCompleting(true);
        setIsDetecting(false);
        setPracticeTimer(10);

        const scoreInt = Math.round(finalScore);

        // Actualizar progreso de ESTA sesión (siempre se sobreescribe para mostrar avance actual)
        const newSessionProgress = {
            ...sessionProgress,
            [currentElementIndex]: scoreInt
        };
        setSessionProgress(newSessionProgress);

        // Actualizar RÉCORD de maestría (solo si la nota es mayor) - "El Record" que pide el user
        const currentBest = elementsProgress[currentElementIndex] || 0;
        if (scoreInt > currentBest) {
            const newMastery = {
                ...elementsProgress,
                [currentElementIndex]: scoreInt
            };
            setElementsProgress(newMastery);
            localStorage.setItem(`progress_module_${moduleId}`, JSON.stringify(newMastery));

        }

        setSessionScore(s => s + (50 + (correctStreak * 10)));
        setCorrectStreak(s => s + 1);
        if (reason === 'excelencia') speak(`¡Perfecto! Dominado.`);
        else speak(`Tiempo terminado. Nota: ${scoreInt}.`);

        setTimeout(async () => {
            if (currentElementIndex < elements.length - 1) {
                setCurrentElementIndex(i => i + 1);
                setAccuracy(10);
                setPracticeTimer(10);
                setAccuracyHistory(new Array(40).fill(5));
                setIsCompleting(false);
            } else {
                speak("Módulo finalizado.");
                // NOTA: Pasamos el progreso final explícitamente para asegurar que el último elemento se guarde
                await finishSession(newSessionProgress);
            }
        }, 2000);
    };

    const finishSession = async (finalSessionState) => {
        try {
            // Usar el estado pasado o el actual
            const currentProgress = finalSessionState || sessionProgress;

            // Calcular precisión media de ESTA sesión (Basado en el estándar de maestría del 90%)
            const sessionMastery = calculateMastery(currentProgress);

            // Payload para el historial de sesiones (todas las sesiones se guardan)
            const elementsProgressPayload = elements.map((el, idx) => {
                const score = currentProgress[idx] !== undefined ? currentProgress[idx] : (currentProgress[String(idx)] || 0);
                return {
                    element_id: el.id,
                    status: score >= 85 ? 'completed' : 'pending',
                    confidence_score: score / 100
                };
            });

            const sessionPayload = {
                module_id: moduleInfo.id,
                score: sessionScore,
                accuracy: sessionMastery, // Enviamos el porcentaje de maestría (0-100)
                duration_seconds: sessionTime,
                xp_gained: Math.round(sessionScore / 2),
                elements_progress: elementsProgressPayload
            };

            await progressService.saveSession(sessionPayload);
            setIsModuleFinished(true); // Mostrar modal de resultados
            if (cameraRef.current) cameraRef.current.stop();
            setIsCameraActive(false);
        } catch (err) {
            console.error("Error finishing session:", err);
            setIsModuleFinished(true); // Mostrar modal incluso con error para permitir salir/reiniciar
        }
    };

    const restartModule = () => {
        setCurrentElementIndex(0);
        setSessionProgress({});
        setSessionScore(0);
        setSessionTime(0);
        setIsModuleFinished(false);
        setIsCompleting(false);
        setAccuracy(10);
        setPracticeTimer(10);
        setCorrectStreak(0);
        // La cámara se reinicia manualmente al darle al botón de play o auto si está activo
    };

    const toggleDetection = () => {
        if (!isCameraActive) {
            toggleCamera();
            setTimeout(() => setIsDetecting(true), 1000);
            return;
        }

        if (isDetecting) {
            setIsDetecting(false);
            speak("Pausa.");
            setPracticeTimer(10);
        } else {
            setIsDetecting(true);
            setAccuracy(10);
            setPracticeTimer(10);
            speak("Analizando...");
        }
    };

    const handleNav = (dir) => {
        if (isDetecting) return;
        const newIdx = dir === 'next' ? currentElementIndex + 1 : currentElementIndex - 1;
        if (newIdx >= 0 && newIdx < elements.length) {
            setCurrentElementIndex(newIdx);
            setAccuracy(0);
            setAccuracyHistory(new Array(40).fill(5));
        }
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    // Cálculo de Progreso PONDERADO (Estándar de Maestría: 90% de nota -> 100% de progreso del elemento)
    const calculateMastery = (progressObj) => {
        if (!elements.length) return 0;
        const totalMasteryPoints = Object.values(progressObj).reduce((acc, score) => {
            const mastery = Math.min(100, (score / 90) * 100);
            return acc + mastery;
        }, 0);
        return Math.round(totalMasteryPoints / elements.length);
    };

    // Progreso RÉCORD (Histórico)
    const recordProgress = calculateMastery(elementsProgress);

    // Progreso SESIÓN (Tiempo real)
    const sessionFinishedMastery = calculateMastery(sessionProgress);
    const liveContribution = (Math.min(100, (accuracy / 90) * 100)) / (elements.length || 1);
    const sessionProgressValue = Math.min(100, Math.round(sessionFinishedMastery + liveContribution));

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#050b14] flex flex-col items-center justify-center space-y-4">
                <div className={`w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin`}></div>
                <p className="text-white/40 font-bold animate-pulse uppercase tracking-[0.2em] text-xs">Sincronizando con la red neuronal...</p>
            </div>
        );
    }

    if (!moduleInfo) return <ModuleNotFound navigate={navigate} />;

    return (
        <div className="min-h-screen lg:h-screen bg-[#050b14] text-white font-sans overflow-y-auto lg:overflow-hidden flex flex-col relative selection:bg-blue-500/30">

            {/* BACKGROUND AMBIENTE */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className={`absolute top-[-20%] left-[20%] w-[50vh] h-[50vh] rounded-full bg-${themeColor} opacity-[0.08] blur-[120px]`}></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[60vh] h-[60vh] rounded-full bg-indigo-900 opacity-[0.05] blur-[100px]"></div>
                <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
            </div>

            {/* --- HEADER --- */}
            <header className="h-14 sm:h-16 flex items-center justify-between px-3 sm:px-6 border-b border-white/5 bg-[#050b14]/80 backdrop-blur-md relative z-50 shrink-0">
                <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                    <button onClick={() => navigate('/dashboard', { state: { scrollToModules: true } })} className="p-1.5 sm:p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors shrink-0">
                        <ArrowLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </button>
                    <div className="h-4 sm:h-6 w-[1px] bg-white/10 hidden sm:block"></div>
                    <div className="min-w-0 flex-1">
                        <div className="flex justify-between items-end mb-1">
                            <h1 className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-white/40 truncate">{moduleInfo.title}</h1>
                            <div className="flex gap-2">
                                <span className="text-[8px] text-white/30 font-black uppercase tracking-widest">Récord: <span className="text-white/60">{recordProgress}%</span></span>
                                <span className={`text-[8px] font-black uppercase tracking-widest text-${themeColor}`}>Sesión: {sessionProgressValue}%</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-white font-bold text-xs sm:text-sm tracking-tight truncate">{currentElement.name}</span>
                            <span className={`px-1 sm:px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-black uppercase bg-${themeColor}/20 text-${themeColor} hidden md:inline-block`}>
                                {moduleInfo.difficulty}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Loading Line - Ahora con dos barras (Fondo record, tope sesión) */}
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white/5">
                    {/* Barra Record (Fondo tenue) */}
                    <div className="absolute inset-0 h-full bg-white/10 transition-all duration-700" style={{ width: `${recordProgress}%` }}></div>
                    {/* Barra Sesión (Brillante) */}
                    <div
                        className={`absolute inset-0 h-full bg-${themeColor} transition-all duration-300 ease-out`}
                        style={glowShadowStyle}></div>
                </div>

                <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                    <div className="hidden md:flex items-center gap-4 text-xs font-bold text-white/40">
                        <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                            <Clock size={12} className={`text-${themeColor}`} />
                            <span className="font-mono">{formatTime(sessionTime)}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                            <Trophy size={12} className="text-yellow-400" />
                            <span>{sessionScore} XP</span>
                        </div>
                    </div>

                    <div className="h-6 w-[1px] bg-white/10 hidden md:block"></div>

                    <button
                        onClick={() => restartModule()}
                        className="p-1.5 sm:p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                        title="Reiniciar Sesión"
                    >
                        <RefreshCw size={16} />
                    </button>

                    <button onClick={() => setZenMode(!zenMode)} className={`p-1.5 sm:p-2 rounded-lg transition-all hidden lg:flex ${zenMode ? 'bg-blue-500 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'}`} title={zenMode ? "Salir de Modo Zen" : "Modo Zen (F)"}>
                        {zenMode ? <Minimize2 size={16} className="sm:w-[18px] sm:h-[18px]" /> : <Maximize2 size={16} className="sm:w-[18px] sm:h-[18px]" />}
                    </button>

                    <button onClick={() => setIsMuted(!isMuted)} className={`p-1.5 sm:p-2 rounded-lg transition-all ${isMuted ? 'text-red-400 bg-red-500/10' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
                        {isMuted ? <VolumeX size={16} className="sm:w-[18px] sm:h-[18px]" /> : <Volume2 size={16} className="sm:w-[18px] sm:h-[18px]" />}
                    </button>
                </div>
            </header>

            {/* MODAL DE RESULTADOS FINAL */}
            {isModuleFinished && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#050b14]/95 backdrop-blur-xl animate-in fade-in duration-500">
                    <div className="w-full max-w-lg bg-slate-900/50 border border-white/10 rounded-[3rem] p-8 lg:p-12 text-center relative overflow-hidden shadow-2xl">
                        <div className={`absolute -top-24 -left-24 w-64 h-64 bg-${themeColor} opacity-10 blur-[100px] animate-pulse`}></div>

                        <div className="relative z-10 space-y-8">
                            <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-white/5 border border-white/10 mb-4 animate-bounce">
                                <Trophy size={48} className="text-yellow-400" />
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tight leading-none">¡Módulo Completado!</h2>
                                <p className="text-white/40 font-bold uppercase tracking-[0.2em] text-[10px]">Has finalizado la lección de {moduleInfo.title}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 py-8">
                                <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-1 relative group hover:bg-white/10 transition-colors">
                                    <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">Precisión Sesión</div>
                                    <div className="text-3xl font-black text-white">
                                        {calculateMastery(sessionProgress)}%
                                    </div>
                                    <div className="text-[8px] font-bold text-white/20 mt-1">
                                        Récord mod.: {recordProgress}%
                                    </div>
                                    {calculateMastery(sessionProgress) > recordProgress && (
                                        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-[8px] font-black px-2 py-1 rounded-full animate-bounce shadow-lg">
                                            ¡NUEVO RÉCORD!
                                        </div>
                                    )}
                                </div>
                                <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-1 text-yellow-400 hover:bg-white/10 transition-colors">
                                    <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">XP Ganado</div>
                                    <div className="text-3xl font-black">+{Math.round(sessionScore / 2)}</div>
                                    <div className="text-[8px] font-bold text-yellow-500/40 mt-1 uppercase tracking-tighter">
                                        ¡Sumando maestría!
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <button
                                    onClick={() => restartModule()}
                                    className="flex-1 py-5 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black text-xs uppercase tracking-[0.2em] border border-white/5 transition-all flex items-center justify-center gap-2"
                                >
                                    <RefreshCw size={14} /> Reintentar
                                </button>
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="flex-1 py-5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
                                >
                                    <ArrowRight size={14} /> Finalizar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- WORKSPACE --- */}
            <div className="flex-1 flex gap-0 overflow-hidden relative z-10 w-full">

                {/* MOBILE LAYOUT (< lg) - Stack: Camera + Horizontal Lessons + Compact Guide */}
                <div className="flex lg:hidden flex-col flex-1 overflow-hidden">
                    {/* Camera Area */}
                    <div className="flex-[2] relative bg-[#03070d] flex items-center justify-center p-2 sm:p-3 overflow-hidden">
                        {/* Marco Tecnológico */}
                        <div className="absolute inset-2 border border-white/10 rounded-2xl pointer-events-none z-20">
                            <div className={`absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-${themeColor} rounded-tl-xl opacity-50`}></div>
                            <div className={`absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-${themeColor} rounded-tr-xl opacity-50`}></div>
                            <div className={`absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-${themeColor} rounded-bl-xl opacity-50`}></div>
                            <div className={`absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-${themeColor} rounded-br-xl opacity-50`}></div>
                        </div>

                        {/* Video Container */}
                        <div className="w-full h-full bg-black rounded-xl relative overflow-hidden shadow-2xl flex flex-col">
                            <video ref={videoMobileRef} className="absolute inset-0 w-full h-full object-cover mirror" playsInline muted />
                            <canvas ref={canvasMobileRef} className="w-full h-full object-cover mirror absolute inset-0 z-10" width="640" height="480" />
                            <div className="absolute inset-0 opacity-15 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

                            {/* Status Badge */}
                            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30">
                                <span className={`px-2 py-1 rounded-full backdrop-blur-xl border text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 ${isDetecting ? 'bg-red-500/10 border-red-500 text-red-500' : 'bg-white/5 border-white/10 text-white/30'}`}>
                                    <div className={`w-1 h-1 rounded-full ${isDetecting ? 'bg-red-500 animate-pulse' : 'bg-white/30'}`}></div>
                                    {isDetecting ? `${practiceTimer}s` : 'Espera'}
                                </span>
                            </div>

                            {/* HUD Porcentaje */}
                            {isDetecting && (
                                <div className="absolute top-2 right-2 z-20 animate-in fade-in zoom-in duration-300">
                                    <div className="relative bg-black/60 backdrop-blur-md rounded-full p-1 border border-white/10 shadow-xl w-14 h-14 flex items-center justify-center shrink-0 aspect-square">
                                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 56 56">
                                            <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/10" />
                                            <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="transparent"
                                                className={`${accuracy > 90 ? 'text-green-500' : accuracy > 70 ? 'text-yellow-500' : 'text-red-500'} transition-all`}
                                                strokeDasharray={2 * Math.PI * 24}
                                                strokeDashoffset={2 * Math.PI * 24 * (1 - accuracy / 100)}
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-sm font-black text-white font-mono">{Math.round(accuracy)}%</span>
                                        </div>
                                    </div>
                                    <div className="mt-1 bg-black/40 backdrop-blur rounded px-2 py-0.5 border border-white/5 text-[8px] font-bold text-center uppercase text-white/60">
                                        Detectado: <span className="text-white">{lastPrediction || '---'}</span>
                                    </div>
                                </div>
                            )}

                            {/* Contenido Central */}
                            <div className="flex-1 flex items-center justify-center z-10 relative">
                                {!isDetecting && !isCompleting && (
                                    <div className="text-center">
                                        <Camera size={40} className="text-white/10 mx-auto mb-2" />
                                        <p className="text-white/30 text-xs">Presiona <span className="text-white font-bold">ESPACIO</span></p>
                                    </div>
                                )}
                                {isCompleting && (
                                    <div className="flex flex-col items-center">
                                        <CheckCircle size={48} className="text-emerald-400 mb-2" />
                                        <h2 className="text-2xl font-black text-white">¡PERFECTO!</h2>
                                    </div>
                                )}
                            </div>

                            {/* Mini Spectral */}
                            <div className="h-16 w-full flex items-end gap-[1px] px-2 pb-0 opacity-30">
                                {accuracyHistory.map((val, i) => (
                                    <div key={i} className={`flex-1 ${val > 80 ? 'bg-green-400' : 'bg-white/30'} rounded-t-[1px]`} style={{ height: `${val}%` }}></div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="h-14 px-2 pb-2 flex items-center justify-center gap-2 bg-[#03070d] shrink-0">
                        <button onClick={() => handleNav('prev')} disabled={currentElementIndex === 0 || isDetecting} className="h-10 w-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white/50 disabled:opacity-20 shrink-0">
                            <ArrowLeft size={16} />
                        </button>
                        <button
                            onClick={toggleCamera}
                            className={`h-10 w-10 rounded-xl border flex items-center justify-center transition-all shrink-0 ${isCameraActive ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-white/5 border-white/5 text-white/40'}`}
                            title={isCameraActive ? "Apagar Cámara" : "Encender Cámara"}
                        >
                            {isCameraActive ? <CameraOff size={16} /> : <Camera size={16} />}
                        </button>
                        <button onClick={toggleDetection} disabled={isCompleting} className={`h-10 px-6 flex-1 max-w-xs rounded-xl font-black text-xs uppercase tracking-wider ${isDetecting ? 'bg-slate-800 text-red-500 border border-red-500/30' : `bg-gradient-to-r ${moduleInfo.color} text-white`}`}>
                            {isDetecting ? 'PAUSAR' : 'PRACTICAR'}
                        </button>
                        <button onClick={() => handleNav('next')} disabled={currentElementIndex === elements.length - 1 || isDetecting} className="h-10 w-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white/50 disabled:opacity-20 shrink-0">
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="px-3 py-2 bg-slate-900/50 border-t border-white/5 shrink-0">
                        <div className="flex items-center justify-between mb-1.5 text-[9px] font-black uppercase tracking-widest">
                            <span className="text-white/30">Progreso Sesión</span>
                            <div className="flex gap-2">
                                <span className="text-white/20">Récord: {recordProgress}%</span>
                                <span className={`text-${themeColor}`}>{sessionProgressValue}%</span>
                            </div>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden relative">
                            <div className="absolute inset-0 bg-white/10" style={{ width: `${recordProgress}%` }}></div>
                            <div
                                className={`absolute h-full bg-${themeColor} transition-all duration-300`}
                                style={{ boxShadow: `0 0 8px ${glowColor}` }}
                            ></div>
                        </div>
                    </div>

                    {/* Reference Image - Mobile (Larger/Better) */}
                    <div className="px-3 py-2 bg-slate-900/50 border-t border-white/5 shrink-0">
                        <div className="w-full bg-black/40 rounded-xl border border-white/10 overflow-hidden relative">
                            {/* Header compacto */}
                            <div className="absolute top-2 left-2 z-10 bg-black/60 backdrop-blur px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider text-white/70 border border-white/10">
                                Referencia
                            </div>

                            {/* Imagen Grande */}
                            <div className="aspect-[16/9] w-full relative bg-gray-900 flex items-center justify-center">
                                {currentElement.image_url ? (
                                    <img
                                        src={currentElement.image_url}
                                        className="w-full h-full object-contain p-4"
                                        alt={currentElement.name}
                                    />
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-white/20">
                                        <Camera size={32} />
                                        <span className="text-xs font-medium">Sin imagen</span>
                                    </div>
                                )}
                            </div>

                            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/80 to-transparent p-3 pt-6 flex flex-col gap-1">
                                <div className="flex justify-between items-end">
                                    <span className="text-lg font-black text-white drop-shadow-md">{currentElement.name}</span>
                                    {currentElement.image_url && (
                                        <button
                                            onClick={() => setShowImage(!showImage)}
                                            className="bg-white/10 hover:bg-white/20 p-1.5 rounded-lg backdrop-blur text-white/70 transition-colors"
                                        >
                                            {showImage ? <div className="text-[10px] font-bold">OCULTAR</div> : <div className="text-[10px] font-bold">VER</div>}
                                        </button>
                                    )}
                                </div>
                                <p className="text-[10px] text-white/50 line-clamp-1">{currentElement.description}</p>
                            </div>
                        </div>
                    </div>

                    {/* Horizontal Lesson Scroll */}
                    <div className="flex-1 bg-[#070e1a]/50 overflow-x-auto overflow-y-hidden border-t border-white/5 shrink-0">
                        <div className="flex gap-2 p-3 h-full">
                            {elements.map((el, idx) => {
                                const isCurrent = currentElementIndex === idx;
                                const score = elementsProgress[idx];
                                const isCompleted = score !== undefined;
                                return (
                                    <button key={idx} onClick={() => !isDetecting && setCurrentElementIndex(idx)} className={`flex flex-col items-center justify-center min-w-[70px] h-full rounded-xl border-2 transition-all ${isCurrent ? `border-${themeColor} bg-${themeColor}/10` : 'border-white/5 bg-white/5'}`}>
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-sm mb-1 ${isCompleted ? score > 90 ? 'bg-green-500 text-white' : 'bg-yellow-500 text-black' : 'bg-slate-800 text-white/40'}`}>
                                            {isCompleted ? Math.round(score) : idx + 1}
                                        </div>
                                        <div className="text-[10px] font-bold text-white/70 truncate w-full px-1 text-center">{el.name}</div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* LEFT SIDEBAR - Desktop only */}
                <div className={`
                    ${zenMode ? 'lg:-ml-[260px] lg:opacity-0 lg:pointer-events-none' : ''}
                    hidden lg:flex lg:w-[260px] 
                    flex-col 
                    border-r border-white/5 
                    bg-[#070e1a]/50 backdrop-blur-sm 
                    transition-all duration-500
                `}>
                    <div className="p-3 sm:p-4 border-b border-white/5 shrink-0 bg-slate-900/50 lg:sticky lg:top-0 z-10">
                        <div className="flex items-center justify-between mb-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest">
                            <span className="text-white/30">Sesión / Récord</span>
                            <div className="flex gap-2">
                                <span className={`text-${themeColor}`}>{sessionProgressValue}%</span>
                                <span className="text-white/20 border-l border-white/10 pl-2">{recordProgress}%</span>
                            </div>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden relative">
                            <div className="absolute inset-0 bg-white/10" style={{ width: `${recordProgress}%` }}></div>
                            <div className={`absolute h-full bg-${themeColor} transition-all duration-300 shadow-[0_0_8px_${glowColor}]`} style={{ width: `${sessionProgressValue}%` }}></div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {elements.map((el, idx) => {
                            const isCurrent = currentElementIndex === idx;
                            const score = elementsProgress[idx]; // Récord Histórico
                            const sessionScore = sessionProgress[idx]; // Progreso Sesión Actual

                            const isCompleted = score !== undefined;
                            const isSessionCompleted = sessionScore !== undefined;

                            const label = score > 90 ? 'Excelente' : score > 70 ? 'Bueno' : 'Regular';
                            const labelColor = score > 90 ? 'text-green-400 bg-green-400/10 border-green-400/20' : score > 70 ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' : 'text-red-400 bg-red-400/10 border-red-400/20';

                            return (
                                <button
                                    key={idx}
                                    ref={isCurrent ? activeItemRef : null}
                                    onClick={() => !isDetecting && setCurrentElementIndex(idx)}
                                    className={`w-full text-left p-3.5 border-l-2 transition-all hover:bg-white/5 flex items-center gap-3 group relative ${isCurrent
                                        ? `border-${themeColor} bg-white/[0.04]`
                                        : 'border-transparent opacity-60 hover:opacity-100'
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded shrink-0 flex items-center justify-center text-[9px] font-black border transition-all ${isSessionCompleted
                                        ? 'bg-blue-500 border-blue-500 text-white'
                                        : isCompleted
                                            ? 'bg-white/10 border-white/20 text-white/40' // Record existente pero no hecho en esta sesión
                                            : isCurrent
                                                ? `border-${themeColor} text-${themeColor}`
                                                : 'border-white/20 text-white/40'
                                        }`}>
                                        {isSessionCompleted ? <Check size={14} /> : idx + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className={`text-xs font-bold truncate ${isCurrent ? 'text-white' : 'text-white/70'}`}>{el.name}</div>
                                        {isCompleted && (
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className={`text-[8px] font-black uppercase tracking-wider inline-block px-1.5 py-0.5 rounded border ${labelColor}`}>
                                                    Récord: {Math.round(score)}%
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {isCurrent && <div
                                        className={`absolute right-3 w-1.5 h-1.5 rounded-full bg-${themeColor}`}
                                        style={{ boxShadow: `0 0 8px ${glowColor}` }}
                                    ></div>
                                    }
                                </button>
                            );
                        })}
                    </div>

                    <div className="p-3 border-t border-white/5 text-[9px] text-white/20 uppercase tracking-widest text-center hidden xl:block">
                        <Keyboard size={10} className="inline mr-1" /> Flechas para navegar
                    </div>
                </div>

                {/* 2. ÁREA CENTRAL (Cámara) - Desktop only */}
                <div className="hidden lg:flex lg:flex-1 flex-col relative bg-[#03070d] min-w-0">

                    {/* Viewport de Cámara */}
                    <div className="flex-1 relative flex items-center justify-center p-2 sm:p-4 lg:p-6 overflow-hidden">

                        {/* Marco Tecnológico */}
                        <div className="absolute inset-2 sm:inset-4 lg:inset-6 border border-white/10 rounded-2xl lg:rounded-[2rem] pointer-events-none z-20 transition-all duration-500">
                            <div className={`absolute top-0 left-0 w-4 h-4 sm:w-6 sm:h-6 border-t-2 border-l-2 border-${themeColor} rounded-tl-xl opacity-50`}></div>
                            <div className={`absolute top-0 right-0 w-4 h-4 sm:w-6 sm:h-6 border-t-2 border-r-2 border-${themeColor} rounded-tr-xl opacity-50`}></div>
                            <div className={`absolute bottom-0 left-0 w-4 h-4 sm:w-6 sm:h-6 border-b-2 border-l-2 border-${themeColor} rounded-bl-xl opacity-50`}></div>
                            <div className={`absolute bottom-0 right-0 w-4 h-4 sm:w-6 sm:h-6 border-b-2 border-r-2 border-${themeColor} rounded-br-xl opacity-50`}></div>
                        </div>

                        {/* Contenedor de Video */}
                        <div className="w-full h-full bg-black rounded-xl lg:rounded-[1.5rem] relative overflow-hidden shadow-2xl flex flex-col transition-all duration-300">
                            <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover mirror" playsInline muted />
                            <canvas ref={canvasRef} className="w-full h-full object-cover mirror absolute inset-0 z-10" width="640" height="480" />
                            {/* Grid BG Pattern */}
                            <div className="absolute inset-0 opacity-15 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>

                            {/* Status Badge Top */}
                            <div className="absolute top-3 sm:top-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 pointer-events-none">
                                <span className={`px-2 sm:px-4 py-1 sm:py-1.5 rounded-full backdrop-blur-xl border text-[9px] sm:text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-colors duration-300 ${isDetecting ? 'bg-red-500/10 border-red-500 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'bg-white/5 border-white/10 text-white/30'
                                    }`}>
                                    <div className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${isDetecting ? 'bg-red-500 animate-[ping_1.5s_infinite]' : 'bg-white/30'}`}></div>
                                    {isDetecting ? `${practiceTimer}s` : <><span className="hidden sm:inline">Cámara en Espera</span><span className="sm:hidden">Espera</span></>}
                                </span>
                            </div>

                            {/* HUD Porcentaje (ESQUINA SUPERIOR DERECHA) */}
                            {/* HUD Porcentaje (ESQUINA SUPERIOR DERECHA) */}
                            {isDetecting && (
                                <div className="absolute top-3 sm:top-6 right-3 sm:right-6 z-20 pointer-events-none animate-in fade-in zoom-in duration-300">
                                    <div className="relative bg-black/60 backdrop-blur-md rounded-full p-1 sm:p-2 border border-white/10 shadow-2xl flex items-center justify-center aspect-square shrink-0">
                                        {/* Circulo de Progreso SVG */}
                                        <svg className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 transform -rotate-90 block" viewBox="0 0 80 80">
                                            <circle cx="40" cy="40" r="32" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/10" />
                                            <circle cx="40" cy="40" r="32" stroke="currentColor" strokeWidth="4" fill="transparent"
                                                className={`${accuracy > 90 ? 'text-green-500' : accuracy > 70 ? 'text-yellow-500' : 'text-red-500'} transition-all duration-200`}
                                                strokeDasharray={2 * Math.PI * 32}
                                                strokeDashoffset={2 * Math.PI * 32 * (1 - accuracy / 100)}
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                                            <span className="text-base sm:text-xl lg:text-2xl font-black text-white tracking-tighter font-mono">
                                                {Math.round(accuracy)}%
                                            </span>
                                        </div>
                                    </div>
                                    {/* Calificación Textual Debajo */}
                                    <div className={`mt-1 sm:mt-2 text-center text-[8px] sm:text-[10px] font-black uppercase tracking-widest px-1.5 sm:px-2 py-0.5 sm:py-1 rounded border backdrop-blur-md transform transition-all ${accuracy > 90 ? 'bg-green-500/20 border-green-500 text-green-400' :
                                        accuracy > 70 ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400' :
                                            'bg-red-500/20 border-red-500 text-red-400'
                                        }`}>
                                        {accuracy > 90 ? 'Excelente' : accuracy > 70 ? 'Bien' : 'Mejorable'}
                                    </div>
                                </div>
                            )}

                            {/* Contenido Central */}
                            <div className="flex-1 flex items-center justify-center z-10 relative">
                                {!isDetecting && !isCompleting && (
                                    <div className="text-center animate-in fade-in zoom-in duration-500">
                                        <div className={`w-24 h-24 sm:w-40 sm:h-40 rounded-full bg-gradient-to-tr ${moduleInfo.color} opacity-10 blur-[60px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none`}></div>
                                        <Camera size={48} className="sm:w-16 sm:h-16 text-white/10 mx-auto mb-3 sm:mb-4 relative z-10" />
                                        <p className="text-white/30 text-xs sm:text-sm font-medium px-4">Presiona <span className="text-white font-bold border-b border-white/20">ESPACIO</span></p>
                                    </div>
                                )}
                                {isCompleting && (
                                    <div className="flex flex-col items-center animate-in zoom-in duration-300">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-emerald-500 blur-[40px] opacity-40 rounded-full animate-pulse"></div>
                                            <CheckCircle size={64} className="sm:w-24 sm:h-24 text-emerald-400 relative z-10 drop-shadow-xl" />
                                        </div>
                                        <h2 className="text-3xl sm:text-5xl font-black text-white italic tracking-tighter mt-4 sm:mt-6 drop-shadow-lg">¡PERFECTO!</h2>
                                    </div>
                                )}
                            </div>

                            {/* HUD Bottom: Gráficas Espectrales */}
                            <div className="h-20 sm:h-32 lg:h-40 w-full flex items-end gap-[1px] px-2 sm:px-4 lg:px-8 pb-0 opacity-30 pointer-events-none">
                                {accuracyHistory.map((val, i) => {
                                    const h = val;
                                    const colorClass = h > 80 ? 'bg-green-400' : h > 50 ? 'bg-yellow-400' : 'bg-white';
                                    return (
                                        <div key={i} className={`flex-1 transition-all duration-[120ms] ${colorClass} rounded-t-[1px]`} style={{ height: `${val}%` }}></div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Barra de Controles Flotante */}
                    <div className="h-16 sm:h-20 px-2 sm:px-4 lg:px-8 pb-2 sm:pb-4 flex items-center justify-center gap-2 sm:gap-4 shrink-0">
                        <button
                            onClick={() => handleNav('prev')}
                            disabled={currentElementIndex === 0 || isDetecting}
                            className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-white/50 hover:text-white transition-all disabled:opacity-20 active:scale-95 shrink-0"
                            title="Anterior"
                        >
                            <ArrowLeft size={18} className="sm:w-[22px] sm:h-[22px]" />
                        </button>

                        <button
                            onClick={toggleCamera}
                            className={`h-12 w-12 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl border flex items-center justify-center transition-all shrink-0 ${isCameraActive ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-white/5 border-white/10 text-white/30 hover:text-white hover:bg-white/10'}`}
                            title={isCameraActive ? "Apagar Cámara" : "Encender Cámara"}
                        >
                            {isCameraActive ? <CameraOff size={24} /> : <Camera size={24} />}
                        </button>
                        <button
                            onClick={toggleDetection}
                            disabled={isCompleting}
                            className={`h-12 sm:h-14 px-6 sm:px-12 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center gap-3 shadow-xl ${isDetecting
                                ? 'bg-slate-800 text-red-500 border border-red-500/30'
                                : `bg-gradient-to-r ${moduleInfo.color} text-white shadow-${themeColor}/20`
                                }`}
                        >
                            {isDetecting ? <><Pause size={20} className="sm:w-6 sm:h-6" /> PAUSAR</> : <><Play size={20} className="sm:w-6 sm:h-6" /> PRACTICAR</>}
                        </button>

                        <button
                            onClick={() => handleNav('next')}
                            disabled={currentElementIndex === elements.length - 1 || isDetecting}
                            className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-white/50 hover:text-white transition-all disabled:opacity-20 active:scale-95 shrink-0"
                            title="Siguiente"
                        >
                            <ChevronRight size={18} className="sm:w-[22px] sm:h-[22px]" />
                        </button>
                    </div>

                </div>

                {/* 3. SIDEBAR DERECHA (Información) - Hidden on mobile */}
                <div className={`
                    ${zenMode ? 'lg:-mr-[300px] lg:opacity-0 lg:pointer-events-none' : ''}
                    hidden lg:flex lg:w-[300px] 
                    bg-[#070e1a]/50 backdrop-blur-sm 
                    border-l border-white/5 
                    flex-col 
                    transition-all duration-500
                `}>

                    {/* Tabs */}
                    <div className="flex border-b border-white/5 shrink-0 sticky top-0 bg-slate-900/50 z-10">
                        <button
                            onClick={() => setActiveTab('guide')}
                            className={`flex-1 py-3 lg:py-4 text-[10px] font-bold uppercase tracking-widest transition-all relative ${activeTab === 'guide' ? 'text-white' : 'text-white/30 hover:text-white/60'}`}
                        >
                            Guía Visual
                            {activeTab === 'guide' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-500 shadow-[0_-2px_6px_rgba(59,130,246,0.5)]"></div>}
                        </button>
                        <button
                            onClick={() => setActiveTab('stats')}
                            className={`flex-1 py-3 lg:py-4 text-[10px] font-bold uppercase tracking-widest transition-all relative ${activeTab === 'stats' ? 'text-white' : 'text-white/30 hover:text-white/60'}`}
                        >
                            Métricas
                            {activeTab === 'stats' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-500 shadow-[0_-2px_6px_rgba(59,130,246,0.5)]"></div>}
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-6">
                        {activeTab === 'guide' ? (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">

                                {/* Info Lección */}
                                <div>
                                    <div className="flex items-center gap-2 mb-2 text-white/40">
                                        <Hash size={12} /> <span className="text-[10px] uppercase font-bold tracking-widest">Lección {currentElementIndex + 1}</span>
                                    </div>
                                    <h2 className="text-2xl font-black text-white leading-tight">{currentElement.name}</h2>
                                </div>

                                {/* Referencia Visual */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">Referencia</span>
                                        {showImage && <div className="flex gap-1"><span className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></span><span className="text-[9px] text-green-500 font-bold uppercase">Live</span></div>}
                                    </div>
                                    <div className="aspect-[4/3] bg-black rounded-xl overflow-hidden border border-white/10 relative shadow-lg group cursor-pointer" onClick={() => setShowImage(!showImage)}>
                                        {showImage ? (
                                            currentElement.image_url ? (
                                                <img src={currentElement.image_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100" alt="Ref" />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-white/10 gap-2 group-hover:text-white/20 transition-colors">
                                                    <Image size={32} />
                                                    <span className="text-[9px] font-bold uppercase">Sin Imagen</span>
                                                </div>
                                            )
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-white/20">
                                                <span className="text-[10px] uppercase font-bold">Oculto</span>
                                            </div>
                                        )}
                                        {showImage && <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent h-[20%] w-full animate-[scan_3s_linear_infinite] pointer-events-none opacity-30"></div>}
                                    </div>
                                </div>

                                {/* Instrucciones */}
                                <div className="bg-white/5 rounded-xl p-4 border border-white/5 space-y-2 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <h3 className="text-white/60 font-bold text-xs flex items-center gap-2 uppercase tracking-widest text-[10px]">
                                        <Info size={12} /> Instrucción
                                    </h3>
                                    <p className="text-white/80 text-xs leading-relaxed">
                                        {currentElement.description || "Replica el gesto mostrado en la imagen. Mantén la posición hasta que el porcentaje llegue al 100%."}
                                    </p>
                                </div>

                                {/* Dataset Status */}
                                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 animate-in fade-in slide-in-from-right-6 duration-700">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                                            <Activity size={16} />
                                        </div>
                                        <div>
                                            <div className="text-[10px] uppercase font-black tracking-widest text-white/40">Dataset IA</div>
                                            <div className="text-xs font-bold text-white">{currentElement.captured_count || 0} patrones cargados</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Tips */}
                                <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl p-4 border border-blue-500/10">
                                    <h3 className="text-blue-300 font-bold text-[10px] uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Zap size={10} /> Tips de IA
                                    </h3>
                                    <ul className="space-y-2">
                                        <li className="flex gap-2 text-xs text-blue-100/60 leading-tight">
                                            <span className="w-1 h-1 bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></span>
                                            Iluminación frontal recomendada.
                                        </li>
                                        <li className="flex gap-2 text-xs text-blue-100/60 leading-tight">
                                            <span className="w-1 h-1 bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></span>
                                            Fondo liso mejora la detección.
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                                <div className="bg-white/5 p-5 rounded-2xl border border-white/5 text-center group hover:bg-white/10 transition-colors">
                                    <div className="flex justify-center mb-2"><StarIcon className="text-yellow-400" size={24} /></div>
                                    <div className="text-[10px] uppercase font-black text-white/40 tracking-widest mb-1">XP Sesión</div>
                                    <div className="text-4xl font-black text-white tracking-tighter">{sessionScore}</div>
                                </div>
                                <div className="bg-white/5 p-5 rounded-2xl border border-white/5 text-center group hover:bg-white/10 transition-colors">
                                    <div className="flex justify-center mb-2"><Activity className="text-orange-400" size={24} /></div>
                                    <div className="text-[10px] uppercase font-black text-white/40 tracking-widest mb-1">Mejor Racha</div>
                                    <div className="text-4xl font-black text-white tracking-tighter">{correctStreak}</div>
                                </div>
                                <div className="bg-white/5 p-5 rounded-2xl border border-white/5 text-center group hover:bg-white/10 transition-colors">
                                    <div className="flex justify-center mb-2"><CheckCircle className="text-green-400" size={24} /></div>
                                    <div className="text-[10px] uppercase font-black text-white/40 tracking-widest mb-1">Completadas</div>
                                    <div className="text-4xl font-black text-white tracking-tighter">{Object.keys(elementsProgress).length}</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            <style>{`
                .mirror { transform: scaleX(-1); }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
                @keyframes scan { 0% { transform: translateY(-100%); } 100% { transform: translateY(500%); } }
            `}</style>
        </div >
    );
};

const ModuleNotFound = ({ navigate }) => (
    <div className="h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="text-center p-8 bg-white/5 rounded-3xl border border-white/10">
            <h2 className="text-2xl font-bold mb-4">Módulo no encontrado</h2>
            <button onClick={() => navigate('/dashboard')} className="px-6 py-3 bg-blue-600 rounded-xl font-bold hover:bg-blue-500 transition-colors">Volver al Dashboard</button>
        </div>
    </div>
);

export default ModuleLearning;
