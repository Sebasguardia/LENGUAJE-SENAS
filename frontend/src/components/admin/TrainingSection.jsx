import React, { useState, useEffect } from 'react';
import { Play, Square, TrendingUp, Cpu, Clock, Award, Save, BarChart3 } from 'lucide-react';

const TrainingSection = () => {
  const [trainingStatus, setTrainingStatus] = useState('idle');
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [moduleData, setModuleData] = useState({});
  const [trainingResults, setTrainingResults] = useState({});
  const TrainingGraph = ({ progress, metrics }) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    if (progress > 0) {
      setAnimatedProgress(0);
      const interval = setInterval(() => {
        setAnimatedProgress(prev => {
          if (prev >= progress) {
            clearInterval(interval);
            return progress;
          }
          return prev + 1;
        });
      }, 30);
      return () => clearInterval(interval);
    }
  }, [progress]);

  // Datos simulados para el gráfico de tendencia
  const trendData = [65, 68, 72, 75, 78, 82, 85, 88, 92, 94, 96, 94.3];
  const maxAccuracy = Math.max(...trendData);
  const minAccuracy = Math.min(...trendData);

  return (
    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
      <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
        <TrendingUp size={18} />
        Progreso del Entrenamiento
      </h4>
      
      {/* Gráfico de tendencia animado */}
      <div className="relative h-32 mb-4">
        <div className="absolute inset-0 flex items-end">
          {trendData.map((value, index) => (
            <div
              key={index}
              className="flex-1 flex flex-col items-center mx-1"
              style={{ height: '100%' }}
            >
              <div
                className="w-full bg-gradient-to-t from-green-400 to-blue-400 rounded-t transition-all duration-500"
                style={{
                  height: `${((value - minAccuracy) / (maxAccuracy - minAccuracy)) * 90}%`,
                  animationDelay: `${index * 100}ms`
                }}
              />
              <div className="text-white/40 text-xs mt-1">
                {index === trendData.length - 1 ? 'Ahora' : index + 1}
              </div>
            </div>
          ))}
        </div>
        
        {/* Línea de tendencia animada */}
        <div className="absolute inset-0">
          <svg width="100%" height="100%" className="overflow-visible">
            <path
              d={trendData.map((value, index) => {
                const x = (index / (trendData.length - 1)) * 100;
                const y = 100 - ((value - minAccuracy) / (maxAccuracy - minAccuracy)) * 90;
                return `${index === 0 ? 'M' : 'L'} ${x}% ${y}%`;
              }).join(' ')}
              stroke="url(#gradient)"
              strokeWidth="2"
              fill="none"
              strokeDasharray="1000"
              strokeDashoffset="1000"
              className="animate-drawPath"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        
        {/* Flecha indicadora */}
        <div
          className="absolute -top-2 transform -translate-x-1/2 transition-all duration-1000"
          style={{
            left: `${animatedProgress}%`,
            opacity: progress > 0 ? 1 : 0
          }}
        >
          <div className="text-green-400 text-lg">↑</div>
          <div className="text-white text-xs bg-green-500/20 px-2 py-1 rounded-full whitespace-nowrap">
            {Math.round(animatedProgress)}%
          </div>
        </div>
      </div>

      {/* Métricas en tiempo real */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-white font-bold text-lg">{animatedProgress}%</div>
          <div className="text-white/60 text-xs">Progreso</div>
        </div>
        <div>
          <div className="text-green-400 font-bold text-lg">
            {Math.round(minAccuracy + (animatedProgress / 100) * (maxAccuracy - minAccuracy))}%
          </div>
          <div className="text-white/60 text-xs">Precisión</div>
        </div>
        <div>
          <div className="text-blue-400 font-bold text-lg">
            {Math.round(animatedProgress * 2.5)}
          </div>
          <div className="text-white/60 text-xs">Épocas</div>
        </div>
      </div>
    </div>
  );
};

  // Cargar datos de módulos desde localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('moduleCaptureData');
    if (savedData) {
      const data = JSON.parse(savedData);
      setModuleData(data);
      
      // Generar resultados de entrenamiento basados en los datos capturados
      const results = {};
      Object.keys(data).forEach(moduleKey => {
        const totalCaptured = data[moduleKey].elements.reduce((sum, el) => sum + el.captured, 0);
        const totalTarget = data[moduleKey].elements.reduce((sum, el) => sum + el.target, 0);
        const completionRate = totalTarget > 0 ? (totalCaptured / totalTarget) * 100 : 0;
        
        results[moduleKey] = {
          accuracy: Math.min(99.9, 70 + (completionRate * 0.3)), // Simular precisión basada en datos
          samples: totalCaptured,
          progress: completionRate,
          elements: data[moduleKey].elements.map(el => ({
            name: el.name,
            accuracy: Math.min(99.9, 65 + Math.random() * 30),
            samples: el.captured
          }))
        };
      });
      setTrainingResults(results);
    }
  }, []);

  const moduleNames = {
    vocals: 'Vocales',
    numbers: 'Números',
    alphabet: 'Abecedario',
    math: 'Signos Matemáticos',
    words: 'Palabras'
  };

  const startTraining = () => {
    setTrainingStatus('training');
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          setTrainingStatus('completed');
          // Mejorar resultados después del entrenamiento
          const improvedResults = { ...trainingResults };
          Object.keys(improvedResults).forEach(moduleKey => {
            improvedResults[moduleKey].accuracy = Math.min(99.9, improvedResults[moduleKey].accuracy + Math.random() * 5);
          });
          setTrainingResults(improvedResults);
        }, 1000);
      }
      setTrainingProgress(progress);
    }, 300);
  };

  const stopTraining = () => {
    setTrainingStatus('idle');
    setTrainingProgress(0);
  };

  const saveModel = () => {
    // Guardar modelo entrenado
    localStorage.setItem('trainedModel', JSON.stringify({
      timestamp: new Date().toISOString(),
      results: trainingResults
    }));
    alert('Modelo guardado exitosamente!');
  };

  const hasDataToTrain = Object.keys(moduleData).length > 0 && 
    Object.values(moduleData).some(module => 
      module.elements.some(el => el.captured > 0)
    );

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Cpu size={24} />
          Entrenamiento del Modelo IA
        </h2>
        <div className="flex items-center gap-4">
          <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-semibold">
            Modelo: v2.1.4
          </div>
          {hasDataToTrain && (
            <button 
              onClick={saveModel}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 transition-colors"
            >
              <Save size={16} />
              Guardar Modelo
            </button>
          )}
        </div>
      </div>

      {!hasDataToTrain ? (
        <div className="text-center py-12">
          <BarChart3 size={64} className="mx-auto text-white/40 mb-4" />
          <h3 className="text-white text-lg mb-2">No hay datos para entrenar</h3>
          <p className="text-white/60">Captura datos en la sección de Captura de Datos primero</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Panel de control de entrenamiento */}
            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h3 className="text-white font-semibold mb-3">Control de Entrenamiento</h3>
                
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <button 
                      onClick={trainingStatus === 'training' ? stopTraining : startTraining}
                      disabled={!hasDataToTrain}
                      className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
                        !hasDataToTrain ? 'bg-gray-500 cursor-not-allowed' :
                        trainingStatus === 'training' 
                          ? 'bg-red-500 hover:bg-red-600' 
                          : 'bg-green-500 hover:bg-green-600'
                      } text-white flex items-center justify-center gap-2`}
                    >
                      {trainingStatus === 'training' ? (
                        <>
                          <Square size={16} />
                          Detener Entrenamiento
                        </>
                      ) : (
                        <>
                          <Play size={16} />
                          Iniciar Entrenamiento
                        </>
                      )}
                    </button>
                  </div>

                  {trainingStatus === 'training' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-white text-sm">
                        <span>Progreso del entrenamiento:</span>
                        <span>{Math.round(trainingProgress)}%</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${trainingProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <Clock size={20} className="mx-auto text-blue-400 mb-1" />
                  <div className="text-white font-semibold">24.5h</div>
                  <div className="text-white/60 text-xs">Tiempo total</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <Award size={20} className="mx-auto text-green-400 mb-1" />
                  <div className="text-white font-semibold">
                    {Object.values(moduleData).reduce((total, module) => 
                      total + module.elements.reduce((sum, el) => sum + el.captured, 0), 0
                    )}
                  </div>
                  <div className="text-white/60 text-xs">Muestras totales</div>
                </div>
              </div>
            </div>

            {/* Métricas generales */}
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <TrendingUp size={20} />
                Métricas Generales del Modelo
              </h3>
              
              <div className="space-y-3">
                {[
                  { 
                    label: 'Precisión General', 
                    value: Object.values(trainingResults).reduce((acc, curr) => acc + curr.accuracy, 0) / Object.keys(trainingResults).length || 0,
                    color: 'green' 
                  },
                  { 
                    label: 'Muestras Totales', 
                    value: Object.values(trainingResults).reduce((acc, curr) => acc + curr.samples, 0),
                    color: 'blue',
                    isCount: true
                  },
                  { 
                    label: 'Progreso Promedio', 
                    value: Object.values(trainingResults).reduce((acc, curr) => acc + curr.progress, 0) / Object.keys(trainingResults).length || 0,
                    color: 'purple' 
                  }
                ].map((metric, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-white text-sm mb-1">
                      <span>{metric.label}</span>
                      <span>{metric.isCount ? metric.value : metric.value.toFixed(1)}{metric.isCount ? '' : '%'}</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          metric.color === 'green' ? 'bg-green-400' :
                          metric.color === 'blue' ? 'bg-blue-400' :
                          'bg-purple-400'
                        }`}
                        style={{ width: `${metric.isCount ? Math.min(100, (metric.value / 1000) * 100) : metric.value}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Gráficos por módulo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.keys(trainingResults).map(moduleKey => (
              <div key={moduleKey} className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <BarChart3 size={18} />
                  {moduleNames[moduleKey]}
                </h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-white text-xs">
                    <span>Precisión: {trainingResults[moduleKey].accuracy.toFixed(1)}%</span>
                    <span>Muestras: {trainingResults[moduleKey].samples}</span>
                  </div>
                  
                  {trainingResults[moduleKey].elements.map((element, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-white/80 w-20 truncate">{element.name}</span>
                      <div className="flex-1 mx-2">
                        <div className="w-full bg-white/20 rounded-full h-1">
                          <div 
                            className="bg-gradient-to-r from-green-400 to-blue-400 h-1 rounded-full"
                            style={{ width: `${element.accuracy}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-white/60 text-xs w-12 text-right">
                        {element.accuracy.toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default TrainingSection;