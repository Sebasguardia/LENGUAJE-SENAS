import React, { useState, useEffect, useRef } from 'react';
import {
  Cpu, Play, StopCircle, Save, Upload, Database,
  CheckCircle2, AlertTriangle, ChevronRight, BarChart2,
  Activity, Layers, Box, Terminal, Share2, Eye, Package
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Legend
} from 'recharts';

const TrainingSection = () => {
  // Estados de Flujo
  const [step, setStep] = useState('selection'); // selection, training, validation, packaging
  const [trainingActive, setTrainingActive] = useState(false);
  const [selectedModules, setSelectedModules] = useState([]);

  // Datos Simulados
  const [availableModules, setAvailableModules] = useState([
    { id: 'vocals', name: 'Vocales', samples: 250, status: 'ready', lastUpdate: 'Hoy 14:30', color: '#4ADE80' },
    { id: 'numbers', name: 'Números', samples: 500, status: 'ready', lastUpdate: 'Ayer', color: '#60A5FA' },
    { id: 'alphabet', name: 'Abecedario', samples: 1350, status: 'incomplete', lastUpdate: 'Hace 3 días', color: '#F472B6' },
    { id: 'math', name: 'Matemáticas', samples: 120, status: 'ready', lastUpdate: 'Hace 1 semana', color: '#FACC15' },
  ]);

  // Métricas de Entrenamiento
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const totalEpochs = 50;
  const [metricsHistory, setMetricsHistory] = useState([]);
  const [logs, setLogs] = useState([]);
  const logsEndRef = useRef(null);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // --- Lógica del Entrenador ---

  const toggleModuleSelection = (id) => {
    if (selectedModules.includes(id)) {
      setSelectedModules(selectedModules.filter(m => m !== id));
    } else {
      setSelectedModules([...selectedModules, id]);
    }
  };

  const handleImport = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.zip,.json';
    fileInput.onchange = (e) => {
      const fileName = e.target.files[0]?.name;
      if (fileName) alert(`Dataset "${fileName}" importado y verificado correctamente.`);
    };
    fileInput.click();
  };

  const getModuleInfo = (id) => availableModules.find(m => m.id === id);

  const startTraining = () => {
    setStep('training');
    setTrainingActive(true);
    setMetricsHistory([]);
    setLogs(['Iniciando motor de entrenamiento TensorFlow.js...', 'Cargando tensores en GPU...', 'Normalizando datos por módulo...']);
    setCurrentEpoch(0);

    let epoch = 0;
    // Simular estado de precisión inicial para cada módulo
    const moduleProgress = {};
    selectedModules.forEach(id => {
      moduleProgress[id] = 0.1 + Math.random() * 0.2; // Empezar entre 10% y 30%
    });

    const interval = setInterval(() => {
      epoch++;
      setCurrentEpoch(epoch);

      const loss = Math.max(0.1, 2.5 * Math.exp(-0.1 * epoch) + (Math.random() * 0.1));

      // Calcular precisión individual para cada módulo seleccionado
      const newMetric = { epoch, loss: loss.toFixed(4) };

      selectedModules.forEach(id => {
        // Curva de aprendizaje logarítmica simulada con ruido
        const currentAcc = moduleProgress[id];
        const target = 0.95 + (Math.random() * 0.04); // Meta ~95-99%
        const speed = 0.05 + (Math.random() * 0.05);

        let nextAcc = currentAcc + ((target - currentAcc) * speed);
        if (nextAcc > 0.999) nextAcc = 0.999;

        moduleProgress[id] = nextAcc;
        newMetric[id] = (nextAcc * 100).toFixed(2);
      });

      // Precisión global promedio
      const avgAcc = selectedModules.reduce((acc, id) => acc + parseFloat(newMetric[id]), 0) / selectedModules.length;
      newMetric['accuracy'] = avgAcc.toFixed(2); // Global

      setMetricsHistory(prev => [...prev, newMetric]);

      if (epoch % 5 === 0) {
        setLogs(prev => [...prev, `Epoch ${epoch}/${totalEpochs} - loss: ${loss.toFixed(4)} - avg_acc: ${(avgAcc / 100).toFixed(4)}`]);
      }

      if (epoch >= totalEpochs) {
        clearInterval(interval);
        setTrainingActive(false);
        setLogs(prev => [...prev, 'Entrenamiento finalizado exitosamente.', 'Generando manifiesto de versión...']);
        setTimeout(() => setStep('validation'), 1500);
      }
    }, 200);
  };

  const handlePublish = () => {
    alert("Modelo v2.0 publicado al servidor de producción. Disponible para todos los usuarios.");
    setStep('selection');
    setSelectedModules([]);
  };

  // --- Vistas ---

  // 1. Selección de Datos
  const renderSelection = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-white font-bold text-lg mb-1">Selección de Datasets</h3>
          <p className="text-white/40 text-sm">Elige los módulos que conformarán el corpus de entrenamiento.</p>
        </div>
        <button
          onClick={handleImport}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all border border-white/5"
        >
          <Upload size={14} /> Importar Externo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableModules.map(mod => (
          <div
            key={mod.id}
            onClick={() => mod.status === 'ready' && toggleModuleSelection(mod.id)}
            className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${selectedModules.includes(mod.id)
              ? 'bg-blue-600/20 border-blue-500'
              : mod.status === 'ready'
                ? 'bg-white/5 border-white/5 hover:border-white/20'
                : 'bg-white/5 border-white/5 opacity-50 cursor-not-allowed'
              }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div
                className={`p-3 rounded-xl`}
                style={{ backgroundColor: selectedModules.includes(mod.id) ? mod.color : 'rgba(255,255,255,0.1)', color: selectedModules.includes(mod.id) ? 'white' : 'rgba(255,255,255,0.4)' }}
              >
                <Database size={20} />
              </div>
              {selectedModules.includes(mod.id) && <CheckCircle2 className="text-blue-400" size={20} />}
            </div>

            <h4 className="text-white font-bold text-lg mb-1">{mod.name}</h4>
            <div className="flex items-center gap-2 text-xs font-medium text-white/40 mb-4">
              <span>{mod.samples} Muestras</span>
              <span>•</span>
              <span>{mod.lastUpdate}</span>
            </div>

            {mod.status !== 'ready' && (
              <div className="flex items-center gap-2 text-yellow-500 text-xs font-bold bg-yellow-500/10 px-3 py-2 rounded-lg">
                <AlertTriangle size={12} /> Requiere más datos
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-6 border-t border-white/5">
        <button
          onClick={startTraining}
          disabled={selectedModules.length === 0}
          className={`px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-3 transition-all ${selectedModules.length > 0
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/20 hover:scale-[1.02]'
            : 'bg-white/5 text-white/20 cursor-not-allowed'
            }`}
        >
          <Cpu size={18} /> Iniciar Entrenamiento
        </button>
      </div>
    </div>
  );

  // 2. Dashboard de Entrenamiento
  const renderTraining = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráficos */}
        <div className="lg:col-span-2 space-y-6">

          {/* Accuracy Chart Multi-Line */}
          <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-white font-bold flex items-center gap-2">
                <CheckCircle2 className="text-green-400" size={18} /> Precisión por Módulo
              </h4>
            </div>
            <div className="h-64 w-full min-h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metricsHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="epoch" hide />
                  <YAxis domain={[0, 100]} stroke="#ffffff40" fontSize={10} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff20', borderRadius: '12px' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
                  {/* Línea Global */}
                  <Line type="monotone" dataKey="accuracy" name="Promedio Global" stroke="#ffffff" strokeWidth={2} dot={false} strokeDasharray="5 5" />

                  {/* Líneas por Módulo */}
                  {selectedModules.map(modId => {
                    const mod = getModuleInfo(modId);
                    return (
                      <Line
                        key={modId}
                        type="monotone"
                        dataKey={modId}
                        name={mod.name}
                        stroke={mod.color}
                        strokeWidth={3}
                        dot={false}
                        isAnimationActive={false} // Para mejor rendimiento en updates rápidos
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Loss Chart */}
          <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-white font-bold flex items-center gap-2">
                <Activity className="text-orange-400" size={18} /> Función de Pérdida
              </h4>
              <span className="text-orange-400 font-mono text-xs">
                Loss: {metricsHistory[metricsHistory.length - 1]?.loss || '...'}
              </span>
            </div>
            <div className="h-32 w-full min-h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metricsHistory}>
                  <defs>
                    <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FB923C" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#FB923C" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="epoch" hide />
                  <YAxis stroke="#ffffff40" fontSize={10} tickFormatter={(val) => val.toFixed(1)} />
                  <Area type="monotone" dataKey="loss" stroke="#FB923C" strokeWidth={2} fillOpacity={1} fill="url(#colorLoss)" isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Metrics & Logs */}
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 text-center relative overflow-hidden">
            <div className="relative z-10">
              <div className="text-white/40 text-xs font-bold uppercase tracking-widest mb-2">Época Actual</div>
              <div className="text-5xl font-black text-white mb-2">{currentEpoch}</div>
              <div className="text-white/40 text-xs text-center">de {totalEpochs}</div>
            </div>
            {/* Progress Ring Background Simulated */}
            <div className="absolute top-0 left-0 bg-blue-600/10 h-full transition-all duration-200" style={{ width: `${(currentEpoch / totalEpochs) * 100}%` }}></div>
          </div>

          <div className="bg-black/40 border border-white/10 rounded-[2rem] p-6 h-[400px] overflow-hidden flex flex-col font-mono text-xs">
            <div className="flex items-center gap-2 text-white/40 mb-4 pb-2 border-b border-white/5">
              <Terminal size={14} /> System Logs
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2">
              {logs.map((log, i) => (
                <div key={i} className="text-white/70 break-all">
                  <span className="text-blue-500 mr-2">[{new Date().toLocaleTimeString()}]</span>
                  {log}
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 3. Validación y Publicación
  const renderValidation = () => (
    <div className="max-w-5xl mx-auto space-y-8 animate-in zoom-in duration-500">
      <div className="text-center space-y-4 py-8">
        <div className="w-24 h-24 bg-green-500 rounded-full mx-auto flex items-center justify-center shadow-[0_0_50px_rgba(34,197,94,0.3)] animate-bounce">
          <CheckCircle2 size={48} className="text-white" />
        </div>
        <h2 className="text-4xl font-black text-white">¡Modelo Entrenado!</h2>
        <p className="text-white/60 text-lg">El nuevo modelo ha alcanzado un <strong>98.4%</strong> de precisión promedio.</p>
      </div>

      {/* Resumen de Modelos a Publicar */}
      <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8">
        <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-3">
          <Package className="text-blue-400" />
          Módulos incluidos en esta versión
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {selectedModules.map(modId => {
            const mod = getModuleInfo(modId);
            // Simular métrica final para este módulo (tomada del historial o al azar alto)
            const finalAcc = metricsHistory.length > 0 ? metricsHistory[metricsHistory.length - 1][modId] : '99.0';

            return (
              <div key={modId} className="flex items-center gap-4 bg-black/20 p-4 rounded-2xl border border-white/5">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shadow-lg" style={{ backgroundColor: mod.color }}>
                  {mod.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-white font-bold">{mod.name}</h4>
                  <div className="text-green-400 text-xs font-bold">Acc: {finalAcc}%</div>
                </div>
                <CheckCircle2 size={20} className="text-green-500 ml-auto" />
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/5">
          <div className="text-center">
            <div className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">Muestras Totales</div>
            <div className="text-2xl font-black text-white">
              {selectedModules.reduce((acc, id) => acc + getModuleInfo(id).samples, 0)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">Pérdida (Loss)</div>
            <div className="text-2xl font-black text-orange-400">0.0241</div>
          </div>
          <div className="text-center">
            <div className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">Tamaño Est.</div>
            <div className="text-2xl font-black text-blue-400">14.2 MB</div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 flex items-center justify-between gap-8 shadow-2xl">
        <div className="flex-1">
          <h4 className="text-white font-bold text-lg mb-2">Publicar Versión 2.0</h4>
          <p className="text-white/40 text-sm">Al publicar, estos {selectedModules.length} módulos estarán inmediatamente disponibles para el reconocimiento en tiempo real.</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setStep('selection')}
            className="px-6 py-4 rounded-2xl border border-white/10 text-white font-bold text-sm hover:bg-white/5"
          >
            Cancelar
          </button>
          <button
            onClick={handlePublish}
            className="px-8 py-4 rounded-2xl bg-white text-slate-900 font-black text-sm uppercase tracking-widest hover:bg-gray-200 transition-all shadow-xl shadow-white/10 flex items-center gap-2"
          >
            <Share2 size={18} />
            Publicar Ahora
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Header Interactivo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/40 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/20">
            <Layers className="text-white" size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Centro de Entrenamiento</h2>
            <p className="text-white/40 text-sm">Pipeline de Machine Learning y gestión de modelos</p>
          </div>
        </div>

        {/* Stepper Wizard */}
        <div className="flex items-center bg-black/20 rounded-full p-2 border border-white/5">
          {['selection', 'training', 'validation'].map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${step === s ? 'bg-white text-black' :
                (['selection', 'training', 'validation'].indexOf(step) > i) ? 'text-green-400' : 'text-white/20'
                }`}>
                {s === 'selection' ? 'Datos' : s === 'training' ? 'Entreno' : 'Validación'}
              </div>
              {i < 2 && <ChevronRight size={14} className="text-white/10 mx-1" />}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="min-h-[500px]">
        {step === 'selection' && renderSelection()}
        {step === 'training' && renderTraining()}
        {step === 'validation' && renderValidation()}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default TrainingSection;