import React, { useState, useEffect, useRef } from 'react';
import {
  Camera, Download, Upload, Database, Target, Zap, RotateCcw,
  Save, X, Check, Play, Pause, Image as ImageIcon, FileText,
  AlertCircle, ChevronRight, CheckCircle2, Video
} from 'lucide-react';

const DataCapture = () => {
  // Estados Principales
  const [selectedModule, setSelectedModule] = useState('vocals');
  const [currentElementIndex, setCurrentElementIndex] = useState(0);
  const [captureStatus, setCaptureStatus] = useState('idle'); // idle, capturing, reviewing, saved
  const [progress, setProgress] = useState(0); // 0 to 50

  // Datos Simulados y Estado del Dataset
  const [moduleData, setModuleData] = useState({
    vocals: {
      id: 'vocals',
      name: 'Vocales',
      description: 'Fundamentos básicos',
      elements: [
        { name: 'A', captured: 0, status: 'pending', refImage: null, refDesc: 'Puño cerrado con el pulgar a un lado.' },
        { name: 'E', captured: 0, status: 'pending', refImage: null, refDesc: 'Dedos doblados tocando el pulgar.' },
        { name: 'I', captured: 0, status: 'pending', refImage: null, refDesc: 'Puño cerrado con el meñique levantado.' },
        { name: 'O', captured: 0, status: 'pending', refImage: null, refDesc: 'Mano formando un círculo.' },
        { name: 'U', captured: 0, status: 'pending', refImage: null, refDesc: 'Puño con índice y medio levantados juntos.' },
      ]
    },
    numbers: {
      id: 'numbers',
      name: 'Números',
      description: 'Dígitos del 0 al 9',
      elements: Array.from({ length: 10 }, (_, i) => ({
        name: `${i}`,
        captured: 0,
        status: 'pending',
        refImage: null,
        refDesc: `Representación manual del número ${i}.`
      }))
    }
  });

  // Referencias para simulación
  const captureIntervalRef = useRef(null);
  const videoRef = useRef(null);

  // Computed Values
  const currentModule = moduleData[selectedModule];
  const currentElement = currentModule.elements[currentElementIndex];
  const isModuleComplete = currentModule.elements.every(el => el.captured === 50);

  // --- Lógica de Captura ---

  const startCapture = () => {
    if (progress >= 50 && captureStatus !== 'reviewing') {
      // Si ya tiene datos, confirmar re-captura
      if (!window.confirm("Este elemento ya tiene datos capturados. ¿Deseas sobrescribirlos?")) return;
    }

    setCaptureStatus('capturing');
    setProgress(0);

    // Simular entrada de frames de webcam (0 a 50 frames)
    let frames = 0;
    captureIntervalRef.current = setInterval(() => {
      frames += 1;
      setProgress(frames);

      if (frames >= 50) {
        clearInterval(captureIntervalRef.current);
        setCaptureStatus('reviewing');
      }
    }, 100); // 100ms * 50 = 5 segundos de captura aprox
  };

  const stopCapture = () => {
    if (captureIntervalRef.current) clearInterval(captureIntervalRef.current);
    setCaptureStatus('idle');
    setProgress(0);
  };

  const saveCapture = () => {
    const updatedModule = { ...currentModule };
    updatedModule.elements[currentElementIndex] = {
      ...updatedModule.elements[currentElementIndex],
      captured: 50,
      status: 'completed'
    };

    setModuleData({
      ...moduleData,
      [selectedModule]: updatedModule
    });

    setCaptureStatus('saved');

    // Auto-avance opcional
    setTimeout(() => {
      setCaptureStatus('idle');
      setProgress(0);
      if (currentElementIndex < currentModule.elements.length - 1) {
        setCurrentElementIndex(prev => prev + 1);
      }
    }, 1500);
  };

  const discardCapture = () => {
    setCaptureStatus('idle');
    setProgress(0);
  };

  const handleExport = () => {
    alert(`Exportando dataset "${currentModule.name}" como archivo .zip...`);
    // Lógica de exportación real iría aquí
  };

  const handleRefImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updatedModule = { ...currentModule };
        updatedModule.elements[currentElementIndex].refImage = reader.result;
        setModuleData({ ...moduleData, [selectedModule]: updatedModule });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDescChange = (val) => {
    const updatedModule = { ...currentModule };
    updatedModule.elements[currentElementIndex].refDesc = val;
    setModuleData({ ...moduleData, [selectedModule]: updatedModule });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/40 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl">
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-2xl shadow-lg ${captureStatus === 'capturing' ? 'bg-red-500 shadow-red-500/20 animate-pulse' : 'bg-blue-600 shadow-blue-500/20'}`}>
            <Camera className="text-white" size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Estudio de Captura</h2>
            <p className="text-white/40 text-sm">Ingesta de datos visuales para entrenamiento de IA</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Selector de Módulo */}
          <div className="relative">
            <Database className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={16} />
            <select
              value={selectedModule}
              onChange={(e) => {
                setSelectedModule(e.target.value);
                setCurrentElementIndex(0);
                setCaptureStatus('idle');
                setProgress(0);
              }}
              className="bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-white font-bold text-sm focus:outline-none focus:border-blue-500/50 appearance-none min-w-[200px] cursor-pointer"
            >
              {Object.values(moduleData).map(mod => (
                <option key={mod.id} value={mod.id}>{mod.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExport}
            disabled={!isModuleComplete}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${isModuleComplete
                ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20 cursor-pointer'
                : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
              }`}
          >
            <Download size={18} />
            Exportar Dataset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-280px)] min-h-[600px]">

        {/* Panel Izquierdo: Lista de Elementos (3 cols) */}
        <div className="lg:col-span-3 bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-6 flex flex-col overflow-hidden">
          <h3 className="text-white font-bold mb-4 flex items-center justify-between px-2">
            <span>Elementos</span>
            <span className="text-xs bg-white/10 px-2 py-1 rounded-lg text-white/60">
              {currentModule.elements.filter(e => e.status === 'completed').length} / {currentModule.elements.length}
            </span>
          </h3>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {currentModule.elements.map((el, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentElementIndex(idx);
                  setCaptureStatus('idle');
                  setProgress(el.captured);
                }}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all relative overflow-hidden group ${currentElementIndex === idx
                    ? 'bg-blue-600/20 border-blue-500/50'
                    : 'bg-white/5 border-white/5 hover:bg-white/10'
                  }`}
              >
                <div className="flex items-center gap-3 relative z-10">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${el.status === 'completed'
                      ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                      : currentElementIndex === idx ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/40'
                    }`}>
                    {el.name}
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-white/80 group-hover:text-white transition-colors">{el.name}</div>
                    <div className="text-[10px] text-white/40 font-mono">{el.captured}/50 frames</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Panel Central: Área de Captura (6 cols) */}
        <div className="lg:col-span-6 flex flex-col gap-6">

          {/* Visor de Cámara */}
          <div className="flex-1 bg-black rounded-[3rem] border-4 border-slate-800 shadow-2xl relative overflow-hidden group">
            {/* Grid Overlay */}
            <div className="absolute inset-0 z-10 opacity-20 pointer-events-none"
              style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '50px 50px' }}>
            </div>

            {/* Estado Visual */}
            <div className="absolute inset-0 flex items-center justify-center z-0">
              {captureStatus === 'capturing' && (
                <div className="w-full h-full bg-green-500/10 animate-pulse flex items-center justify-center flex-col gap-4">
                  <Target size={64} className="text-green-500 animate-spin-slow opacity-50" />
                </div>
              )}
              {captureStatus === 'idle' && progress === 0 && (
                <div className="flex flex-col items-center opacity-30">
                  <Video size={64} className="mb-4" />
                  <p className="font-mono text-sm uppercase tracking-widest">Esperando señal de video...</p>
                </div>
              )}
            </div>

            {/* UI Superpuesta */}
            <div className="absolute top-6 left-6 z-20 flex gap-2">
              <span className="bg-red-500/20 backdrop-blur-md border border-red-500/30 text-red-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full bg-red-500 ${captureStatus === 'capturing' ? 'animate-pulse' : ''}`} />
                REC
              </span>
              <span className="bg-black/40 backdrop-blur-md border border-white/10 text-white px-3 py-1 rounded-full text-[10px] font-mono">
                FRAME: {progress}/50
              </span>
            </div>

            {/* Barra de Progreso Inferior */}
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-slate-800">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-100 ease-linear"
                style={{ width: `${(progress / 50) * 100}%` }}
              />
            </div>
          </div>

          {/* Controles */}
          <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-4 flex items-center justify-center gap-4">
            {captureStatus === 'idle' && progress < 50 && (
              <button onClick={startCapture} className="flex-1 bg-white text-slate-900 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95 flex items-center justify-center gap-2">
                <Play size={20} fill="currentColor" /> Iniciar Captura
              </button>
            )}

            {captureStatus === 'capturing' && (
              <button onClick={stopCapture} className="flex-1 bg-red-500 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-red-600 transition-all active:scale-95 animate-pulse">
                Detener ({(progress / 50 * 100).toFixed(0)}%)
              </button>
            )}

            {captureStatus === 'reviewing' && (
              <>
                <button onClick={discardCapture} className="flex-1 bg-white/10 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/20 transition-all">
                  <RotateCcw size={18} className="mr-2 inline" /> Reintentar
                </button>
                <button onClick={saveCapture} className="flex-[2] bg-green-500 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-green-600 transition-all shadow-lg shadow-green-500/20 active:scale-95">
                  <CheckCircle2 size={18} className="mr-2 inline" /> Guardar Muestra
                </button>
              </>
            )}

            {(captureStatus === 'saved' || (captureStatus === 'idle' && progress === 50)) && (
              <div className="flex-1 flex gap-4">
                <button onClick={() => setProgress(0)} className="flex-1 bg-white/10 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20">
                  Re-capturar
                </button>
                <div className="flex-[2] bg-green-500/20 border border-green-500/20 text-green-400 py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2">
                  <Check size={20} /> Completado
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Panel Derecho: Referencia e Instrucciones (3 cols) */}
        <div className="lg:col-span-3 flex flex-col gap-6">

          {/* Tarjeta de Referencia */}
          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6 flex-1 flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-bl-2xl z-10">
              Referencia
            </div>

            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-3xl bg-black/20 mb-4 relative overflow-hidden hover:border-white/30 transition-colors">
              {currentElement.refImage ? (
                <img src={currentElement.refImage} alt="Referencia" className="w-full h-full object-cover opacity-80" />
              ) : (
                <div className="text-center p-6">
                  <ImageIcon size={40} className="mx-auto text-white/20 mb-2" />
                  <p className="text-white/20 text-xs uppercase font-bold">Sin imagen referencia</p>
                  <label className="mt-4 inline-block cursor-pointer">
                    <span className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all">Subir Foto</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleRefImageUpload} />
                  </label>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Instrucción Técnica</label>
              <textarea
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white/80 text-sm focus:outline-none focus:border-blue-500/50 transition-all resize-none font-medium h-24"
                placeholder="Describe cómo realizar la seña..."
                value={currentElement.refDesc || ''}
                onChange={(e) => handleDescChange(e.target.value)}
              />
            </div>
          </div>

          {/* Info de IA */}
          <div className="bg-blue-600/10 border border-blue-600/20 rounded-[2rem] p-6">
            <h4 className="flex items-center gap-2 text-blue-400 font-bold mb-2">
              <Zap size={18} /> Engine V3 Ready
            </h4>
            <p className="text-blue-200/60 text-xs leading-relaxed">
              El sistema capturará exactamente <strong>50 frames</strong> de alta calidad. Asegúrate de una iluminación adecuada y fondo neutro para mejorar la precisión del entrenamiento.
            </p>
          </div>

        </div>

      </div>

      <style>{`
        .animate-spin-slow { animation: spin 8s linear infinite; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default DataCapture;