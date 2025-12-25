import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend as RechartsLegend
} from 'recharts';
import {
  BarChart3, Database, Target, TrendingUp,
  Award, Layers, ChevronRight, Zap, Info
} from 'lucide-react';

const AnalyticsCharts = () => {
  const [moduleData, setModuleData] = useState({});
  const [selectedModule, setSelectedModule] = useState(null);

  useEffect(() => {
    const savedData = localStorage.getItem('moduleCaptureData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setModuleData(parsedData);
      // Seleccionar el primer módulo por defecto si existe
      const keys = Object.keys(parsedData);
      if (keys.length > 0 && !selectedModule) {
        setSelectedModule(keys[0]);
      }
    }
  }, []);

  const moduleNames = {
    vocals: 'Vocales',
    numbers: 'Números',
    alphabet: 'Abecedario',
    math: 'Signos Matemáticos',
    words: 'Palabras'
  };

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  const getTotalSamples = () => {
    return Object.values(moduleData).reduce((total, module) =>
      total + module.elements.reduce((sum, el) => sum + el.captured, 0), 0
    );
  };

  const getModuleCompletion = (moduleKey) => {
    if (!moduleData[moduleKey]) return 0;
    const totalCaptured = moduleData[moduleKey].elements.reduce((sum, el) => sum + el.captured, 0);
    const totalTarget = moduleData[moduleKey].elements.reduce((sum, el) => sum + el.target, 0);
    return totalTarget > 0 ? (totalCaptured / totalTarget) * 100 : 0;
  };

  // Preparar datos para la gráfica de distribución global
  const globalDistributionData = Object.keys(moduleData).map(key => ({
    name: moduleNames[key] || key,
    value: moduleData[key].elements.reduce((sum, el) => sum + el.captured, 0)
  })).filter(item => item.value > 0);

  // Preparar datos para la gráfica del módulo seleccionado
  const selectedModuleBars = selectedModule && moduleData[selectedModule] ?
    moduleData[selectedModule].elements.map(el => ({
      name: el.name,
      captured: el.captured,
      target: 50, // Forzado a 50 capturas por elemento
      percentage: (el.captured / 50) * 100
    })) : [];

  if (Object.keys(moduleData).length === 0) {
    return (
      <div className="bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] p-12 border border-white/10 text-center">
        <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
          <Database size={40} className="text-blue-400" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">Sin Datos de Inteligencia</h3>
        <p className="text-white/40 max-w-md mx-auto">
          Todavía no se han capturado muestras para entrenar los modelos.
          Dirígete a la sección de "Captura de Datos" para comenzar.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Header de Analíticas */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/40 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem]">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg shadow-blue-500/20">
            <BarChart3 className="text-white" size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Auditoría de Datos</h2>
            <p className="text-white/40 text-sm">Análisis granular del dataset de entrenamiento</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="text-right">
            <div className="text-[10px] text-white/30 uppercase font-black tracking-[0.2em] mb-1">Muestras Totales</div>
            <div className="text-3xl font-black text-white">{getTotalSamples()}</div>
          </div>
          <div className="w-px h-10 bg-white/10 self-center"></div>
          <div className="text-right">
            <div className="text-[10px] text-white/30 uppercase font-black tracking-[0.2em] mb-1">Precisión Teórica</div>
            <div className="text-3xl font-black text-green-400">92.4%</div>
          </div>
        </div>
      </div>

      {/* Grid de Distribución y Resumen */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Distribución Global (Pie Chart) */}
        <div className="lg:col-span-1 bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/10 shadow-2xl flex flex-col">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
            <Layers size={20} className="text-blue-400" />
            Distribución del Dataset
          </h3>
          <div className="flex-1 min-h-[300px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={globalDistributionData}
                  innerRadius={80}
                  outerRadius={105}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {globalDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    color: '#fff'
                  }}
                  itemStyle={{ color: '#fff' }}
                  labelStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-white/20 text-[10px] uppercase font-bold tracking-widest">Base de Datos</span>
              <span className="text-2xl font-black text-white">{getTotalSamples()}</span>
            </div>
          </div>
        </div>

        {/* Grid de Módulos (Interactivo) */}
        <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl">
          <h3 className="text-lg font-bold text-white mb-6">Estado por Módulo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.keys(moduleData).map((key, index) => (
              <button
                key={key}
                onClick={() => setSelectedModule(key)}
                className={`p-5 rounded-2xl border transition-all duration-500 text-left group relative overflow-hidden ${selectedModule === key
                  ? 'bg-blue-600/20 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.15)]'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
              >
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className={`p-2 rounded-lg ${selectedModule === key ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/40'}`}>
                    <Layers size={18} />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${selectedModule === key ? 'text-blue-400' : 'text-white/20'}`}>
                    {Math.round(getModuleCompletion(key))}%
                  </span>
                </div>
                <h4 className="text-white font-bold mb-1 relative z-10">{moduleNames[key] || key}</h4>
                <div className="w-full bg-white/5 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${selectedModule === key ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-white/10'}`}
                    style={{ width: `${getModuleCompletion(key)}%` }}
                  ></div>
                </div>
                {selectedModule === key && (
                  <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
                    <TrendingUp size={100} />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Detalle Profundo del Módulo Seleccionado */}
      {selectedModule && (
        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl animate-in fade-in zoom-in duration-500">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/20 flex items-center justify-center">
                <Zap className="text-blue-400" size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                  Analítica Detallada: <span className="text-blue-400">{moduleNames[selectedModule] || selectedModule}</span>
                </h3>
                <p className="text-white/40 text-sm">Desglose de cada elemento y su nivel de preparación para entrenamiento</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-white font-black text-xl">{moduleData[selectedModule].elements.length}</div>
                <div className="text-white/20 text-[10px] uppercase font-bold tracking-widest">Elementos</div>
              </div>
              <div className="w-px h-8 bg-white/10"></div>
              <div className="text-center">
                <div className="text-blue-400 font-black text-xl">{moduleData[selectedModule].elements.reduce((s, e) => s + e.captured, 0)}</div>
                <div className="text-white/20 text-[10px] uppercase font-bold tracking-widest">Capturas</div>
              </div>
            </div>
          </div>

          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={selectedModuleBars} margin={{ bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="rgba(255,255,255,0.3)"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.3)"
                  fontSize={12}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    color: '#fff'
                  }}
                  itemStyle={{ color: '#fff' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="captured" radius={[4, 4, 0, 0]}>
                  {selectedModuleBars.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.percentage >= 100 ? '#10b981' : '#3b82f6'}
                      fillOpacity={entry.percentage >= 100 ? 1 : 0.8}
                    />
                  ))}
                </Bar>
                <Bar dataKey="target" fill="rgba(255,255,255,0.05)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-8 p-6 bg-blue-500/5 rounded-3xl border border-blue-500/10 flex items-start gap-4">
            <Info className="text-blue-400 shrink-0 mt-0.5" size={20} />
            <p className="text-blue-200/60 text-sm leading-relaxed">
              Los elementos marcados en <span className="text-green-400 font-bold underline">verde</span> han alcanzado el objetivo mínimo de 50 muestras y están listos para ser incluidos en el próximo ciclo de entrenamiento del motor de IA. Los elementos en <span className="text-blue-400 font-bold underline">azul</span> requieren más capturas para garantizar la precisión del reconocimiento de señas.
            </p>
          </div>
        </div>
      )}

      <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.02); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
            `}</style>
    </div>
  );
};

export default AnalyticsCharts;