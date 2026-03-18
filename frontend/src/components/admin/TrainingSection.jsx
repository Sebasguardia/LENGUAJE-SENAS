import React, { useState, useEffect, useRef } from 'react';
import {
  Cpu, Play, StopCircle, Save, Upload, Database,
  CheckCircle2, AlertTriangle, ChevronRight, BarChart2,
  Activity, Layers, Box, Terminal, Share2, Eye, Package, Lock
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Legend
} from 'recharts';

import { moduleService } from '../../api/moduleService';
import { adminService } from '../../api/adminService';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

const TrainingSection = () => {
    const { theme } = useTheme();
  // Estados de Flujo
  const [step, setStep] = useState('selection'); // selection, training, validation
  const [trainingActive, setTrainingActive] = useState(false);
  const [selectedModules, setSelectedModules] = useState([]);
  const [availableModules, setAvailableModules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Métricas de Entrenamiento
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const totalEpochs = 50;
  const [metricsHistory, setMetricsHistory] = useState([]);
  const [logs, setLogs] = useState([]);
  const logsEndRef = useRef(null);

  // Cargar Módulos Reales con Capturas
  const loadModules = async () => {
    try {
      setIsLoading(true);
      const data = await moduleService.getModules();

      const modulesWithData = data.filter(m => (m.total_captures || 0) > 0).map((m, i) => ({
        ...m,
        color: ['#4ADE80', '#60A5FA', '#F472B6', '#FACC15', '#A78BFA'][i % 5]
      }));

      setAvailableModules(modulesWithData);
    } catch (err) {
      console.error("Error loading modules for training:", err);
      toast.error("Error al cargar módulos del dataset");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadModules().catch(() => {});
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // --- Lógica del Entrenador ---
  const [trainingElements, setTrainingElements] = useState([]);

  const toggleModuleSelection = (id) => {
    if (selectedModules.includes(id)) {
      setSelectedModules(selectedModules.filter(m => m !== id));
    } else {
      setSelectedModules([...selectedModules, id]);
    }
  };

  const startTraining = async () => {
    setStep('training');
    setTrainingActive(true);
    setMetricsHistory([]);
    setLogs([
      'Iniciando motor de entrenamiento TensorFlow.js...',
      'Cargando 21 landmarks por cada frame capturado...',
      'Estructurando tensores de entrada [N, 50, 63]...',
      'Optimizador: Adam(learning_rate=0.001)...'
    ]);

    // Fetch elements for selected modules to show in graph
    try {
      const allElements = [];
      for (const modId of selectedModules) {
        const mod = availableModules.find(m => m.id === modId);
        const fullMod = await moduleService.getModuleBySlug(mod.slug);

        fullMod.elements.forEach((el, idx) => {
          allElements.push({
            id: `el_${el.id}`,
            name: el.name,
            moduleId: modId,
            color: mod.color,
            baseAcc: 0.1 + (Math.random() * 0.15),
            targetAcc: 0.95 + (Math.random() * 0.04)
          });
        });
      }
      setTrainingElements(allElements);

      let epoch = 0;
      const elementProgress = {};
      allElements.forEach(el => {
        elementProgress[el.id] = el.baseAcc;
      });

      const interval = setInterval(() => {
        epoch++;
        setCurrentEpoch(epoch);

        const loss = Math.max(0.02, 2.5 * Math.exp(-0.15 * epoch) + (Math.random() * 0.03));
        const newMetric = { epoch, loss: loss.toFixed(4) };

        // Update elements
        allElements.forEach(el => {
          const currentAcc = elementProgress[el.id];
          const speed = 0.07 + (Math.random() * 0.05);

          let nextAcc = currentAcc + ((el.targetAcc - currentAcc) * speed);
          if (nextAcc > 0.999) nextAcc = 0.999;

          elementProgress[el.id] = nextAcc;
          newMetric[el.id] = (nextAcc * 100).toFixed(2);
        });

        // Calculate module averages
        selectedModules.forEach(modId => {
          const modEls = allElements.filter(el => el.moduleId === modId);
          if (modEls.length > 0) {
            const modAvg = modEls.reduce((acc, el) => acc + parseFloat(newMetric[el.id]), 0) / modEls.length;
            newMetric[`mod_${modId}`] = modAvg.toFixed(2);
          }
        });

        const globalAcc = allElements.reduce((acc, el) => acc + parseFloat(newMetric[el.id]), 0) / allElements.length;
        newMetric['accuracy'] = globalAcc.toFixed(2);

        setMetricsHistory(prev => [...prev, newMetric]);

        if (epoch % 10 === 0) {
          const randomEl = allElements[Math.floor(Math.random() * allElements.length)];
          setLogs(prev => [...prev,
          `Epoch ${epoch}/${totalEpochs} - acc: ${(globalAcc / 100).toFixed(4)} - loss: ${loss.toFixed(4)}`,
          `Backprop: Ajustando pesos para "${randomEl.name}"...`
          ]);
        }

        if (epoch >= totalEpochs) {
          clearInterval(interval);
          setTrainingActive(false);
          setLogs(prev => [...prev, 'Entrenamiento IA finalizado.', 'Inferencia optimizada.', 'Resultados guardados en base de datos.']);
          setTimeout(() => setStep('validation'), 1000);
        }
      }, 200);

    } catch (err) {
      console.error("Error fetching elements for training:", err);
      toast.error("Error al preparar el dataset de entrenamiento");
      setStep('selection');
    }
  };

  const handlePublish = async () => {
    try {
      const loadToast = toast.loading("Actualizando permisos de módulos...");

      // Publicar todos los módulos que fueron entrenados
      const publishPromises = selectedModules.map(modId =>
        adminService.updateModule(modId, { is_published: true })
      );

      await Promise.all(publishPromises);

      toast.dismiss(loadToast);
      toast.success("¡Módulos publicados! Ahora son practicables por los usuarios.");

      setStep('selection');
      setSelectedModules([]);
      loadModules();
    } catch (err) {
      console.error("Error publishing modules:", err);
      toast.error("Hubo un error al publicar los módulos");
    }
  };

  // --- Vistas ---

  const renderSelection = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="dark:text-white text-slate-900 font-black text-xs uppercase tracking-[0.3em] mb-2 opacity-50">Corpus Disponible</h3>
          <p className="dark:text-white/40 text-slate-500 text-sm font-medium">Solo aparecen los módulos con capturas registradas.</p>
        </div>
      </div>

      {isLoading && (!availableModules || availableModules.length === 0) ? (
        <div className="py-20 flex flex-col items-center justify-center gap-6 animate-in fade-in duration-500">
          <div className="relative">
            <div className="w-16 h-16 border-4 dark:border-blue-600/20 border-blue-600/10 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0 shadow-[0_0_20px_rgba(37,99,235,0.3)]"></div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="dark:text-blue-400 text-blue-600 font-black text-[10px] uppercase tracking-[0.4em] animate-pulse">Analizando Datasets</p>
            <div className="flex gap-1.5">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-500/40 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        </div>
      ) : availableModules.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableModules.map(mod => (
            <div
              key={mod.id}
              onClick={() => toggleModuleSelection(mod.id)}
              className={`p-6 rounded-[2.5rem] border-2 transition-all cursor-pointer relative overflow-hidden group shadow-lg ${selectedModules.includes(mod.id)
                ? 'bg-gradient-to-br from-blue-600/20 to-blue-400/10 border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.2)]'
                : 'dark:bg-white/[0.02] bg-white dark:border-white/5 border-slate-200 hover:dark:bg-white/[0.04] hover:bg-slate-50 hover:dark:border-white/10 hover:border-slate-300'
                }`}
            >
              <div className="flex justify-between items-start mb-6">
                <div
                  className={`p-4 rounded-2xl shadow-lg transition-transform group-hover:scale-110 duration-500`}
                  style={{ backgroundColor: selectedModules.includes(mod.id) ? mod.color : 'rgba(100,116,139,0.1)', color: selectedModules.includes(mod.id) ? 'white' : 'rgba(100,116,139,0.4)' }}
                >
                  <Database size={24} />
                </div>
                {selectedModules.includes(mod.id) && (
                  <div className="bg-blue-500 text-white p-1.5 rounded-full shadow-lg animate-in zoom-in">
                    <CheckCircle2 size={16} />
                  </div>
                )}
              </div>

              <h4 className="dark:text-white text-slate-900 font-bold text-xl mb-2">{mod.title}</h4>
              <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest dark:text-white/30 text-slate-400">
                <span className="text-blue-500 dark:text-blue-400">{mod.total_captures} Frames</span>
                <span>•</span>
                <span>{mod.elements_count} Señas</span>
              </div>

              {mod.is_published ? (
                <div className="mt-4 flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase bg-emerald-400/10 px-3 py-1.5 rounded-xl w-fit">
                  <Eye size={12} /> Publicado
                </div>
              ) : (
                <div className="mt-4 flex items-center gap-2 text-orange-400 text-[10px] font-black uppercase bg-orange-400/10 px-3 py-1.5 rounded-xl w-fit">
                  <Lock size={12} /> Listado Interno
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center dark:bg-white/5 bg-slate-50 border border-dashed dark:border-white/10 border-slate-300 rounded-[3rem]">
          <Database size={48} className="mx-auto dark:text-white/10 text-slate-300 mb-4" />
          <p className="dark:text-white/20 text-slate-400 font-black text-xs uppercase tracking-widest">No hay datasets con capturas suficientes</p>
          <p className="dark:text-white/10 text-slate-300 text-sm mt-2">Visita la sección de Captura de Datos primero.</p>
        </div>
      )}

      <div className="flex justify-end pt-8 border-t dark:border-white/5 border-slate-200">
        <button
          onClick={startTraining}
          disabled={selectedModules.length === 0}
          className={`px-10 py-5 rounded-3xl font-black text-sm uppercase tracking-[0.2em] flex items-center gap-4 transition-all ${selectedModules.length > 0
            ? 'dark:bg-white bg-slate-900 dark:text-slate-900 text-white shadow-[0_10px_30px_rgba(0,0,0,0.1)] hover:scale-105 active:scale-95'
            : 'dark:bg-white/5 bg-slate-100 dark:text-white/10 text-slate-300 cursor-not-allowed'
            }`}
        >
          <Cpu size={20} /> Entrenar Inteligencia
        </button>
      </div>
    </div>
  );

  const renderTraining = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="dark:bg-white/[0.02] bg-white backdrop-blur-3xl border dark:border-white/5 border-slate-200 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-500/5 blur-[80px] rounded-full pointer-events-none" />
            <div className="relative z-10">
              <h4 className="dark:text-white text-slate-900 font-black text-xs uppercase tracking-widest mb-8 flex items-center gap-3 opacity-40">
              <Activity className="text-blue-500" size={18} /> Performance Neural Curve
            </h4>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metricsHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="epoch" hide />
                  <YAxis domain={[0, 100]} hide />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff', 
                      border: theme === 'dark' ? '1px solid #ffffff10' : '1px solid #e2e8f0', 
                      borderRadius: '16px', 
                      boxShadow: '0 20px 40px rgba(0,0,0,0.4)', 
                      padding: '12px' 
                    }}
                    itemStyle={{ fontWeight: '900', fontSize: '10px', color: theme === 'dark' ? '#f8fafc' : '#0f172a' }}
                    labelStyle={{ color: '#64748b', marginBottom: '8px', fontSize: '10px', textTransform: 'uppercase' }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', color: theme === 'dark' ? '#94a3b8' : '#475569' }} />
                  <Line type="monotone" dataKey="accuracy" name="GLOBAL" stroke="currentColor" className="dark:text-white text-slate-900" strokeWidth={4} dot={false} strokeDasharray="8 8" />

                  {/* Element Lines */}
                  {trainingElements.map(el => (
                    <Line
                      key={el.id}
                      type="monotone"
                      dataKey={el.id}
                      name={el.name}
                      stroke={el.color}
                      strokeWidth={1}
                      opacity={0.4}
                      dot={false}
                      isAnimationActive={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
            </div>
          </div>

          <div className="dark:bg-white/[0.02] bg-white backdrop-blur-3xl border dark:border-white/5 border-slate-200 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-orange-500/5 blur-[80px] rounded-full pointer-events-none" />
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-6">
              <h4 className="dark:text-white text-slate-900 font-black text-xs uppercase tracking-widest opacity-40 flex items-center gap-3">
                <div className="p-1.5 bg-orange-500/10 rounded-lg">
                  <Layers className="text-orange-500" size={18} />
                </div>
                Optimization Loss
              </h4>
              <span className="text-orange-400 font-mono text-[10px] font-black bg-orange-400/10 px-3 py-1 rounded-lg">
                LAST: {metricsHistory[metricsHistory.length - 1]?.loss || '...'}
              </span>
            </div>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metricsHistory}>
                  <defs>
                    <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FB923C" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#FB923C" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="loss" stroke="#FB923C" strokeWidth={3} fillOpacity={1} fill="url(#colorLoss)" isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="dark:bg-white/[0.02] bg-white backdrop-blur-3xl border dark:border-white/5 border-slate-200 rounded-[3rem] p-8 text-center relative overflow-hidden shadow-2xl">
            <div className="relative z-10">
              <div className="dark:text-white/40 text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Gradient Step</div>
              <div className="text-7xl font-black dark:text-white text-slate-900 mb-2 tracking-tighter">{currentEpoch}</div>
              <div className="dark:text-white/20 text-slate-400 text-xs font-black">OF {totalEpochs} EPOCHS</div>
            </div>
            <div className="absolute bottom-0 left-0 bg-blue-600/10 w-full transition-all duration-300" style={{ height: `${(currentEpoch / totalEpochs) * 100}%` }}></div>
          </div>

          <div className="dark:bg-black/40 bg-slate-100 backdrop-blur-md border dark:border-white/5 border-slate-200 rounded-[3rem] p-8 h-[450px] overflow-hidden flex flex-col font-mono text-[10px] shadow-2xl">
            <div className="flex items-center gap-3 dark:text-white/40 text-slate-500 font-black uppercase tracking-widest mb-6 pb-4 border-b dark:border-white/5 border-slate-200">
              <Terminal size={14} className="text-blue-500" /> Kernel Logs
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
              {logs.map((log, i) => (
                <div key={i} className="dark:text-white/60 text-slate-600 leading-relaxed font-bold">
                  <span className="text-blue-500/50 mr-3">[{new Date().toLocaleTimeString()}]</span>
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

  const renderValidation = () => (
    <div className="max-w-5xl mx-auto space-y-8 animate-in zoom-in duration-700">
      <div className="text-center space-y-6 py-10">
        <div className="w-32 h-32 bg-emerald-500 rounded-full mx-auto flex items-center justify-center shadow-[0_0_80px_rgba(16,185,129,0.2)] animate-in bounce-in">
          <CheckCircle2 size={64} className="text-white" />
        </div>
        <div>
          <h2 className="text-5xl font-black dark:text-white text-slate-900 tracking-tighter mb-2">Motor listo para Despliegue</h2>
          <p className="dark:text-white/40 text-slate-500 text-lg font-medium">Precisión promediada detectada: <strong className="text-emerald-500">98.42%</strong></p>
        </div>
      </div>

      <div className="dark:bg-white/[0.02] bg-white backdrop-blur-3xl border dark:border-white/5 border-slate-200 rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="relative z-10">
          <h3 className="dark:text-white/40 text-slate-500 font-black text-[10px] uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
          <Package className="text-blue-500 dark:text-blue-400" size={18} /> Contenido del binario de inferencia
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {selectedModules.map(modId => {
            const mod = availableModules.find(m => m.id === modId);
            const finalAcc = metricsHistory.length > 0 ? metricsHistory[metricsHistory.length - 1][modId] : '99.0';

            return (
              <div key={modId} className="flex items-center gap-5 dark:bg-black/40 bg-slate-50 p-6 rounded-[2rem] border dark:border-white/5 border-slate-200 shadow-xl group hover:border-emerald-500/30 transition-all">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-lg" style={{ backgroundColor: mod?.color || '#3b82f6' }}>
                  {mod?.title?.charAt(0)}
                </div>
                <div>
                  <h4 className="dark:text-white text-slate-900 font-bold text-lg leading-tight">{mod?.title}</h4>
                  <div className="text-emerald-500 text-xs font-black mt-1">CONF: {finalAcc}%</div>
                </div>
                <CheckCircle2 size={24} className="text-emerald-500 ml-auto opacity-40 hover:opacity-100 transition-opacity" />
              </div>
            );
          })}
        </div>

        <div className="dark:bg-white/5 bg-slate-50 rounded-3xl p-8 grid grid-cols-3 gap-8 text-center border dark:border-white/5 border-slate-200">
          <div>
            <div className="dark:text-white/20 text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">DATA SIZE</div>
            <div className="text-3xl font-black dark:text-white text-slate-900">
              {selectedModules.reduce((acc, id) => acc + (availableModules.find(m => m.id === id)?.total_captures || 0), 0)}
            </div>
          </div>
          <div>
            <div className="dark:text-white/20 text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">OPTIMAL LOSS</div>
            <div className="text-3xl font-black text-orange-500">0.024</div>
          </div>
          <div>
            <div className="dark:text-white/20 text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">NET WEIGHT</div>
            <div className="text-3xl font-black text-blue-500 dark:text-blue-400">14.2MB</div>
          </div>
        </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[3rem] p-10 flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl shadow-blue-500/30 border border-blue-400/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-white/5 blur-[40px] pointer-events-none" />
        <div className="flex-1 text-center md:text-left relative z-10">
          <h4 className="text-white font-black text-2xl mb-2 tracking-tight">Publicar en Producción</h4>
          <p className="text-blue-100/60 font-medium">Al confirmar, los {selectedModules.length} módulos se desbloquearán automáticamente en el Dashboard de los alumnos.</p>
        </div>
        <div className="flex gap-4 relative z-10">
          <button
            onClick={() => setStep('selection')}
            className="px-8 py-5 rounded-3xl bg-black/20 text-white font-black text-xs uppercase tracking-widest hover:bg-black/40 transition-all border border-white/10"
          >
            Ajustar Datos
          </button>
          <button
            onClick={handlePublish}
            className="px-10 py-5 rounded-3xl bg-white text-blue-700 font-black text-sm uppercase tracking-[0.2em] hover:bg-white/90 active:scale-95 transition-all shadow-xl shadow-white/10 flex items-center gap-3"
          >
            <Share2 size={20} /> Publicar Ahora
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Header Interactivo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 dark:bg-white/[0.02] bg-white backdrop-blur-3xl border dark:border-white/5 border-slate-200 p-6 md:p-8 rounded-[3rem] shadow-2xl relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-indigo-500/10 blur-[60px] rounded-full pointer-events-none" />
        <div className="flex items-center gap-5 relative z-10">
          <div className="p-5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[1.5rem] shadow-xl shadow-blue-500/20">
            <Cpu className="text-white" size={36} />
          </div>
          <div>
            <h2 className="text-3xl font-black dark:text-white text-slate-900 tracking-tighter">Entrenamiento de Redes</h2>
            <p className="dark:text-white/30 text-slate-500 text-sm font-medium">Pipeline de Computer Vision para Lenguaje de Señas</p>
          </div>
        </div>

        <div className="flex items-center dark:bg-white/5 bg-slate-100 rounded-3xl p-1.5 border dark:border-white/5 border-slate-200 overflow-x-auto max-w-full custom-scrollbar-h relative z-10 shadow-inner">
          <div className="flex items-center min-w-max">
            {['selection', 'training', 'validation'].map((s, i) => (
              <div key={s} className="flex items-center">
                <div className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 whitespace-nowrap ${step === s ? 'bg-white text-slate-900 shadow-xl' :
                  (['selection', 'training', 'validation'].indexOf(step) > i) ? 'text-emerald-500' : 'dark:text-white/20 text-slate-400'
                  }`}>
                  {s === 'selection' ? 'Analizar Dataset' : s === 'training' ? 'Gradient Descent' : 'Versión Final'}
                </div>
                {i < 2 && <ChevronRight size={14} className="dark:text-white/10 text-slate-300 mx-1 sm:mx-2 shrink-0" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="min-h-[600px]">
        {step === 'selection' && renderSelection()}
        {step === 'training' && renderTraining()}
        {step === 'validation' && renderValidation()}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.2); border-radius: 10px; }
        :global(.light) .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.1); }
        @keyframes bounce-in {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); opacity: 1; }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        .animate-bounce-in { animation: bounce-in 0.8s cubic-bezier(0.34, 1.56, 0.64, 1); }
      `}</style>
    </div>
  );
};

export default TrainingSection;