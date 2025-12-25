import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Target, Clock, TrendingUp, Award, Database } from 'lucide-react';

const AnalyticsCharts = () => {
  const [moduleData, setModuleData] = useState({});

  useEffect(() => {
    const savedData = localStorage.getItem('moduleCaptureData');
    if (savedData) {
      setModuleData(JSON.parse(savedData));
    }
  }, []);

  const moduleNames = {
    vocals: 'Vocales',
    numbers: 'Números',
    alphabet: 'Abecedario',
    math: 'Signos Matemáticos',
    words: 'Palabras'
  };

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

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <BarChart3 size={24} />
          Analíticas de Datos Capturados
        </h2>
        <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-semibold">
          Total: {getTotalSamples()} muestras
        </div>
      </div>

      {Object.keys(moduleData).length === 0 ? (
        <div className="text-center py-12">
          <Database size={64} className="mx-auto text-white/40 mb-4" />
          <h3 className="text-white text-lg mb-2">No hay datos capturados</h3>
          <p className="text-white/60">Comienza capturando datos en la sección correspondiente</p>
        </div>
      ) : (
        <>
          {/* Resumen general */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg p-4 text-center border border-blue-400/30">
              <Database size={24} className="mx-auto text-blue-400 mb-2" />
              <div className="text-white font-bold text-2xl">{getTotalSamples()}</div>
              <div className="text-blue-300 text-sm">Muestras Totales</div>
            </div>
            
            <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg p-4 text-center border border-green-400/30">
              <Target size={24} className="mx-auto text-green-400 mb-2" />
              <div className="text-white font-bold text-2xl">
                {Object.keys(moduleData).length}
              </div>
              <div className="text-green-300 text-sm">Módulos Activos</div>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-lg p-4 text-center border border-yellow-400/30">
              <Award size={24} className="mx-auto text-yellow-400 mb-2" />
              <div className="text-white font-bold text-2xl">
                {Math.round(Object.keys(moduleData).reduce((acc, key) => acc + getModuleCompletion(key), 0) / Object.keys(moduleData).length)}%
              </div>
              <div className="text-yellow-300 text-sm">Completación Promedio</div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg p-4 text-center border border-purple-400/30">
              <TrendingUp size={24} className="mx-auto text-purple-400 mb-2" />
              <div className="text-white font-bold text-2xl">
                {Object.values(moduleData).reduce((total, module) => total + module.elements.length, 0)}
              </div>
              <div className="text-purple-300 text-sm">Elementos Totales</div>
            </div>
          </div>

          {/* Gráficas de barras por módulo */}
          <div className="space-y-6">
            {Object.keys(moduleData).map(moduleKey => (
              <div key={moduleKey} className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 size={18} />
                  {moduleNames[moduleKey]} - {Math.round(getModuleCompletion(moduleKey))}% Completado
                </h3>
                
                <div className="space-y-3">
                  {moduleData[moduleKey].elements.map((element, index) => {
                    const percentage = (element.captured / element.target) * 100;
                    return (
                      <div key={index} className="flex items-center gap-3">
                        <span className="text-white/80 w-16 text-sm font-medium">{element.name}</span>
                        <div className="flex-1">
                          <div className="flex justify-between text-white text-xs mb-1">
                            <span>{element.captured}/{element.target} muestras</span>
                            <span>{Math.round(percentage)}%</span>
                          </div>
                          <div className="w-full bg-white/20 rounded-full h-3">
                            <div 
                              className="bg-gradient-to-r from-green-400 to-blue-400 h-3 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsCharts;