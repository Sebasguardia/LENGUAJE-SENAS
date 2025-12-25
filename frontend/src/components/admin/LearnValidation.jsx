import React, { useState, useEffect } from 'react';
import { Play, Check, X, RotateCcw, Award, BarChart3, Target, Clock, Cpu, Zap } from 'lucide-react';

const LearnValidation = () => {
  const [validationStatus, setValidationStatus] = useState('idle');
  const [selectedModel, setSelectedModel] = useState('current');
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedElement, setSelectedElement] = useState('');
  const [currentTest, setCurrentTest] = useState(null);
  const [results, setResults] = useState([]);
  const [moduleData, setModuleData] = useState({});
  const [sessionStats, setSessionStats] = useState({ total: 0, correct: 0, accuracy: 0 });

  // Modelos disponibles
  const availableModels = [
    { id: 'current', name: 'Modelo Actual', version: 'v2.1.4', accuracy: 94.3 },
    { id: 'previous', name: 'Modelo Anterior', version: 'v2.1.3', accuracy: 92.1 },
    { id: 'baseline', name: 'Línea Base', version: 'v2.0.0', accuracy: 88.7 },
    { id: 'experimental', name: 'Experimental', version: 'v2.2.0-beta', accuracy: 95.6 }
  ];

  useEffect(() => {
    const savedData = localStorage.getItem('moduleCaptureData');
    const savedResults = localStorage.getItem('validationResults');
    
    if (savedData) {
      const data = JSON.parse(savedData);
      setModuleData(data);
      
      // Establecer primer módulo disponible por defecto
      const firstModule = Object.keys(data).find(key => 
        data[key].elements.some(el => el.captured > 5)
      );
      if (firstModule) {
        setSelectedModule(firstModule);
        const firstElement = data[firstModule].elements.find(el => el.captured > 5);
        if (firstElement) setSelectedElement(firstElement.name);
      }
    }
    
    if (savedResults) {
      const parsedResults = JSON.parse(savedResults);
      setResults(parsedResults);
      updateSessionStats(parsedResults);
    }
  }, []);

  const updateSessionStats = (resultsArray) => {
    const total = resultsArray.length;
    const correct = resultsArray.filter(r => r.correct).length;
    const accuracy = total > 0 ? (correct / total) * 100 : 0;
    setSessionStats({ total, correct, accuracy });
  };

  const getModuleName = (moduleKey) => {
    const moduleNames = {
      vocals: 'Vocales',
      numbers: 'Números',
      alphabet: 'Abecedario',
      math: 'Signos Matemáticos',
      words: 'Palabras'
    };
    return moduleNames[moduleKey] || moduleKey;
  };

  const startValidation = () => {
    if (!selectedModule || !selectedElement) {
      alert('Selecciona un módulo y un elemento para validar');
      return;
    }

    setValidationStatus('validating');
    
    const elementData = moduleData[selectedModule]?.elements.find(el => el.name === selectedElement);
    if (!elementData || elementData.captured < 5) {
      setValidationStatus('insufficient-data');
      return;
    }

    // Simular diferentes comportamientos según el modelo seleccionado
    const modelAccuracy = availableModels.find(m => m.id === selectedModel)?.accuracy || 94.3;
    const baseCorrectProbability = modelAccuracy / 100;
    
    setCurrentTest({
      model: selectedModel,
      module: selectedModule,
      element: selectedElement,
      correct: Math.random() < baseCorrectProbability,
      confidence: Math.floor(Math.random() * 20) + 75, // 75-95% de confianza
      timestamp: new Date().toISOString()
    });

    setTimeout(() => {
      setValidationStatus('result');
    }, 1500);
  };

  const handleResult = (userAnswer) => {
    const isCorrect = currentTest.correct === userAnswer;
    const newResult = {
      ...currentTest,
      userInput: userAnswer,
      correct: isCorrect,
      modelName: availableModels.find(m => m.id === currentTest.model)?.name,
      moduleName: getModuleName(currentTest.module)
    };
    
    const newResults = [...results, newResult];
    setResults(newResults);
    updateSessionStats(newResults);
    
    localStorage.setItem('validationResults', JSON.stringify(newResults));
    setValidationStatus('completed');
    
    setTimeout(() => {
      setValidationStatus('idle');
      setCurrentTest(null);
    }, 2000);
  };

  const resetValidation = () => {
    setResults([]);
    setSessionStats({ total: 0, correct: 0, accuracy: 0 });
    localStorage.removeItem('validationResults');
    setValidationStatus('idle');
  };

  const getAccuracyByModel = () => {
    const modelAccuracy = {};
    results.forEach(result => {
      if (!modelAccuracy[result.model]) {
        modelAccuracy[result.model] = { total: 0, correct: 0 };
      }
      modelAccuracy[result.model].total++;
      if (result.correct) modelAccuracy[result.model].correct++;
    });
    
    return Object.keys(modelAccuracy).map(model => ({
      model,
      accuracy: (modelAccuracy[model].correct / modelAccuracy[model].total) * 100,
      total: modelAccuracy[model].total,
      modelName: availableModels.find(m => m.id === model)?.name
    }));
  };

  const getAccuracyByModule = () => {
    const moduleAccuracy = {};
    results.forEach(result => {
      if (!moduleAccuracy[result.module]) {
        moduleAccuracy[result.module] = { total: 0, correct: 0 };
      }
      moduleAccuracy[result.module].total++;
      if (result.correct) moduleAccuracy[result.module].correct++;
    });
    
    return Object.keys(moduleAccuracy).map(module => ({
      module,
      accuracy: (moduleAccuracy[module].correct / moduleAccuracy[module].total) * 100,
      total: moduleAccuracy[module].total,
      moduleName: getModuleName(module)
    }));
  };

  const hasEnoughData = Object.keys(moduleData).some(key => 
    moduleData[key].elements.some(el => el.captured > 5)
  );

  const currentModel = availableModels.find(m => m.id === selectedModel);

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Award size={24} />
          Validación de Modelos IA
        </h2>
        <div className="flex items-center gap-4">
          <div className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-semibold">
            {sessionStats.accuracy.toFixed(1)}% Precisión
          </div>
          <button 
            onClick={resetValidation}
            className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm font-semibold hover:bg-red-500/30 transition-colors flex items-center gap-1"
          >
            <RotateCcw size={16} />
            Reiniciar
          </button>
        </div>
      </div>

      {!hasEnoughData ? (
        <div className="text-center py-12">
          <Target size={64} className="mx-auto text-white/40 mb-4" />
          <h3 className="text-white text-lg mb-2">Datos insuficientes</h3>
          <p className="text-white/60 mb-4">Necesitas capturar al menos 5 muestras por elemento</p>
        </div>
      ) : (
        <>
          {/* Selectores de modelo, módulo y elemento */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="text-white/80 text-sm mb-2 block">Modelo a Validar</label>
              <select 
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
              >
                {availableModels.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.name} ({model.version}) - {model.accuracy}%
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-white/80 text-sm mb-2 block">Módulo</label>
              <select 
                value={selectedModule}
                onChange={(e) => {
                  setSelectedModule(e.target.value);
                  setSelectedElement('');
                }}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
              >
                <option value="">Seleccionar módulo</option>
                {Object.keys(moduleData).map(moduleKey => (
                  moduleData[moduleKey].elements.some(el => el.captured > 5) && (
                    <option key={moduleKey} value={moduleKey}>
                      {getModuleName(moduleKey)}
                    </option>
                  )
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-white/80 text-sm mb-2 block">Elemento</label>
              <select 
                value={selectedElement}
                onChange={(e) => setSelectedElement(e.target.value)}
                disabled={!selectedModule}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white disabled:opacity-50"
              >
                <option value="">Seleccionar elemento</option>
                {selectedModule && moduleData[selectedModule]?.elements
                  .filter(el => el.captured > 5)
                  .map((element, index) => (
                    <option key={index} value={element.name}>
                      {element.name} ({element.captured} muestras)
                    </option>
                  ))
                }
              </select>
            </div>
          </div>

          {/* Panel principal de validación */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="text-white font-semibold mb-4 text-center">
                Validación - {currentModel?.name}
              </h3>
              
              <div className="text-center py-4">
                {validationStatus === 'idle' && (
                  <>
                    <div className="text-6xl mb-4">🎯</div>
                    <p className="text-white/60 mb-4">
                      {selectedModule && selectedElement ? 
                        `Validar: ${selectedElement} (${getModuleName(selectedModule)})` :
                        'Selecciona un módulo y elemento'
                      }
                    </p>
                    <button 
                      onClick={startValidation}
                      disabled={!selectedModule || !selectedElement}
                      className="bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 transition-colors font-semibold disabled:bg-gray-500 disabled:cursor-not-allowed"
                    >
                      <Play size={20} className="inline mr-2" />
                      Iniciar Validación
                    </button>
                  </>
                )}

                {validationStatus === 'validating' && (
                  <>
                    <div className="w-20 h-20 border-4 border-blue-400 rounded-full animate-spin mx-auto mb-4 border-t-transparent"></div>
                    <p className="text-white text-lg">Procesando seña...</p>
                    <p className="text-white/60">Modelo: {currentModel?.name}</p>
                  </>
                )}

                {validationStatus === 'result' && currentTest && (
                  <>
                    <div className="text-6xl font-bold mb-4">{currentTest.element}</div>
                    <p className="text-white/60 mb-2">
                      El modelo <span className="text-yellow-400">{currentModel?.name}</span> predice:
                    </p>
                    <p className={`text-lg font-semibold mb-2 ${
                      currentTest.correct ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {currentTest.correct ? '✓ CORRECTO' : '✗ INCORRECTO'}
                    </p>
                    <p className="text-blue-400 text-sm mb-4">
                      Confianza: {currentTest.confidence}%
                    </p>
                    <p className="text-white/60 mb-6">¿La clasificación es correcta?</p>
                    <div className="flex justify-center gap-4">
                      <button 
                        onClick={() => handleResult(true)}
                        className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                      >
                        <Check size={20} />
                        Sí, Correcto
                      </button>
                      <button 
                        onClick={() => handleResult(false)}
                        className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                      >
                        <X size={20} />
                        No, Incorrecto
                      </button>
                    </div>
                  </>
                )}

                {validationStatus === 'completed' && (
                  <>
                    <div className="text-6xl mb-4">✅</div>
                    <p className="text-white text-lg">¡Resultado registrado!</p>
                    <p className="text-white/60">Precisión actual: {sessionStats.accuracy.toFixed(1)}%</p>
                  </>
                )}

                {validationStatus === 'insufficient-data' && (
                  <>
                    <div className="text-6xl mb-4">⚠️</div>
                    <p className="text-white text-lg">Datos insuficientes</p>
                    <p className="text-white/60">Captura más muestras para este elemento</p>
                  </>
                )}
              </div>
            </div>

            {/* Estadísticas de la sesión */}
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <BarChart3 size={20} />
                Estadísticas de Validación
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-blue-500/20 rounded-lg p-3">
                    <div className="text-2xl font-bold text-white">{sessionStats.total}</div>
                    <div className="text-blue-300 text-sm">Pruebas</div>
                  </div>
                  <div className="bg-green-500/20 rounded-lg p-3">
                    <div className="text-2xl font-bold text-white">{sessionStats.correct}</div>
                    <div className="text-green-300 text-sm">Correctas</div>
                  </div>
                  <div className="bg-purple-500/20 rounded-lg p-3">
                    <div className="text-2xl font-bold text-white">{sessionStats.accuracy.toFixed(1)}%</div>
                    <div className="text-purple-300 text-sm">Precisión</div>
                  </div>
                </div>

                <div>
                  <h4 className="text-white font-medium mb-2">Progreso de la sesión:</h4>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full transition-all"
                      style={{ width: `${sessionStats.accuracy}%` }}
                    ></div>
                  </div>
                </div>

                {sessionStats.total > 0 && (
                  <div>
                    <h4 className="text-white font-medium mb-2">Modelo Actual:</h4>
                    <div className="text-yellow-400 text-sm font-semibold">
                      {currentModel?.name} ({currentModel?.version})
                    </div>
                    <div className="text-white/60 text-xs">
                      Precisión esperada: {currentModel?.accuracy}%
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Resultados detallados */}
          {results.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Precisión por Modelo */}
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Cpu size={20} />
                  Comparación de Modelos
                </h3>
                
                <div className="space-y-3">
                  {getAccuracyByModel().map((modelAcc, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-white/80 text-sm">{modelAcc.modelName}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-white/20 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full"
                            style={{ width: `${modelAcc.accuracy}%` }}
                          ></div>
                        </div>
                        <span className="text-white/60 text-xs w-12 text-right">
                          {modelAcc.accuracy.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Precisión por Módulo */}
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Zap size={20} />
                  Precisión por Módulo
                </h3>
                
                <div className="space-y-3">
                  {getAccuracyByModule().map((moduleAcc, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-white/80 text-sm">{moduleAcc.moduleName}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-white/20 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full"
                            style={{ width: `${moduleAcc.accuracy}%` }}
                          ></div>
                        </div>
                        <span className="text-white/60 text-xs w-12 text-right">
                          {moduleAcc.accuracy.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LearnValidation;