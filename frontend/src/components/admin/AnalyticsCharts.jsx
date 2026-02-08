import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie
} from 'recharts';
import {
  BarChart3, Layers, TrendingUp,
  Zap, Info, Loader2
} from 'lucide-react';
import { moduleService } from '../../api/moduleService';

const AnalyticsCharts = () => {
  const [modules, setModules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedModuleId, setSelectedModuleId] = useState(null);

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await moduleService.getModules();
        setModules(data);
        if (data.length > 0) {
          setSelectedModuleId(data[0].id);
        }
      } catch (error) {
        console.error("Error fetching modules for analytics:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const getTotalSamples = () => {
    return modules.reduce((total, module) =>
      total + (module.elements ? module.elements.reduce((sum, el) => sum + (el.captured_count || 0), 0) : 0), 0
    );
  };

  const currentModule = modules.find(m => m.id === selectedModuleId);

  const getModuleCompletion = (module) => {
    if (!module || !module.elements || module.elements.length === 0) return 0;

    // Target is 50 per element
    const totalTarget = module.elements.length * 50;
    const totalCaptured = module.elements.reduce((sum, el) => sum + (el.captured_count || 0), 0);

    return totalTarget > 0 ? (totalCaptured / totalTarget) * 100 : 0;
  };

  // Preparar datos para la gráfica de distribución global
  const globalDistributionData = modules.map(mod => ({
    name: mod.title,
    value: mod.elements ? mod.elements.reduce((sum, el) => sum + (el.captured_count || 0), 0) : 0
  })).filter(item => item.value > 0);

  // Fallback si no hay datos capturados aún
  const displayDistributionData = globalDistributionData.length > 0 ? globalDistributionData : modules.map(mod => ({
    name: mod.title,
    value: 1 // Dummy value
  }));

  // Preparar datos para la gráfica del módulo seleccionado
  const selectedModuleBars = currentModule && currentModule.elements ?
    currentModule.elements.map(el => ({
      name: el.name,
      captured: el.captured_count || 0,
      target: 50, // Meta fija de 50 capturas
      percentage: ((el.captured_count || 0) / 50) * 100
    })) : [];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] animate-pulse">
        <Loader2 size={40} className="text-blue-500 animate-spin mb-4" />
        <p className="text-white/40 font-medium">Cargando auditoría de datos...</p>
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
                  data={displayDistributionData}
                  innerRadius={80}
                  outerRadius={105}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {displayDistributionData.map((entry, index) => (
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
            {modules.map((mod) => {
              const completion = Math.round(getModuleCompletion(mod));
              const isSelected = selectedModuleId === mod.id;

              return (
                <button
                  key={mod.id}
                  onClick={() => setSelectedModuleId(mod.id)}
                  className={`p-5 rounded-2xl border transition-all duration-500 text-left group relative overflow-hidden ${isSelected
                    ? 'bg-blue-600/20 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.15)]'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                >
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/40'}`}>
                      <Layers size={18} />
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${isSelected ? 'text-blue-400' : 'text-white/20'}`}>
                      {completion}%
                    </span>
                  </div>
                  <h4 className="text-white font-bold mb-1 relative z-10">{mod.title}</h4>
                  <div className="w-full bg-white/5 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${isSelected ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-white/10'}`}
                      style={{ width: `${completion}%` }}
                    ></div>
                  </div>
                  {isSelected && (
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
                      <TrendingUp size={100} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detalle Profundo del Módulo Seleccionado */}
      {currentModule && (
        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl animate-in fade-in zoom-in duration-500">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/20 flex items-center justify-center">
                <Zap className="text-blue-400" size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                  Analítica Detallada: <span className="text-blue-400">{currentModule.title}</span>
                </h3>
                <p className="text-white/40 text-sm">Desglose de cada elemento y su nivel de preparación para entrenamiento</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-white font-black text-xl">{currentModule.elements?.length || 0}</div>
                <div className="text-white/20 text-[10px] uppercase font-bold tracking-widest">Elementos</div>
              </div>
              <div className="w-px h-8 bg-white/10"></div>
              <div className="text-center">
                <div className="text-blue-400 font-black text-xl">
                  {currentModule.elements ? currentModule.elements.reduce((s, e) => s + (e.captured_count || 0), 0) : 0}
                </div>
                <div className="text-white/20 text-[10px] uppercase font-bold tracking-widest">Capturas</div>
              </div>
            </div>
          </div>

          <div className="h-[400px] w-full">
            {selectedModuleBars.length > 0 ? (
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
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-white/20 italic">
                No hay elementos configurados para este módulo.
              </div>
            )}
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