import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Camera, CameraOff, BrainCircuit, Sparkles, Languages,
    History, Volume2, Trash2, Space, ArrowLeft, Trophy,
    CheckCircle2, AlertCircle, Zap, ShieldCheck, RefreshCw
} from 'lucide-react';
import { Hands, HAND_CONNECTIONS } from '@mediapipe/hands';
import { Camera as MPCamera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { recognitionService } from '../api/recognitionService';
import { progressService } from '../api/progressService';
import { moduleService } from '../api/moduleService';

const PracticeMode = () => {
    const { moduleSlug } = useParams();
    const navigate = useNavigate();
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [prediction, setPrediction] = useState({ name: 'Esperando...', confidence: 0 });
    const [topPredictions, setTopPredictions] = useState([]);
    const [sentence, setSentence] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const [lastSessionResult, setLastSessionResult] = useState(null);
    const [stats, setStats] = useState({ accurate: 0, total: 0 });
    const [controlElements, setControlElements] = useState([]);
    const isTriggerHandClosedRef = useRef(false);
    const lastCaptureTimeRef = useRef(0);
    const startTimeRef = useRef(Date.now());
    const currentPredictionRef = useRef({ name: '', confidence: 0 });
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const handsRef = useRef(null);
    const cameraRef = useRef(null);

    // Ayudante: ¿Está la mano cerrada?
    const isHandClosed = (landmarks) => {
        const fingerTips = [8, 12, 16, 20];
        const fingerBases = [6, 10, 14, 18];
        let closedFingers = 0;
        for (let i = 0; i < fingerTips.length; i++) {
            // En MediaPipe, Y crece hacia ABAJO. Punta > Base significa que el dedo baja (se dobla).
            if (landmarks[fingerTips[i]].y > landmarks[fingerBases[i]].y) {
                closedFingers++;
            }
        }
        return closedFingers >= 3;
    };

    const speak = (text) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
        utterance.rate = 1.2;
        window.speechSynthesis.speak(utterance);
    };

    // Inicializar MediaPipe Hands
    useEffect(() => {
        handsRef.current = new Hands({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });

        handsRef.current.setOptions({
            maxNumHands: 2, // Soporte para dos manos
            modelComplexity: 1,
            minDetectionConfidence: 0.6,
            minTrackingConfidence: 0.6
        });

        handsRef.current.onResults(onResults);

        return () => {
            if (cameraRef.current) cameraRef.current.stop();
            if (handsRef.current) handsRef.current.close();
        };
    }, []);

    // Fetch Control Elements (ESPACIO, BORRAR, etc)
    useEffect(() => {
        const fetchControls = async () => {
            try {
                const data = await moduleService.getModuleBySlug('system-controls');
                if (data && data.elements) {
                    // Filtrar solo los comandos
                    const commands = data.elements.filter(e => e.is_command);
                    setControlElements(commands);
                }
            } catch (error) {
                console.error("Error al cargar comandos de control:", error);
            }
        };
        fetchControls();
    }, []);

    const onResults = async (results) => {
        if (!canvasRef.current || !videoRef.current || !canvasRef.current.width) return;

        const canvasCtx = canvasRef.current.getContext('2d');
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        canvasCtx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            let triggerHand = null; // Pantalla Izquierda (Mano Der real)
            let signerHand = null;  // Pantalla Derecha (Mano Izq real)

            results.multiHandLandmarks.forEach((landmarks, index) => {
                const handedness = results.multiHandedness[index];
                // El usuario quiere otra vez: DERECHA = Signante, IZQUIERDA = Gatillo
                if (handedness.label === 'Right') signerHand = landmarks;
                else triggerHand = landmarks;

                drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, { color: '#00d2ff', lineWidth: 2 });
                drawLandmarks(canvasCtx, landmarks, { color: '#ffffff', lineWidth: 1, radius: 3 });
            });

            // GATILLO: MANO IZQUIERDA (Captura)
            if (triggerHand) {
                const closed = isHandClosed(triggerHand);
                const now = Date.now();
                if (closed && !isTriggerHandClosedRef.current) {
                    isTriggerHandClosedRef.current = true;
                    if (now - lastCaptureTimeRef.current > 1500) {
                        const word = currentPredictionRef.current.name;
                        if (word && word !== 'Esperando...' && word !== 'Desconocido') {
                            setSentence(prev => [...prev, word]);
                            speak(word);
                            lastCaptureTimeRef.current = now;
                        }
                    }
                } else if (!closed) {
                    isTriggerHandClosedRef.current = false;
                }
            }

            // TRADUCTOR: MANO DERECHA (Predicción)
            if (signerHand) {
                if (!isProcessing) {
                    setIsProcessing(true);
                    try {
                        const res = await recognitionService.predict(signerHand, null);
                        if (res.top_3) {
                            const newPred = { name: res.prediction, confidence: res.confidence };
                            setPrediction(newPred);
                            setTopPredictions(res.top_3);
                            currentPredictionRef.current = newPred;
                        }
                    } catch (error) {
                        console.error("Error en predicción:", error);
                    } finally {
                        setTimeout(() => setIsProcessing(false), 500);
                    }
                }
            } else {
                setPrediction({ name: 'Esperando...', confidence: 0 });
                setTopPredictions([]);
                currentPredictionRef.current = { name: '', confidence: 0 };
            }
        } else {
            setPrediction({ name: 'Esperando...', confidence: 0 });
            setTopPredictions([]);
        }
        canvasCtx.restore();
    };

    const toggleCamera = async () => {
        if (isCameraActive) {
            if (cameraRef.current) await cameraRef.current.stop();
            setIsCameraActive(false);
            setPrediction({ name: 'Esperando...', confidence: 0 });
            setTopPredictions([]);
        } else {
            try {
                if (!cameraRef.current && videoRef.current) {
                    cameraRef.current = new MPCamera(videoRef.current, {
                        onFrame: async () => {
                            await handsRef.current.send({ image: videoRef.current });
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

    const handleCapture = () => {
        const now = Date.now();
        if (now - lastCaptureTimeRef.current < 1000) return; // Cooldown manual

        if (prediction.name && prediction.name !== 'Esperando...' && prediction.name !== 'Desconocido') {
            setSentence(prev => [...prev, prediction.name]);
            speak(prediction.name);
            lastCaptureTimeRef.current = now;
        }
    };

    const clearSentence = () => {
        setSentence([]);
        window.speechSynthesis.cancel();
    };

    const handleSaveSession = async () => {
        if (sentence.length === 0) {
            alert("No hay señas capturadas para guardar.");
            return;
        }

        setIsSaving(true);
        try {
            const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
            const xp = Math.min(50, sentence.length * 2);
            const sessionData = {
                module_id: null,
                score: sentence.length,
                accuracy: 0.0,
                duration_seconds: duration,
                xp_gained: xp,
                elements_progress: sentence.map((word) => ({
                    element_id: null,
                    status: word,
                    confidence_score: 0.5
                }))
            };

            await progressService.saveSession(sessionData);
            setLastSessionResult({
                words: sentence.length,
                xp: xp,
                time: `${Math.floor(duration / 60)}m ${duration % 60}s`,
                sentence: sentence.join(' ')
            });
            setShowCompletionModal(true);
        } catch (error) {
            console.error("Error al guardar sesión:", error);
            alert("No se pudo guardar la sesión.");
        } finally {
            setIsSaving(false);
        }
    };

    const speakSentence = () => {
        if (sentence.length === 0) return;
        window.speechSynthesis.cancel(); // Resetear
        const text = sentence.join(' ');
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-blue-500/30">
            {/* Header / Nav */}
            <div className="border-b border-white/5 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
                    <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-white/60 hover:text-white transition-all group min-w-0">
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform shrink-0" />
                        <span className="truncate text-sm sm:text-base">Panel</span>
                    </button>
                    <div className="flex items-center gap-3 shrink-0">
                        <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] sm:text-xs font-bold flex items-center gap-2 whitespace-nowrap">
                            <Zap size={12} fill="currentColor" />
                            <span className="hidden xs:inline">MODO PRÁCTICA LIVE</span>
                            <span className="xs:hidden">LIVE</span>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-2 sm:px-6 py-4 sm:py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 mt-2">

                {/* Panel Izquierdo: Cámara & Traductor */}
                <div className="lg:col-span-8 space-y-4 sm:space-y-6">
                    <div className="relative aspect-[3/4] xs:aspect-[4/3] sm:aspect-video bg-black rounded-[2rem] sm:rounded-3xl border border-white/10 shadow-2xl overflow-hidden group">

                        {/* Feed Real */}
                        <video ref={videoRef} className="hidden" />
                        <canvas ref={canvasRef} className="w-full h-full object-cover mirror" width="640" height="480" />

                        {!isCameraActive && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm z-10">
                                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">
                                    <CameraOff size={40} className="text-white/20" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Cámara Desactivada</h3>
                                <p className="text-white/40 mb-6 text-center max-w-xs">Activa tu cámara para comenzar el reconocimiento por IA</p>
                                <button
                                    onClick={toggleCamera}
                                    className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-full font-bold flex items-center gap-3 transition-all shadow-lg shadow-blue-600/20"
                                >
                                    <Camera size={20} />
                                    Activar Cámara
                                </button>
                            </div>
                        )}

                        {/* Overlay: Análisis en tiempo real */}
                        {isCameraActive && (
                            <>
                                <div className="absolute top-3 sm:top-6 left-3 sm:left-6 z-20 pointer-events-none max-w-[calc(100%-24px)]">
                                    <div className="flex flex-col gap-2 sm:gap-3">
                                        <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4 animate-in fade-in slide-in-from-left duration-500">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/20 rounded-lg sm:rounded-xl flex items-center justify-center border border-blue-500/30 shrink-0">
                                                <BrainCircuit size={20} className="text-blue-400 animate-pulse sm:w-[24px] sm:h-[24px]" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-blue-400/60 text-[8px] sm:text-[10px] uppercase tracking-widest font-bold">IA</p>
                                                <h4 className="text-xl sm:text-2xl font-black text-white uppercase truncate">{prediction.name}</h4>
                                            </div>
                                        </div>
                                        <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-lg sm:rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 flex items-center gap-2 sm:gap-3">
                                            <div className="w-full bg-white/10 h-1 sm:h-1.5 rounded-full overflow-hidden flex-1">
                                                <div
                                                    className="bg-blue-500 h-full transition-all duration-300"
                                                    style={{ width: `${prediction.confidence * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-[10px] sm:text-xs font-mono text-white/60">{(prediction.confidence * 100).toFixed(0)}%</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Sugerencias Top 3 - Escondido en pantallas muy pequeñas para evitar ruido */}
                                {topPredictions.length > 1 && (
                                    <div className="absolute top-3 sm:top-6 right-3 sm:right-6 z-20 hidden md:flex flex-col gap-2 items-end">
                                        <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Similares</p>
                                        {topPredictions.slice(1, 3).map((alt, i) => (
                                            <div key={i} className="bg-black/40 backdrop-blur-md border border-white/5 rounded-xl px-4 py-2 flex items-center gap-3 min-w-[140px] justify-between animate-in slide-in-from-right duration-500" style={{ animationDelay: `${(i + 1) * 100}ms` }}>
                                                <span className="text-xs font-bold text-white/60 uppercase">{alt.name}</span>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[10px] font-mono text-blue-400/60">{(alt.confidence * 100).toFixed(0)}%</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        {/* Controles de Cámara flotantes */}
                        {isCameraActive && (
                            <div className="absolute bottom-3 sm:bottom-6 right-3 sm:right-6 z-20 flex gap-2 sm:gap-3">
                                <button
                                    onClick={toggleCamera}
                                    className="p-2.5 sm:p-3 bg-red-500/20 backdrop-blur-md border border-red-500/30 rounded-xl sm:rounded-2xl hover:bg-red-500/40 transition-all group"
                                    title="Detener Cámara"
                                >
                                    <CameraOff size={20} className="text-red-400 sm:w-[24px] sm:h-[24px]" />
                                </button>
                                <button
                                    onClick={handleCapture}
                                    className="px-4 sm:px-6 bg-white text-black rounded-xl sm:rounded-2xl font-bold flex items-center gap-1.5 sm:gap-2 hover:bg-blue-50 hover:scale-105 active:scale-95 transition-all shadow-xl text-xs sm:text-base"
                                >
                                    <Sparkles size={18} className="sm:w-[20px] sm:h-[20px]" />
                                    Capturar
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Traductor de Oración */}
                    <div className="bg-white/5 border border-white/10 rounded-[2rem] sm:rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                            <Languages size={120} />
                        </div>

                        <div className="flex items-center justify-between mb-4 sm:mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-500/20 rounded-lg shrink-0">
                                    <Languages size={18} className="text-purple-400" />
                                </div>
                                <h3 className="text-base sm:text-lg font-bold truncate">Constructor de Oraciones</h3>
                            </div>
                            <div className="flex gap-1 sm:gap-2">
                                <button onClick={clearSentence} className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-xl transition-all" title="Borrar todo">
                                    <Trash2 size={18} />
                                </button>
                                <button onClick={speakSentence} className="p-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 rounded-xl transition-all" title="Escuchar">
                                    <Volume2 size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="min-h-[80px] sm:min-h-[100px] bg-black/40 rounded-2xl border border-white/5 p-4 flex flex-wrap gap-2 items-center">
                            {sentence.length === 0 ? (
                                <p className="text-white/20 italic text-center w-full text-xs sm:text-sm">Las señas aparecerán aquí...</p>
                            ) : (
                                sentence.map((word, i) => (
                                    <span key={i} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 border border-white/10 rounded-xl text-sm sm:text-lg font-bold animate-in fade-in zoom-in duration-300">
                                        {word}
                                    </span>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Panel Derecho: Guía y Progreso */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/20 rounded-3xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <BrainCircuit size={24} className="text-purple-400" />
                            <h3 className="text-lg font-bold">Control de Doble Mano</h3>
                        </div>
                        <ul className="space-y-4">
                            <li className="flex gap-3">
                                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] font-black shrink-0 border border-blue-500/30">DER</div>
                                <p className="text-xs text-white/70 font-medium tracking-tight">Mano Derecha (Signante): Haz tus señas con esta mano.</p>
                            </li>
                            <li className="flex gap-3">
                                <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center text-[10px] font-black shrink-0 border border-red-500/30">IZQ</div>
                                <p className="text-xs text-white/70 font-medium tracking-tight">Mano Izquierda (Activador): Cierra el puño para capturar la palabra.</p>
                            </li>
                        </ul>
                    </div>

                    {/* Teclas Especiales Dinámicas */}
                    <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 relative overflow-hidden group">
                        <div className="flex items-center gap-3 mb-6 relative z-10">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                <Zap size={20} className="text-blue-400" />
                            </div>
                            <h3 className="text-lg font-bold">Teclas Especiales</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4 relative z-10">
                            {controlElements.map((ctrl) => (
                                <div key={ctrl.id} className="group/item flex flex-col gap-3">
                                    <div className="aspect-square bg-black/40 rounded-2xl border border-white/5 overflow-hidden relative shadow-inner">
                                        {ctrl.image_url ? (
                                            <img
                                                src={ctrl.image_url.startsWith('http') ? ctrl.image_url : `http://localhost:8000${ctrl.image_url}`}
                                                alt={ctrl.name}
                                                className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-white/10">
                                                <Camera size={24} />
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-center px-1">Sin Ref</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1">{ctrl.name}</p>
                                    </div>
                                </div>
                            ))}
                            {controlElements.length === 0 && (
                                <div className="col-span-2 py-8 text-center border-2 border-dashed border-white/5 rounded-2xl">
                                    <p className="text-xs text-white/20 italic">Configurando comandos...</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <History size={20} className="text-white/40" />
                            Sesión Actual
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-white/5 rounded-2xl">
                                <span className="text-sm text-white/40">Señas Logradas</span>
                                <span className="font-bold">{sentence.length}</span>
                            </div>
                        </div>
                        <button
                            onClick={handleSaveSession}
                            disabled={isSaving || sentence.length === 0}
                            className="w-full mt-6 py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl font-black text-[10px] uppercase tracking-widest text-white transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                        >
                            {isSaving ? <RefreshCw className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                            {isSaving ? "Guardando..." : "Finalizar Práctica"}
                        </button>
                    </div>
                </div>
            </main>

            {/* Modal de Finalización */}
            {showCompletionModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300" />
                    <div className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-[3rem] shadow-2xl p-8 text-center animate-in zoom-in-95 duration-300">
                        <div className="w-20 h-20 bg-green-500/20 rounded-3xl flex items-center justify-center text-green-500 mx-auto mb-6 shadow-lg shadow-green-500/10">
                            <ShieldCheck size={40} />
                        </div>
                        <h2 className="text-3xl font-black mb-2 leading-tight">¡Sesión Guardada!</h2>
                        <p className="text-white/40 uppercase text-[10px] font-black tracking-[0.2em] mb-8">Resumen de tu traducción</p>

                        <div className="grid grid-cols-3 gap-4 mb-8">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Palabras</p>
                                <p className="text-xl font-black text-blue-400">{lastSessionResult?.words}</p>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">XP</p>
                                <p className="text-xl font-black text-yellow-500">+{lastSessionResult?.xp}</p>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Tiempo</p>
                                <p className="text-sm font-black text-white mt-1">{lastSessionResult?.time}</p>
                            </div>
                        </div>

                        <div className="bg-black/20 rounded-2xl p-4 mb-8 border border-white/5 text-left">
                            <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-2">Frase Resultante</p>
                            <p className="text-lg font-bold text-blue-200/80 italic">"{lastSessionResult?.sentence}"</p>
                        </div>

                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-blue-600/20"
                        >
                            Volver al Dashboard
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                .mirror { transform: rotateY(180deg); }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default PracticeMode;
