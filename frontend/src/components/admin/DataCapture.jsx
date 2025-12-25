import React, { useState, useEffect } from 'react';
import { Camera, Download, Upload, Database, Target, Zap, RotateCcw, Save, X } from 'lucide-react';

const DataCapture = () => {
  const [captureStatus, setCaptureStatus] = useState('idle');
  const [selectedModule, setSelectedModule] = useState('vocals');
  const [currentElement, setCurrentElement] = useState(0);
  const [capturedCount, setCapturedCount] = useState(0);
  const [moduleData, setModuleData] = useState({});

  // Definición completa de módulos y sus elementos
  const modules = {
    vocals: {
      name: 'Vocales',
      elements: ['A', 'E', 'I', 'O', 'U'],
      targetSamples: 100,
      currentSamples: [45, 32, 28, 51, 39]
    },
    numbers: {
      name: 'Números',
      elements: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
      targetSamples: 150,
      currentSamples: [67, 72, 58, 45, 63, 71, 49, 52, 68, 55]
    },
    alphabet: {
      name: 'Abecedario',
      elements: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 
                'N', 'Ñ', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
      targetSamples: 80,
      currentSamples: Array(27).fill(0).map(() => Math.floor(Math.random() * 60))
    },
    math: {
      name: 'Signos Matemáticos',
      elements: ['+', '-', '×', '÷', '=', '>', '<'],
      targetSamples: 120,
      currentSamples: [45, 38, 52, 41, 67, 29, 33]
    },
    words: {
      name: 'Palabras',
      elements: ['HOLA', 'GRACIAS', 'POR FAVOR', 'AMIGO', 'FAMILIA'],
      targetSamples: 90,
      currentSamples: [28, 35, 42, 31, 39]
    }
  };

  // Inicializar datos de módulos
  useEffect(() => {
    const savedData = localStorage.getItem('moduleCaptureData');
    if (savedData) {
      setModuleData(JSON.parse(savedData));
    } else {
      // Datos iniciales
      const initialData = {};
      Object.keys(modules).forEach(moduleKey => {
        initialData[moduleKey] = {
          elements: modules[moduleKey].elements.map((element, index) => ({
            name: element,
            captured: modules[moduleKey].currentSamples[index] || 0,
            target: modules[moduleKey].targetSamples
          }))
        };
      });
      setModuleData(initialData);
    }
  }, []);

  const currentModule = modules[selectedModule];
  const currentElementData = moduleData[selectedModule]?.elements[currentElement] || { captured: 0, target: 100 };

  const startCapture = () => {
    setCaptureStatus('capturing');
    // Simulación de captura
    setTimeout(() => {
      setCaptureStatus('reviewing');
    }, 2000);
  };

  const saveCapture = () => {
    const newModuleData = { ...moduleData };
    if (!newModuleData[selectedModule]) {
      newModuleData[selectedModule] = { elements: [] };
    }
    
    if (newModuleData[selectedModule].elements[currentElement]) {
      newModuleData[selectedModule].elements[currentElement].captured += 1;
    }
    
    setModuleData(newModuleData);
    localStorage.setItem('moduleCaptureData', JSON.stringify(newModuleData));
    setCaptureStatus('saved');
    setCapturedCount(prev => prev + 1);
    
    setTimeout(() => {
      nextElement();
    }, 1000);
  };

  const discardCapture = () => {
    setCaptureStatus('idle');
  };

  const nextElement = () => {
    if (currentElement < currentModule.elements.length - 1) {
      setCurrentElement(prev => prev + 1);
    } else {
      setCurrentElement(0);
    }
    setCaptureStatus('idle');
  };

  const resetModuleData = () => {
    const newModuleData = { ...moduleData };
    newModuleData[selectedModule] = {
      elements: currentModule.elements.map(element => ({
        name: element,
        captured: 0,
        target: currentModule.targetSamples
      }))
    };
    setModuleData(newModuleData);
    localStorage.setItem('moduleCaptureData', JSON.stringify(newModuleData));
    setCurrentElement(0);
    setCapturedCount(0);
  };

  const getProgressPercentage = (captured, target) => {
    return Math.min(100, (captured / target) * 100);
  };

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Camera size={24} />
          Captura de Datos para IA
        </h2>
        <div className="flex gap-2">
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 transition-colors">
            <Upload size={20} />
            Importar Dataset
          </button>
          <button 
            onClick={resetModuleData}
            className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-600 transition-colors"
          >
            <RotateCcw size={20} />
            Reiniciar Módulo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel de control y cámara */}
        <div className="space-y-4">
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h3 className="text-white font-semibold mb-3">Configuración de Captura</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-white/80 text-sm mb-2 block">Módulo de Captura</label>
                <select 
                  value={selectedModule}
                  onChange={(e) => {
                    setSelectedModule(e.target.value);
                    setCurrentElement(0);
                    setCaptureStatus('idle');
                  }}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                >
                  {Object.keys(modules).map(moduleKey => (
                    <option key={moduleKey} value={moduleKey}>
                      {modules[moduleKey].name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <button className="bg-white/10 text-white px-3 py-2 rounded-lg hover:bg-white/20 transition-colors">
                  <Target size={16} className="inline mr-2" />
                  Calibrar Cámara
                </button>
                <button className="bg-white/10 text-white px-3 py-2 rounded-lg hover:bg-white/20 transition-colors">
                  <Zap size={16} className="inline mr-2" />
                  Ajustar IA
                </button>
              </div>
            </div>
          </div>

          {/* Cámara */}
          <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl">
            <div className="aspect-video bg-gray-900 flex items-center justify-center">
              {captureStatus === 'idle' ? (
                <div className="text-center text-white">
                  <Camera size={64} className="mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Elemento: {currentModule.elements[currentElement]}</p>
                  <p className="text-sm text-white/60">Preparado para capturar</p>
                </div>
              ) : captureStatus === 'capturing' ? (
                <div className="text-center text-white">
                  <div className="w-16 h-16 border-4 border-green-400 rounded-full animate-spin mx-auto mb-4 border-t-transparent"></div>
                  <p className="text-lg">Capturando...</p>
                  <p className="text-sm text-white/60">Mantén la pose</p>
                </div>
              ) : captureStatus === 'reviewing' ? (
                <div className="text-center text-white">
                  <div className="text-6xl font-bold mb-4">{currentModule.elements[currentElement]}</div>
                  <p className="text-lg">Revisando captura</p>
                  <p className="text-sm text-white/60">¿Guardar esta muestra?</p>
                </div>
              ) : (
                <div className="text-center text-white">
                  <div className="text-6xl font-bold mb-4">✓</div>
                  <p className="text-lg">¡Captura guardada!</p>
                  <p className="text-sm text-white/60">Avanzando al siguiente elemento</p>
                </div>
              )}
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 border-4 border-green-400 rounded-full opacity-50 animate-pulse"></div>
              </div>
            </div>
            
            {captureStatus === 'reviewing' && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                <button 
                  onClick={saveCapture}
                  className="bg-green-500 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600 transition-colors"
                >
                  <Save size={20} />
                  Guardar
                </button>
                <button 
                  onClick={discardCapture}
                  className="bg-red-500 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-red-600 transition-colors"
                >
                  <X size={20} />
                  Descartar
                </button>
              </div>
            )}
          </div>

          <button 
            onClick={startCapture}
            disabled={captureStatus !== 'idle'}
            className={`w-full py-3 rounded-lg font-semibold transition-all ${
              captureStatus !== 'idle' 
                ? 'bg-gray-500 cursor-not-allowed' 
                : 'bg-green-500 hover:bg-green-600'
            } text-white flex items-center justify-center gap-2`}
          >
            <Camera size={20} />
            {captureStatus === 'idle' ? 'Capturar Muestra' : 'Capturando...'}
          </button>
        </div>

        {/* Lista de elementos y progreso */}
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Database size={20} />
            Progreso de Captura - {currentModule.name}
          </h3>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {moduleData[selectedModule]?.elements.map((element, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  index === currentElement 
                    ? 'bg-blue-500/20 border-blue-400' 
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
                onClick={() => setCurrentElement(index)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-semibold">{element.name}</span>
                  <span className="text-white/60 text-sm">
                    {element.captured}/{element.target}
                  </span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getProgressPercentage(element.captured, element.target)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-white/60 text-xs mt-1">
                  <span>{Math.round(getProgressPercentage(element.captured, element.target))}% completo</span>
                  <span>{element.target - element.captured} restantes</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-white">{capturedCount}</div>
                <div className="text-white/60 text-sm">Capturas hoy</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">
                  {moduleData[selectedModule]?.elements.reduce((total, el) => total + el.captured, 0) || 0}
                </div>
                <div className="text-white/60 text-sm">Total capturado</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataCapture;