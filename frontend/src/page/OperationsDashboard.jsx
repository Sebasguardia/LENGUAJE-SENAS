import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Play, Pause, RotateCcw, Volume2, VolumeX, Camera, 
  Target, Clock, Award, CheckCircle, Star, Image,
  BookOpen, Mic, HelpCircle, TrendingUp, Calculator,
  Plus, Minus, X, Divide
} from 'lucide-react';

const OperationsDashboard = () => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentOperation, setCurrentOperation] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isDetecting, setIsDetecting] = useState(false);
  const [sessionScore, setSessionScore] = useState(0);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [completedOperations, setCompletedOperations] = useState([]);
  const [operationStatus, setOperationStatus] = useState({});
  const [isCompleting, setIsCompleting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showImage, setShowImage] = useState(true);
  const [mode, setMode] = useState('practice');
  const [detectedElement, setDetectedElement] = useState('');
  const [detectionConfidence, setDetectionConfidence] = useState(0);

  // Operaciones predefinidas para modo práctica
  const practiceOperations = [
    { 
      id: 1, 
      symbol: '5 + 3 = 8', 
      name: 'SUMA BÁSICA',
      image: '/images/suma-operacion.jpg',
      description: 'Realizar la seña de 5, luego la seña de +, luego la seña de 3, y finalmente la seña de = mostrando 8 dedos',
      difficulty: 'Fácil',
      tips: ['Secuencia: 5 → + → 3 → = → 8', 'Mantener ritmo constante', 'Transiciones suaves entre señas'],
      example: 'Cinco más tres igual a ocho'
    },
    { 
      id: 2, 
      symbol: '9 - 4 = 5', 
      name: 'RESTA BÁSICA',
      image: '/images/resta-operacion.jpg',
      description: 'Realizar la seña de 9, luego la seña de -, luego la seña de 4, y finalmente la seña de = mostrando 5 dedos',
      difficulty: 'Fácil',
      tips: ['Secuencia: 9 → - → 4 → = → 5', 'Énfasis en el movimiento de resta', 'Mostrar resultado claramente'],
      example: 'Nueve menos cuatro igual a cinco'
    },
    { 
      id: 3, 
      symbol: '4 × 3 = 12', 
      name: 'MULTIPLICACIÓN',
      image: '/images/multiplicacion-operacion.jpg',
      description: 'Realizar la seña de 4, luego la seña de ×, luego la seña de 3, y finalmente la seña de = mostrando 10+2 dedos',
      difficulty: 'Medio',
      tips: ['Para 12: mostrar 10 (dos manos) y luego 2', 'Movimiento de multiplicación claro', 'Coordinación bilateral'],
      example: 'Cuatro por tres igual a doce'
    },
    { 
      id: 4, 
      symbol: '12 ÷ 4 = 3', 
      name: 'DIVISIÓN',
      image: '/images/division-operacion.jpg',
      description: 'Realizar la seña de 12, luego la seña de ÷, luego la seña de 4, y finalmente la seña de = mostrando 3 dedos',
      difficulty: 'Medio',
      tips: ['Para 12: mostrar 10 (dos manos) y luego 2', 'Movimiento de división específico', 'Resultado preciso'],
      example: 'Doce dividido cuatro igual a tres'
    }
  ];

  // Operaciones libres (inicialmente vacías)
  const [freeOperations, setFreeOperations] = useState([]);
  const [currentFreeOperation, setCurrentFreeOperation] = useState({
    num1: '', operator: '+', num2: '', result: ''
  });

  // Elementos detectables (números y operadores)
  const detectableElements = [
    // Números 0-9
    ...Array.from({length: 10}, (_, i) => ({ 
      type: 'number', 
      value: i.toString(), 
      name: i === 0 ? 'CERO' : ['UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'][i-1]
    })),
    // Operadores
    { type: 'operator', value: '+', name: 'SUMA' },
    { type: 'operator', value: '-', name: 'RESTA' },
    { type: 'operator', value: '*', name: 'MULTIPLICACIÓN' },
    { type: 'operator', value: '/', name: 'DIVISIÓN' },
    { type: 'operator', value: '=', name: 'IGUAL' }
  ];

  // Inicializar estado
  useEffect(() => {
    const initialStatus = {};
    practiceOperations.forEach(op => {
      initialStatus[op.id] = 'pending';
    });
    setOperationStatus(initialStatus);
    setOperationStatus(prev => ({ ...prev, [practiceOperations[0]?.id]: 'current' }));
  }, []);

  // Función para hablar (Text-to-Speech)
  const speak = (text) => {
    if ('speechSynthesis' in window && !isMuted) {
      window.speechSynthesis.cancel();
      const speech = new SpeechSynthesisUtterance(text);
      speech.lang = 'es-ES';
      speech.rate = 0.8;
      speech.volume = 0.9;
      window.speechSynthesis.speak(speech);
    }
  };

  // Mensaje de bienvenida
  useEffect(() => {
    const welcomeMessage = "Bienvenido al módulo de operaciones matemáticas. En modo práctica aprenderás operaciones predefinidas, y en modo libre podrás crear tus propias operaciones usando señas.";
    
    const timer = setTimeout(() => {
      speak(welcomeMessage);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isMuted]);

  // Temporizador de práctica
  useEffect(() => {
    let interval;
    if (isPlaying && isDetecting && !isCompleting) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isDetecting, isCompleting]);

  // Simulación de detección de elementos por señas
  const simulateElementDetection = () => {
    if (!isDetecting || isCompleting) return;

    // Simular detección de elementos
    const randomElement = detectableElements[Math.floor(Math.random() * detectableElements.length)];
    const confidence = Math.floor(Math.random() * 30) + 70; // 70-100% de confianza

    setDetectedElement(`${randomElement.value} (${randomElement.name})`);
    setDetectionConfidence(confidence);

    // En modo práctica, comparar con la operación actual
    if (mode === 'practice') {
      const currentOp = practiceOperations[currentOperation];
      const expectedSequence = currentOp.symbol.split(' ').filter(char => char !== '');
      
      // Simular progreso de precisión
      const newAccuracy = Math.min(100, accuracy + Math.random() * 15);
      setAccuracy(newAccuracy);

      if (newAccuracy >= 85 && !isCompleting) {
        completeOperation();
      }
    } else {
      // En modo libre, construir la operación paso a paso
      const newAccuracy = Math.min(100, accuracy + Math.random() * 10);
      setAccuracy(newAccuracy);
    }
  };

  const completeOperation = () => {
    setIsCompleting(true);
    setIsDetecting(false);
    setIsPlaying(false);

    setTimeout(() => {
      const currentOp = practiceOperations[currentOperation];
      const basePoints = currentOp.difficulty === 'Fácil' ? 25 : 30;
      const streakBonus = correctStreak * 5;
      const totalPoints = basePoints + streakBonus;
      
      setSessionScore(prev => prev + totalPoints);
      setCorrectStreak(prev => prev + 1);
      setCompletedOperations(prev => [...prev, currentOp.id]);
      setOperationStatus(prev => ({
        ...prev,
        [currentOp.id]: 'completed'
      }));

      speak(`¡Excelente! Operación ${currentOp.name} completada. +${totalPoints} puntos.`);
      
      setTimeout(() => {
        if (currentOperation < practiceOperations.length - 1) {
          setCurrentOperation(prev => prev + 1);
          setAccuracy(0);
          setTimeElapsed(0);
        }
        setIsCompleting(false);
      }, 3000);
    }, 2000);
  };

  // Efecto para la detección
  useEffect(() => {
    let detectionInterval;
    if (isDetecting && !isCompleting) {
      detectionInterval = setInterval(simulateElementDetection, 2000);
    }
    return () => {
      if (detectionInterval) clearInterval(detectionInterval);
    };
  }, [isDetecting, accuracy, currentOperation, mode, isCompleting]);

  const startDetection = () => {
    if (isCompleting) return;
    
    setIsDetecting(true);
    setIsPlaying(true);
    setAccuracy(0);
    setTimeElapsed(0);
    setDetectedElement('');
    setDetectionConfidence(0);
    
    if (mode === 'practice') {
      const currentOp = practiceOperations[currentOperation];
      speak(`Practicando operación: ${currentOp.example}. Realiza las señas en secuencia.`);
    } else {
      speak(`Modo libre activado. Comienza realizando la seña del primer número.`);
    }
  };

  const stopDetection = () => {
    setIsDetecting(false);
    setIsPlaying(false);
    speak("Práctica pausada.");
  };

  const resetPractice = () => {
    setIsDetecting(false);
    setIsPlaying(false);
    setAccuracy(0);
    setTimeElapsed(0);
    setDetectedElement('');
    setDetectionConfidence(0);
    speak("Práctica reiniciada.");
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      window.speechSynthesis.cancel();
    }
  };

  const toggleImage = () => {
    setShowImage(!showImage);
  };

  const changeMode = (newMode) => {
    setMode(newMode);
    setIsDetecting(false);
    setIsPlaying(false);
    setAccuracy(0);
    setTimeElapsed(0);
    setDetectedElement('');
    setDetectionConfidence(0);
    
    if (newMode === 'practice') {
      speak("Modo práctica activado. Practica con operaciones predefinidas.");
    } else {
      speak("Modo libre activado. Crea tus propias operaciones con señas.");
    }
  };

  const selectOperation = (index) => {
    if (isCompleting) return;
    
    setOperationStatus(prev => {
      const newStatus = { ...prev };
      Object.keys(newStatus).forEach(key => {
        newStatus[key] = 'pending';
      });
      newStatus[practiceOperations[index].id] = 'current';
      return newStatus;
    });

    setCurrentOperation(index);
    setAccuracy(0);
    setTimeElapsed(0);
    setIsDetecting(false);
    setIsPlaying(false);
    
    const selectedOp = practiceOperations[index];
    speak(`Operación ${selectedOp.name} seleccionada: ${selectedOp.example}`);
  };

  const handleCompleteSession = () => {
    const totalCompleted = mode === 'practice' ? completedOperations.length : freeOperations.length;
    speak(`Sesión finalizada. Completaste ${totalCompleted} operaciones. Puntos: ${sessionScore}. ¡Excelente trabajo matemático!`);
    navigate('/dashboard');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Fácil': return 'text-green-400 border-green-400';
      case 'Medio': return 'text-yellow-400 border-yellow-400';
      case 'Difícil': return 'text-red-400 border-red-400';
      default: return 'text-white border-white';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500 text-white';
      case 'current': return 'bg-blue-500 text-white animate-pulse';
      default: return 'bg-white/10 text-white/60';
    }
  };

  const currentOperationData = mode === 'practice' 
    ? practiceOperations[currentOperation] 
    : { 
        symbol: 'CREA TU OPERACIÓN', 
        name: 'MODO LIBRE', 
        example: 'Usa señas para números y operadores',
        difficulty: 'Variable'
      };

  const isOperationCompleted = mode === 'practice' 
    ? completedOperations.includes(currentOperationData?.id)
    : false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex flex-col">
      <header className="bg-white/10 backdrop-blur-xl border-b border-white/20 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="bg-white/10 text-white p-2 rounded-lg hover:bg-white/20 transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Módulo de Operaciones Matemáticas</h1>
              <p className="text-white/60">
                {isCompleting ? 'Completando operación...' : 'Aprende operaciones con señas'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-lg flex items-center gap-2">
                <Star size={20} />
                <span className="font-semibold">{sessionScore} pts</span>
              </div>
              <div className="bg-green-500/20 text-green-400 px-4 py-2 rounded-lg flex items-center gap-2">
                <TrendingUp size={20} />
                <span>Racha: {correctStreak}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={toggleMute}
                className={`p-2 rounded-lg transition-all ${
                  isMuted ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              
              <button 
                onClick={toggleImage}
                className={`p-2 rounded-lg transition-all ${
                  showImage ? 'bg-blue-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <Image size={20} />
              </button>
            </div>

            <button 
              onClick={() => speak(
                mode === 'practice' 
                  ? `Operación: ${currentOperationData.example}. Precisión: ${accuracy}%.` 
                  : `Modo libre activado. Detectado: ${detectedElement || 'Ninguno'}.`
              )}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 transition-colors"
              disabled={isCompleting || isMuted}
            >
              <Calculator size={20} />
              Estado
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8">
          {/* Panel izquierdo */}
          <div className="space-y-6">
            {/* Selector de modo */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
              <h3 className="text-white font-semibold mb-3">Modo de Práctica</h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => changeMode('practice')}
                  className={`p-3 rounded-lg text-center transition-all ${
                    mode === 'practice' ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'
                  }`}
                >
                  <BookOpen size={20} className="mx-auto mb-1" />
                  <div className="font-semibold">Práctica</div>
                  <div className="text-xs">Operaciones predefinidas</div>
                </button>
                <button
                  onClick={() => changeMode('free')}
                  className={`p-3 rounded-lg text-center transition-all ${
                    mode === 'free' ? 'bg-green-500 text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'
                  }`}
                >
                  <Calculator size={20} className="mx-auto mb-1" />
                  <div className="font-semibold">Libre</div>
                  <div className="text-xs">Crea operaciones</div>
                </button>
              </div>
            </div>

            {/* Selector de operaciones (solo en modo práctica) */}
            {mode === 'practice' && (
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
                <h3 className="text-white font-semibold mb-3">Operaciones</h3>
                <div className="grid grid-cols-2 gap-2">
                  {practiceOperations.map((operation, index) => (
                    <button
                      key={operation.id}
                      onClick={() => selectOperation(index)}
                      disabled={isCompleting}
                      className={`p-3 rounded-lg text-center transition-all ${
                        getStatusColor(operationStatus[operation.id])
                      } ${currentOperation === index ? 'ring-2 ring-blue-400' : ''} ${
                        isCompleting ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <div className="text-lg font-bold">{operation.symbol}</div>
                      <div className="text-xs opacity-80">{operation.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Cámara */}
            <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl">
              <div className="aspect-video bg-gray-900 flex items-center justify-center">
                <div className="text-center text-white">
                  <Camera size={64} className="mx-auto mb-4 opacity-50" />
                  <p className="text-lg">{currentOperationData.symbol}</p>
                  <p className="text-sm text-white/60">
                    {isCompleting ? '✅ Completando...' : 
                     isOperationCompleted ? '✅ Dominada' : 
                     isDetecting ? '🔄 Detectando' : 'Lista para practicar'}
                  </p>
                </div>
                
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-64 border-4 border-green-400 rounded-full opacity-50 animate-pulse"></div>
                </div>
              </div>
              
              {/* Indicador de elemento detectado */}
              {isDetecting && detectedElement && (
                <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-2 rounded-lg">
                  <div className="text-sm font-semibold">Detectado:</div>
                  <div className="text-lg">{detectedElement}</div>
                  <div className="text-xs opacity-80">{detectionConfidence}% de confianza</div>
                </div>
              )}
              
              {isDetecting && !isCompleting && (
                <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold animate-pulse">
                  Detectando...
                </div>
              )}
            </div>

            {/* Controles */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <button 
                  onClick={isPlaying ? stopDetection : startDetection}
                  disabled={isOperationCompleted || isCompleting}
                  className={`flex items-center justify-center gap-2 py-4 rounded-xl font-semibold transition-all ${
                    isOperationCompleted || isCompleting ? 'bg-gray-500 cursor-not-allowed' :
                    isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                  } text-white`}
                >
                  {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                  {isOperationCompleted ? 'Completada' : isPlaying ? 'Pausar' : 'Comenzar'}
                </button>
                
                <button 
                  onClick={resetPractice}
                  disabled={isCompleting}
                  className="flex items-center justify-center gap-2 py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-500 text-white rounded-xl font-semibold transition-all disabled:cursor-not-allowed"
                >
                  <RotateCcw size={24} />
                  Reiniciar
                </button>
              </div>

              {/* Barra de progreso */}
              <div className="mt-4">
                <div className="flex justify-between text-white mb-2">
                  <span>Progreso: {currentOperationData.name}</span>
                  <span>{isOperationCompleted ? '100%' : `${accuracy}%`}</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-blue-400 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${isOperationCompleted ? 100 : accuracy}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Panel derecho */}
          <div className="space-y-6">
            {/* Imagen de referencia */}
            {showImage && (
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <Image size={20} />
                    Referencia Visual
                  </h3>
                  <span className="text-white/60 text-sm">Guía para la operación</span>
                </div>
                <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-4xl font-bold mb-2">{currentOperationData.symbol}</div>
                    <div className="text-white/60">Imagen de referencia</div>
                    <div className="mt-2 text-sm text-blue-300">
                      {currentOperationData.description || 'Realiza las señas en secuencia'}
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getDifficultyColor(currentOperationData.difficulty)}`}>
                    {mode === 'practice' ? `Dificultad: ${currentOperationData.difficulty}` : 'Modo Libre'}
                  </span>
                </div>
              </div>
            )}

            {/* Información de la operación */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <div className="text-center mb-6">
                <div className="text-6xl font-bold text-white mb-2">{currentOperationData.symbol}</div>
                <div className="flex items-center justify-center gap-4 mb-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getDifficultyColor(currentOperationData.difficulty)}`}>
                    {currentOperationData.difficulty}
                  </span>
                  <span className="text-white/60">
                    {isOperationCompleted ? '✅ Completada' : isCompleting ? '🔄 Completando...' : 'En práctica'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-white font-semibold mb-2">Operación:</h3>
                  <p className="text-white/80 bg-blue-500/20 p-3 rounded-lg">
                    {currentOperationData.example}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-white font-semibold mb-2">
                    {mode === 'practice' ? 'Secuencia correcta:' : 'Cómo funciona:'}
                  </h3>
                  <p className="text-white/80">
                    {mode === 'practice' 
                      ? currentOperationData.description
                      : 'Realiza señas de números (0-9) y operadores (+, -, ×, ÷, =) en secuencia para crear operaciones.'
                    }
                  </p>
                </div>
                
                <div>
                  <h3 className="text-white font-semibold mb-2">Consejos:</h3>
                  <ul className="text-white/80 space-y-1">
                    {(currentOperationData.tips || [
                      'Mantén las manos bien visibles',
                      'Realiza movimientos claros y definidos',
                      'Sigue la secuencia en orden'
                    ]).map((tip, index) => (
                      <li key={index}>• {tip}</li>
                    ))}
                  </ul>
                </div>

                {mode === 'free' && (
                  <div className="bg-green-500/20 p-3 rounded-lg">
                    <h4 className="text-green-300 font-semibold mb-1">💡 Modo Libre Activado</h4>
                    <p className="text-green-200 text-sm">
                      El sistema detectará automáticamente los números y operadores que realices con señas.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Progreso del módulo */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <h3 className="text-white font-semibold mb-4">
                {mode === 'practice' ? 'Progreso General' : 'Operaciones Creadas'}
              </h3>
              
              {mode === 'practice' ? (
                <div className="space-y-3">
                  {practiceOperations.map((operation, index) => (
                    <div key={operation.id} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        getStatusColor(operationStatus[operation.id])
                      }`}>
                        {operationStatus[operation.id] === 'completed' ? (
                          <CheckCircle size={16} />
                        ) : (
                          <span className="text-sm font-bold">{index + 1}</span>
                        )}
                      </div>
                      <span className="flex-1 text-white/80">
                        {operation.symbol} - {operation.difficulty}
                      </span>
                      <span className={`text-sm ${
                        operationStatus[operation.id] === 'completed' ? 'text-green-400' : 'text-white/40'
                      }`}>
                        {operationStatus[operation.id] === 'completed' ? 'Completada' : 
                         operationStatus[operation.id] === 'current' ? 'Practicando' : 'Pendiente'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-white/60 py-8">
                  <Calculator size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Las operaciones que crees aparecerán aquí</p>
                  <p>Comienza realizando señas para crear tu primera operación</p>
                </div>
              )}
              
              <div className="mt-4 pt-4 border-t border-white/20">
                <button 
                  onClick={handleCompleteSession}
                  disabled={isCompleting}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 disabled:from-gray-500 disabled:to-gray-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:cursor-not-allowed"
                >
                  {isCompleting ? 'Completando...' : 'Finalizar Sesión'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperationsDashboard;