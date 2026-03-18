import React, { useState, useEffect, useRef } from 'react';
import {
  Camera, Download, Upload, Database, Target, Zap, RotateCcw,
  Save, X, Check, Play, Pause, Image as ImageIcon, FileText,
  AlertCircle, ChevronRight, CheckCircle2, Video, VideoOff, Power
} from 'lucide-react';

// MediaPipe Dependencies
import { Hands, HAND_CONNECTIONS } from '@mediapipe/hands';
import { Camera as MPCamera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';

import { moduleService } from '../../api/moduleService';
import { adminService } from '../../api/adminService';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

const DataCapture = () => {
    const { theme } = useTheme();
  // Estados Principales
  const [modules, setModules] = useState([]);
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [currentElementIndex, setCurrentElementIndex] = useState(0);
  const [captureStatus, setCaptureStatus] = useState('idle'); // idle, capturing, reviewing, saved, saving
  const [progress, setProgress] = useState(0); // 0 to 50
  const [capturedFrames, setCapturedFrames] = useState([]);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isSavingMetadata, setIsSavingMetadata] = useState(false);

  // Refs para MediaPipe y Video
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const handsRef = useRef(null);
  const cameraRef = useRef(null);
  const resultsRef = useRef(null);
  const requestRef = useRef();
  const isModelReadyRef = useRef(false);
  const isCapturingRef = useRef(false);
  const framesBufferRef = useRef([]);

  // Cargar Módulos Reales
  const loadModules = async () => {
    try {
      const data = await moduleService.getModules();
      setModules(data);
      if (data.length > 0 && !selectedModuleId) {
        setSelectedModuleId(data[0].id);
      }
    } catch (err) {
      console.error("Error loading modules:", err);
      toast.error("Error al cargar módulos");
    }
  };

  useEffect(() => {
    loadModules().catch(() => {});
  }, []);

  // Inicializar o limpiar MediaPipe cuando cambia el estado de la cámara
  useEffect(() => {
    let active = true;

    const cleanup = async () => {
      if (cameraRef.current) {
        try {
          await cameraRef.current.stop();
        } catch (e) { console.error("Error stopping camera:", e); }
        cameraRef.current = null;
      }
      if (handsRef.current) {
        try {
          await handsRef.current.close();
        } catch (e) { console.error("Error closing hands:", e); }
        handsRef.current = null;
      }
    };

    if (!isCameraOn) {
      cleanup();
      return;
    }

    if (!videoRef.current || !canvasRef.current) return;

    // Loop de dibujo de alto rendimiento
    const animate = () => {
      drawUI();
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);

    const hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 0,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    // Pequeño delay para que WASM cargue antes de activar la IA
    setTimeout(() => {
      isModelReadyRef.current = true;
    }, 1500);

    hands.onResults((results) => {
      if (!active) return;
      resultsRef.current = results;

      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];

        // Lógica de captura se mantiene en onResults por precisión de frames
        if (isCapturingRef.current) {
          framesBufferRef.current.push(landmarks);
          const currentCount = framesBufferRef.current.length;
          setProgress(currentCount);

          if (currentCount >= 100) {
            isCapturingRef.current = false;
            setCaptureStatus('reviewing');
            setCapturedFrames([...framesBufferRef.current]);
          }
        }
      }
    });

    handsRef.current = hands;

    const camera = new MPCamera(videoRef.current, {
      onFrame: async () => {
        if (!active || !videoRef.current || !handsRef.current || !isModelReadyRef.current) return;
        try {
          // Procesamiento no bloqueante
          await handsRef.current.send({ image: videoRef.current });
        } catch (e) {
          if (e.message && !e.message.includes('deleted') && !e.message.includes('width')) {
            console.error("MediaPipe send error:", e);
          }
        }
      },
      width: 480,
      height: 360
    });

    camera.start();
    cameraRef.current = camera;

    return () => {
      active = false;
      cleanup();
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isCameraOn]);

  const drawUI = () => {
    if (!canvasRef.current || !resultsRef.current) return;
    const canvasCtx = canvasRef.current.getContext('2d');
    const results = resultsRef.current;
    const { width, height } = canvasRef.current;

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, width, height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];
      const isLight = theme === 'light';

      // Dibujar conexiones - OPTIMIZADO: High Visibility
      canvasCtx.strokeStyle = isLight ? '#0066ff' : '#00f0ff';
      canvasCtx.lineWidth = 5;
      canvasCtx.lineCap = 'round';
      canvasCtx.lineJoin = 'round';

      canvasCtx.beginPath();
      for (const [start, end] of HAND_CONNECTIONS) {
        const p1 = landmarks[start];
        const p2 = landmarks[end];
        canvasCtx.moveTo(p1.x * width, p1.y * height);
        canvasCtx.lineTo(p2.x * width, p2.y * height);
      }
      canvasCtx.stroke();

      // Dibujar puntos
      canvasCtx.fillStyle = isLight ? '#000000' : '#ffffff';
      for (const point of landmarks) {
        canvasCtx.beginPath();
        canvasCtx.arc(point.x * width, point.y * height, 3, 0, 2 * Math.PI);
        canvasCtx.fill();
      }
    }
    canvasCtx.restore();
  };

  // Computed Values
  const currentModule = modules.find(m => m.id === selectedModuleId) || { elements: [] };
  const currentElement = currentModule.elements[currentElementIndex] || { id: null, name: '', description: '', image_url: null };

  // --- Handlers ---

  const handleResetDataset = () => {
    toast((t) => (
      <div className="flex flex-col gap-2 min-w-[200px]">
        <div className="text-sm font-bold text-slate-800">
          ¿Reiniciar dataset de {currentElement.name}?
        </div>
        <div className="text-xs text-slate-500 mb-2">
          Esto eliminará las {currentElement.captured_count} muestras existentes.
        </div>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await adminService.resetElementCaptures(currentElement.id);
                toast.success("Dataset reiniciado. Listo para capturar.");
                loadModules();
              } catch (err) {
                console.error("Error resetting dataset:", err);
                toast.error("Error al reiniciar dataset");
              }
            }}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-xs font-bold transition-colors"
          >
            ELIMINAR
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-2 rounded-lg text-xs font-bold transition-colors"
          >
            CANCELAR
          </button>
        </div>
      </div>
    ), {
      duration: 5000,
      position: 'top-center',
      style: {
        background: '#fff',
        padding: '16px',
        borderRadius: '16px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      },
    });
  };

  const toggleCamera = () => {
    setIsCameraOn(!isCameraOn);
    setCaptureStatus('idle');
    setProgress(0);
    isCapturingRef.current = false;
  };

  const startCapture = () => {
    if (!isCameraOn) {
      toast.error("Debes encender la cámara primero");
      return;
    }

    if ((currentElement.captured_count || 0) >= 1) {
      toast("Primero debes reiniciar el dataset para capturar nuevos datos limpios.", { icon: '⚠️' });
      return;
    }

    framesBufferRef.current = [];
    setCapturedFrames([]);
    setProgress(0);
    setCaptureStatus('capturing');
    isCapturingRef.current = true;
  };

  const saveCapture = async () => {
    try {
      setCaptureStatus('saving');
      const loadToast = toast.loading("Sincronizando 100 muestras con el servidor...");

      // Optimización: Enviar todo el lote en una sola petición
      const batchData = capturedFrames.map(landmarks => ({
        element_id: currentElement.id,
        landmarks: landmarks,
        image_url: null
      }));

      await adminService.saveCaptureBatch(batchData);

      toast.dismiss(loadToast);
      toast.success("Capturas enviadas exitosamente");
      setCaptureStatus('saved');

      // Recargar para actualizar los contadores
      await loadModules();

      // No avanzar automáticamente
      setTimeout(() => {
        setCaptureStatus('idle');
        setProgress(0);
      }, 1500);

    } catch (err) {
      console.error("Error saving capture:", err);
      toast.error("Error al conectar con el servidor");
      setCaptureStatus('reviewing');
    }
  };

  const saveMetadata = async () => {
    if (!currentElement.id) return;

    try {
      setIsSavingMetadata(true);
      const loadToast = toast.loading("Guardando configuración técnica...");

      await adminService.updateElement(currentElement.id, {
        description: currentElement.description,
        image_url: currentElement.image_url
      });

      toast.dismiss(loadToast);
      toast.success("Configuración técnica guardada");
      await loadModules();
    } catch (err) {
      console.error("Error saving metadata:", err);
      toast.error("Error al guardar metadatos");
    } finally {
      setIsSavingMetadata(false);
    }
  };

  const discardCapture = () => {
    setCaptureStatus('idle');
    setProgress(0);
    framesBufferRef.current = [];
  };

  const handleRefImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        const newModules = [...modules];
        const modIdx = newModules.findIndex(m => m.id === selectedModuleId);
        if (modIdx !== -1) {
          newModules[modIdx].elements[currentElementIndex].image_url = base64;
          setModules(newModules);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDescChange = (val) => {
    const newModules = [...modules];
    const modIdx = newModules.findIndex(m => m.id === selectedModuleId);
    if (modIdx !== -1) {
      newModules[modIdx].elements[currentElementIndex].description = val;
      setModules(newModules);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Header - Dropdown de Módulos */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-6 dark:bg-white/[0.02] bg-white backdrop-blur-3xl border dark:border-white/5 border-slate-200 p-6 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-blue-500/10 blur-[60px] rounded-full pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <div className={`p-3 lg:p-4 rounded-2xl shadow-lg transition-all ${captureStatus === 'capturing' ? 'bg-red-500 shadow-red-500/20 animate-pulse' : 'bg-gradient-to-br from-blue-600 to-indigo-600 shadow-blue-500/20'}`}>
            <Camera className="text-white w-6 h-6 lg:w-8 lg:h-8" />
          </div>
          <div>
            <h2 className="text-xl lg:text-3xl font-black dark:text-white text-slate-900 tracking-tight uppercase">Estudio de Captura</h2>
            <p className="dark:text-white/40 text-slate-500 text-[10px] sm:text-xs font-bold uppercase tracking-widest mt-1">Módulo actulmente en edición</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 lg:gap-4 relative z-10">
          <div className="relative group flex-1 sm:flex-none">
            <Database className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 dark:text-blue-400" size={16} />
            <select
              value={selectedModuleId || ''}
              onChange={(e) => {
                setSelectedModuleId(parseInt(e.target.value));
                setCurrentElementIndex(0);
                setCaptureStatus('idle');
                setProgress(0);
              }}
              className="w-full dark:bg-white/[0.02] bg-slate-50 border dark:border-white/5 border-slate-200 rounded-xl lg:rounded-2xl pl-10 pr-10 py-3 lg:py-3.5 dark:text-white text-slate-900 font-black text-xs lg:text-sm focus:outline-none focus:border-blue-500/50 appearance-none sm:min-w-[200px] lg:min-w-[250px] cursor-pointer hover:dark:bg-white/[0.04] hover:bg-slate-100 transition-all shadow-inner"
            >
              <option value="" disabled className="dark:bg-[#0a0c10] bg-white">Seleccionar Módulo</option>
              {modules.map(mod => (
                <option key={mod.id} value={mod.id} className="dark:bg-[#0a0c10] bg-white text-slate-900 dark:text-white">{mod.title}</option>
              ))}
            </select>
            <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronRight className="dark:text-white/20 text-slate-400 rotate-90" size={16} />
            </span>
          </div>

          <button
            onClick={toggleCamera}
            className={`flex items-center justify-center gap-3 px-4 lg:px-6 py-3 lg:py-3.5 rounded-xl lg:rounded-2xl font-black text-[10px] lg:text-xs uppercase tracking-widest transition-all border ${isCameraOn
              ? 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white shadow-lg shadow-red-500/10'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-lg shadow-blue-500/30 hover:scale-105'
              }`}
          >
            <Power size={18} />
            <span className="whitespace-nowrap">{isCameraOn ? 'Detener' : 'Encender'} Estación</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 lg:h-[calc(100vh-320px)] lg:min-h-[600px]">

        {/* Panel Izquierdo: Lista de Elementos (Orden cambiado en mobile) */}
        <div className="order-2 lg:order-1 lg:col-span-3 dark:bg-white/[0.02] bg-white backdrop-blur-3xl border dark:border-white/5 border-slate-200 rounded-[2.5rem] p-5 lg:p-6 flex flex-col h-[300px] lg:h-full overflow-hidden shadow-2xl relative">
          {/* Ambient background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-500/5 blur-[80px] rounded-full pointer-events-none" />

          <div className="flex items-center justify-between px-2 mb-4 lg:mb-6 relative z-10">
            <h3 className="dark:text-white text-slate-900 font-black text-[10px] uppercase tracking-widest opacity-40">Dataset</h3>
            <span className="text-[9px] font-black dark:bg-blue-500/10 bg-blue-50 border dark:border-blue-500/20 border-blue-200 px-2 py-1 rounded-lg text-blue-600 dark:text-blue-400">
              {currentModule.elements.filter(e => (e.captured_count || 0) >= 100).length} / {currentModule.elements.length} COMPLETE
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 lg:space-y-3 pr-2 custom-scrollbar relative z-10">
            {currentModule.elements.map((el, idx) => (
              <button
                key={el.id}
                onClick={() => {
                  setCurrentElementIndex(idx);
                  setCaptureStatus('idle');
                  setProgress(0);
                }}
                className={`w-full flex items-center justify-between p-3 lg:p-4 rounded-xl lg:rounded-2xl border transition-all relative overflow-hidden group ${currentElementIndex === idx
                  ? 'dark:bg-gradient-to-r from-blue-600/20 to-blue-400/10 bg-blue-50 border-blue-500/30 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]'
                  : 'dark:bg-white/[0.02] bg-slate-50 border dark:border-white/5 border-slate-200 hover:dark:bg-white/[0.04] hover:bg-slate-100'
                  }`}
              >
                <div className="flex items-center gap-3 lg:gap-4 relative z-10 w-full">
                  <div className={`w-8 h-8 lg:w-10 lg:h-10 shrink-0 rounded-lg lg:rounded-xl flex items-center justify-center font-black text-sm lg:text-base transition-all ${el.captured_count >= 100
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/20'
                    : currentElementIndex === idx ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20 animate-pulse' : 'bg-white/10 text-white/40'
                    }`}>
                    {el.name.charAt(0)}
                  </div>
                  <div className="text-left min-w-0 flex-1">
                    <div className={`text-xs lg:text-sm font-black uppercase tracking-tight truncate transition-colors ${currentElementIndex === idx ? 'dark:text-white text-slate-900' : 'dark:text-white/60 text-slate-500 dark:group-hover:text-white group-hover:text-slate-900'}`}>{el.name}</div>
                    <div className="text-[9px] lg:text-[10px] dark:text-white/40 text-slate-400 font-bold uppercase tracking-widest">{el.captured_count || 0} / 100 samples</div>
                  </div>
                  {el.captured_count >= 100 && <CheckCircle2 size={16} className="text-green-500 shrink-0 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]" />}
                </div>
              </button>
            ))}
            {currentModule.elements.length === 0 && (
              <div className="text-center py-10 text-white/20 text-xs font-black uppercase tracking-widest border-2 border-dashed border-white/5 rounded-3xl">Sin Elementos</div>
            )}
          </div>
        </div>

        {/* Panel Central: Área de Captura (Prioridad en mobile) */}
        <div className="order-1 lg:order-2 lg:col-span-6 flex flex-col gap-4 lg:gap-6">

          {/* Visor de Cámara */}
          <div className="flex-1 dark:bg-black bg-slate-100 rounded-[2.5rem] lg:rounded-[4rem] border-4 lg:border-[12px] dark:border-white/5 border-slate-200 shadow-2xl relative overflow-hidden min-h-[350px] lg:min-h-0">
            {isCameraOn ? (
              <>
                <video
                  ref={videoRef}
                  className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
                  playsInline
                  muted
                />
                <canvas
                  ref={canvasRef}
                  width={640}
                  height={480}
                  className="absolute inset-0 z-20 w-full h-full object-cover scale-x-[-1]"
                />
                {/* Overlay de grabación */}
                {captureStatus === 'capturing' && (
                  <div className="absolute inset-0 z-30 ring-[10px] lg:ring-[20px] ring-red-500/20 animate-pulse pointer-events-none" />
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center dark:bg-[#05070a] bg-slate-900/10 backdrop-blur-sm gap-4 p-6 text-center">
                <div className="w-16 h-16 lg:w-20 lg:h-20 dark:bg-white/5 bg-white rounded-full flex items-center justify-center border dark:border-white/10 border-slate-200 shadow-xl">
                  <VideoOff size={32} className="dark:text-white/10 text-slate-300" />
                </div>
                <p className="dark:text-white/20 text-slate-400 font-black text-[10px] lg:text-xs uppercase tracking-[0.3em]">Hardware Desconectado</p>
                <button onClick={toggleCamera} className="bg-blue-600 text-white px-6 lg:px-8 py-3 rounded-xl lg:rounded-2xl font-black text-[10px] lg:text-xs uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20">Activar Sensores</button>
              </div>
            )}

            {/* Grid Overlay */}
            <div className="absolute inset-0 z-10 opacity-20 pointer-events-none"
              style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
            </div>

            {/* UI Superpuesta */}
            {isCameraOn && (
              <div className="absolute top-4 left-4 lg:top-8 lg:left-8 z-40 flex gap-2 lg:gap-3">
                <span className={`backdrop-blur-md border px-3 lg:px-4 py-1.5 lg:py-2 rounded-xl lg:rounded-2xl text-[8px] lg:text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 transition-all ${captureStatus === 'capturing' ? 'bg-red-500/40 border-red-500/50 text-white' : 'bg-black/60 border-white/10 text-white/60'
                  }`}>
                  <div className={`w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full ${captureStatus === 'capturing' ? 'bg-white animate-pulse' : 'bg-white/20'}`} />
                  REC
                </span>
                <span className="bg-blue-600/60 backdrop-blur-md border border-blue-400/30 text-white px-3 lg:px-4 py-1.5 lg:py-2 rounded-xl lg:rounded-2xl text-[8px] lg:text-[10px] font-black tracking-widest uppercase">
                  PROGRESS: {progress}/100
                </span>
              </div>
            )}

            {/* Barra de Progreso Inferior */}
            <div className="absolute bottom-0 left-0 right-0 h-2 lg:h-3 bg-[#0a0c10] z-40">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 transition-all duration-300 ease-out shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                style={{ width: `${(progress / 100) * 100}%` }}
              />
            </div>
          </div>

          {/* Controles Dinámicos */}
          <div className="dark:bg-white/[0.02] bg-white backdrop-blur-3xl border dark:border-white/5 border-slate-200 rounded-[2rem] lg:rounded-[2.5rem] p-4 lg:p-6 flex items-center justify-center gap-3 lg:gap-4 shadow-2xl relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-500/5 blur-[40px] rounded-full pointer-events-none" />
            
            <div className="relative z-10 w-full flex items-center gap-3 lg:gap-4">
            {(captureStatus === 'idle' || captureStatus === 'saved') && (
              <>
                <button
                  onClick={startCapture}
                  disabled={!isCameraOn}
                  className={`flex-1 py-4 lg:py-5 rounded-xl lg:rounded-[1.5rem] font-black text-xs lg:text-sm uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${isCameraOn
                    ? 'dark:bg-white bg-slate-900 dark:text-slate-950 text-white dark:hover:bg-white/90 hover:bg-slate-800 active:scale-95 shadow-xl'
                    : 'dark:bg-white/5 bg-slate-100 dark:text-white/10 text-slate-300 cursor-not-allowed'
                    }`}
                >
                  <Play size={18} fill="currentColor" /> <span className="hidden sm:inline">Iniciar Grabación (100)</span><span className="sm:hidden">Grabar</span>
                </button>

                {/* Botón de Reinicio de Dataset */}
                {isCameraOn && (currentElement.captured_count || 0) > 0 && (
                  <button
                    onClick={handleResetDataset}
                    className="px-4 lg:px-6 py-4 lg:py-5 rounded-xl lg:rounded-[1.5rem] font-black text-xs lg:text-sm uppercase tracking-[0.2em] bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                    title="Borrar todas las capturas de este elemento"
                  >
                    <RotateCcw size={18} />
                  </button>
                )}
              </>
            )}

            {captureStatus === 'capturing' && (
              <button
                onClick={() => { isCapturingRef.current = false; setCaptureStatus('idle'); }}
                className="flex-1 bg-red-500 text-white py-4 lg:py-5 rounded-xl lg:rounded-[1.5rem] font-black text-xs lg:text-sm uppercase tracking-[0.2em] hover:bg-red-600 transition-all active:scale-95 animate-pulse flex items-center justify-center gap-3"
              >
                <Pause size={18} fill="currentColor" /> Capturando... ({Math.floor(progress / 100 * 100)}%)
              </button>
            )}

            {captureStatus === 'reviewing' && (
              <>
                <button onClick={discardCapture} className="flex-1 dark:bg-white/10 bg-slate-100 dark:text-white text-slate-600 py-4 lg:py-5 rounded-xl lg:rounded-[1.5rem] font-black text-[10px] lg:text-xs uppercase tracking-[0.1em] hover:dark:bg-white/20 hover:bg-slate-200 transition-all">
                  <RotateCcw size={16} className="sm:mr-2 inline" /> <span className="hidden sm:inline">Descartar</span>
                </button>
                <button onClick={saveCapture} className="flex-[2] bg-emerald-500 text-white py-4 lg:py-5 rounded-xl lg:rounded-[1.5rem] font-black text-xs lg:text-sm uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
                  <CheckCircle2 size={16} className="sm:mr-2 inline" /> <span className="hidden sm:inline">Guardar Dataset</span><span className="sm:hidden">Guardar</span>
                </button>
              </>
            )}

            {captureStatus === 'saving' && (
              <div className="flex-1 dark:bg-blue-600/20 bg-blue-50 dark:text-blue-400 text-blue-600 py-4 lg:py-5 rounded-xl lg:rounded-[1.5rem] font-black text-xs lg:text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 border dark:border-blue-500/20 border-blue-100">
                <div className="w-4 h-4 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
                Sincronizando...
              </div>
            )}
            </div>
          </div>
        </div>

        {/* Panel Derecho: Referencia e Instrucciones (Orden 3 en mobile, pero fluye abajo) */}
        <div className="order-3 lg:col-span-3 flex flex-col gap-6">

          {/* Tarjeta de Referencia */}
          <div className="dark:bg-white/[0.02] bg-white backdrop-blur-3xl border dark:border-white/5 border-slate-200 rounded-[2.5rem] lg:rounded-[3rem] p-6 lg:p-8 flex flex-col relative overflow-hidden shadow-2xl group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />
            <div className="absolute top-0 right-0 bg-gradient-to-bl from-blue-600 to-indigo-600 text-white text-[8px] lg:text-[10px] font-black uppercase tracking-[0.2em] px-4 lg:px-6 py-2 lg:py-3 rounded-bl-2xl lg:rounded-bl-3xl z-10 shadow-lg shadow-blue-500/20">
              Guía Visual
            </div>

            <div className="aspect-square w-full lg:flex-1 flex flex-col items-center justify-center border-2 lg:border-4 border-dashed dark:border-white/10 border-slate-200 rounded-[1.5rem] lg:rounded-[2.5rem] dark:bg-black/40 bg-slate-50 mb-6 lg:mb-8 relative overflow-hidden hover:border-blue-500/30 transition-all duration-500 group">
              {currentElement.image_url ? (
                <div className="relative w-full h-full">
                  <img src={currentElement.image_url} alt="Referencia" className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 dark:bg-black/40 bg-slate-900/10 opacity-0 lg:group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <label className="cursor-pointer dark:bg-white bg-slate-900 dark:text-slate-950 text-white px-3 py-2 rounded-lg font-black text-[9px] lg:text-[10px] uppercase shadow-xl transition-transform hover:scale-105">
                      Cambiar Imagen
                      <input type="file" className="hidden" accept="image/*" onChange={handleRefImageUpload} />
                    </label>
                  </div>
                </div>
              ) : (
                <div className="text-center p-4">
                  <div className="w-12 h-12 lg:w-16 lg:h-16 dark:bg-white/5 bg-white rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-4 border dark:border-white/10 border-slate-200 shadow-sm">
                    <ImageIcon size={24} className="dark:text-white/20 text-slate-300" />
                  </div>
                  <p className="dark:text-white/20 text-slate-400 text-[9px] lg:text-[10px] uppercase font-black tracking-widest mb-3 lg:mb-4">Sin Imagen</p>
                  <label className="cursor-pointer">
                    <span className="bg-blue-600 hover:bg-blue-500 text-white px-4 lg:px-5 py-2 lg:py-2.5 rounded-lg lg:rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20">Subir</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleRefImageUpload} />
                  </label>
                </div>
              )}
            </div>

            <div className="space-y-4 relative z-10">
              <label className="text-[9px] lg:text-[10px] font-black dark:text-white/40 text-slate-500 uppercase tracking-[0.3em] pl-1 flex items-center gap-2">
                <FileText size={10} /> Notas Técnicas
              </label>
              <textarea
                className="w-full dark:bg-white/[0.02] bg-slate-50 border dark:border-white/5 border-slate-200 rounded-xl lg:rounded-2xl p-4 lg:p-5 dark:text-white/80 text-slate-700 text-xs lg:text-sm focus:outline-none focus:border-blue-500/50 hover:dark:bg-white/[0.04] hover:bg-slate-100 transition-all resize-none font-bold h-24 lg:h-32 custom-scrollbar shadow-inner"
                placeholder="Indica la postura correcta..."
                value={currentElement.description || ''}
                onChange={(e) => handleDescChange(e.target.value)}
              />

              <button
                onClick={saveMetadata}
                disabled={isSavingMetadata || !currentElement.id}
                className={`w-full py-3 lg:py-4 rounded-xl lg:rounded-2xl font-black text-[10px] lg:text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 border dark:border-white/5 border-slate-200 ${isSavingMetadata
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/20 hover:scale-105 active:scale-95'
                  }`}
              >
                {isSavingMetadata ? <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" /> : <Save size={16} />}
                Actualizar Config
              </button>
            </div>
          </div>

          {/* Info de IA - Solo Desktop o Tablet Grande */}
          <div className="hidden sm:block bg-gradient-to-br from-blue-600/10 to-purple-600/10 dark:border-white/5 border-blue-100 rounded-[2.5rem] p-6 lg:p-8 shadow-xl backdrop-blur-3xl relative overflow-hidden">
            <div className="absolute inset-0 bg-blue-500/5 blur-[40px] rounded-full pointer-events-none" />
            <div className="relative z-10">
              <h4 className="flex items-center gap-3 text-blue-600 dark:text-blue-400 font-black text-[10px] lg:text-xs uppercase tracking-widest mb-3">
                <Zap size={18} fill="currentColor" /> Neural Core V.4
              </h4>
              <p className="dark:text-white/60 text-slate-500 text-[10px] lg:text-[11px] leading-relaxed font-bold uppercase tracking-wide">
                Cada guardado inyecta <span className="text-blue-600 dark:text-blue-400">100 landmarks</span> vectorizados. El motor IA requiere variaciones de ángulo para una detección robusta.
              </p>
            </div>
          </div>

        </div>

      </div>

      <style>{`
        .animate-spin-slow { animation: spin 10s linear infinite; }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.05); border-radius: 10px; }
        :global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(59, 130, 246, 0.2); }
      `}</style>
    </div>
  );
};

export default DataCapture;