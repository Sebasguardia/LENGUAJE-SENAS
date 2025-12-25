import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Play, Pause, RotateCcw, Volume2, VolumeX, Camera, 
  Target, Clock, Award, CheckCircle, Star, Image,
  BookOpen, Mic, HelpCircle, TrendingUp, Hash
} from 'lucide-react';

const NumbersDashboard = () => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentNumber, setCurrentNumber] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isDetecting, setIsDetecting] = useState(false);
  const [sessionScore, setSessionScore] = useState(0);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [completedNumbers, setCompletedNumbers] = useState([]);
  const [numberStatus, setNumberStatus] = useState({});
  const [isCompleting, setIsCompleting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showImage, setShowImage] = useState(true);

  // Datos de los números con imágenes de referencia
  const numbers = [
    { 
      id: 1, 
      number: '0', 
      name: 'CERO',
      image: '/images/cero-seña.jpg',
      description: 'Mano cerrada formando un círculo con el pulgar y el índice',
      difficulty: 'Fácil',
      tips: ['Formar un círculo perfecto', 'Dedos restantes ligeramente curvados', 'Mano relajada'],
      funFact: 'El cero es la base del sistema numérico moderno'
    },
    { 
      id: 2, 
      number: '1', 
      name: 'UNO',
      image: '/images/uno-seña.jpg',
      description: 'Dedo índice extendido hacia arriba, otros dedos cerrados',
      difficulty: 'Fácil',
      tips: ['Solo el índice extendido', 'Pulgar sobre los dedos cerrados', 'Mano estable'],
      funFact: 'El uno es el número natural más pequeño'
    },
    { 
      id: 3, 
      number: '2', 
      name: 'DOS',
      image: '/images/dos-seña.jpg',
      description: 'Dedos índice y medio extendidos formando una V',
      difficulty: 'Fácil',
      tips: ['Dos dedos bien separados', 'Formar una V clara', 'Muñeca recta'],
      funFact: 'El dos es el único número par primo'
    },
    { 
      id: 4, 
      number: '3', 
      name: 'TRES',
      image: '/images/tres-seña.jpg',
      description: 'Dedos índice, medio y anular extendidos',
      difficulty: 'Medio',
      tips: ['Tres dedos extendidos', 'Dedos ligeramente separados', 'Mano natural'],
      funFact: 'El tres es considerado número mágico en muchas culturas'
    },
    { 
      id: 5, 
      number: '4', 
      name: 'CUATRO',
      image: '/images/cuatro-seña.jpg',
      description: 'Dedos índice, medio, anular y meñique extendidos, pulgar cerrado',
      difficulty: 'Medio',
      tips: ['Cuatro dedos extendidos', 'Pulgar doblado hacia la palma', 'Mano abierta'],
      funFact: 'El cuatro representa estabilidad y equilibrio'
    },
    { 
      id: 6, 
      number: '5', 
      name: 'CINCO',
      image: '/images/cinco-seña.jpg',
      description: 'Los cinco dedos extendidos y separados',
      difficulty: 'Medio',
      tips: ['Todos los dedos extendidos', 'Mano completamente abierta', 'Dedos naturalmente separados'],
      funFact: 'El cinco es la base del sistema decimal'
    },
    { 
      id: 7, 
      number: '6', 
      name: 'SEIS',
      image: '/images/seis-seña.jpg',
      description: 'Dedo meñique extendido, otros dedos cerrados con el pulgar sobre ellos',
      difficulty: 'Difícil',
      tips: ['Solo el meñique extendido', 'Pulgar sobre los dedos cerrados', 'Mano firme'],
      funFact: 'El seis es el primer número perfecto'
    },
    { 
      id: 8, 
      number: '7', 
      name: 'SIETE',
      image: '/images/siete-seña.jpg',
      description: 'Dedos meñique y anular extendidos, otros cerrados',
      difficulty: 'Difícil',
      tips: ['Dos dedos extendidos juntos', 'Coordinación de dedos pequeños', 'Practicar lentamente'],
      funFact: 'El siete es considerado número de la suerte'
    },
    { 
      id: 9, 
      number: '8', 
      name: 'NUEVE',
      image: '/images/nueve-seña.jpg',
      description: 'Dedo índice doblado formando un gancho, otros dedos cerrados',
      difficulty: 'Difícil',
      tips: ['Índice formando gancho', 'Movimiento específico', 'Practicar frente al espejo'],
      funFact: 'El nueve es el cuadrado de tres'
    },
    { 
      id: 10, 
      number: '9', 
      name: 'DIEZ',
      image: '/images/diez-seña.jpg',
      description: 'Mano cerrada con el pulgar hacia arriba (representando 10 unidades)',
      difficulty: 'Medio',
      tips: ['Mano en forma de puño', 'Pulgar extendido hacia arriba', 'Movimiento claro'],
      funFact: 'El diez es la base de nuestro sistema numérico'
    }
  ];

  // Inicializar estado de los números
  useEffect(() => {
    const initialStatus = {};
    numbers.forEach(number => {
      initialStatus[number.id] = 'pending';
    });
    setNumberStatus(initialStatus);
    setNumberStatus(prev => ({ ...prev, [numbers[0].id]: 'current' }));
  }, []);

  // Función para hablar (Text-to-Speech) con control de mute
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

  // Mensaje de bienvenida al módulo
  useEffect(() => {
    const welcomeMessage = "Bienvenido al módulo de números. Aquí aprenderás las señas para los números del 0 al 10. Comenzaremos con el número cero.";
    
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

  // Simulación de detección de IA
  const simulateDetection = () => {
    if (!isDetecting || isCompleting) return;

    const currentNumberData = numbers[currentNumber];
    
    // Si ya está completada, no hacer nada
    if (completedNumbers.includes(currentNumberData.id)) return;

    // Velocidad de aprendizaje según dificultad
    const difficultyFactors = {
      'Fácil': { learning: 18, threshold: 80 },
      'Medio': { learning: 15, threshold: 85 },
      'Difícil': { learning: 12, threshold: 88 }
    };
    
    const factor = difficultyFactors[currentNumberData.difficulty] || { learning: 15, threshold: 85 };
    const newAccuracy = Math.min(100, accuracy + Math.random() * factor.learning);
    setAccuracy(newAccuracy);

    // Si alcanza el threshold de precisión Y no está en proceso de completar
    if (newAccuracy >= factor.threshold && !isCompleting) {
      setIsCompleting(true);
      setIsDetecting(false);
      setIsPlaying(false);

      const advanceDelay = 2000;
      
      setTimeout(() => {
        // Calcular puntos una sola vez
        const basePoints = currentNumberData.difficulty === 'Fácil' ? 15 : 
                          currentNumberData.difficulty === 'Medio' ? 20 : 25;
        const streakBonus = correctStreak * 5;
        const timeBonus = Math.max(0, 10 - Math.floor(timeElapsed / 15));
        const totalPoints = basePoints + streakBonus + timeBonus;
        
        // Actualizar estados una sola vez
        setSessionScore(prev => prev + totalPoints);
        setCorrectStreak(prev => {
          const newStreak = prev + 1;
          if (newStreak > bestStreak) setBestStreak(newStreak);
          return newStreak;
        });
        
        setCompletedNumbers(prev => [...prev, currentNumberData.id]);
        setNumberStatus(prev => ({
          ...prev,
          [currentNumberData.id]: 'completed'
        }));

        // Mensaje una sola vez
        speak(`¡Excelente! Número ${currentNumberData.number} dominado. +${totalPoints} puntos.`);
        
        // Preparar para siguiente número después de un delay
        setTimeout(() => {
          if (currentNumber < numbers.length - 1) {
            setNumberStatus(prev => ({
              ...prev,
              [numbers[currentNumber + 1].id]: 'current'
            }));
            setCurrentNumber(prev => prev + 1);
            setAccuracy(0);
            setTimeElapsed(0);
          }
          setIsCompleting(false);
        }, 3000);

      }, advanceDelay);
    }

    // Romper racha si la precisión baja mucho
    if (newAccuracy < 25 && correctStreak > 0 && !isCompleting) {
      setCorrectStreak(0);
      speak("Precisión baja. Corrige la posición de los dedos.");
    }
  };

  useEffect(() => {
    let detectionInterval;
    if (isDetecting && !isCompleting) {
      detectionInterval = setInterval(simulateDetection, 1500);
    }
    return () => {
      if (detectionInterval) clearInterval(detectionInterval);
    };
  }, [isDetecting, accuracy, correctStreak, currentNumber, isCompleting, completedNumbers]);

  const startDetection = () => {
    if (completedNumbers.includes(numbers[currentNumber].id) || isCompleting) return;
    
    setIsDetecting(true);
    setIsPlaying(true);
    setAccuracy(0);
    setTimeElapsed(0);
    
    const currentNumberData = numbers[currentNumber];
    speak(`Practicando número: ${currentNumberData.number} (${currentNumberData.name}). Mira la imagen de referencia.`);
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
    speak("Práctica reiniciada para este número.");
  };

  const handleNextNumber = () => {
    if (currentNumber < numbers.length - 1 && !isCompleting) {
      setNumberStatus(prev => ({
        ...prev,
        [numbers[currentNumber].id]: completedNumbers.includes(numbers[currentNumber].id) ? 'completed' : 'pending',
        [numbers[currentNumber + 1].id]: 'current'
      }));

      setCurrentNumber(prev => prev + 1);
      setAccuracy(0);
      setTimeElapsed(0);
      setIsDetecting(false);
      setIsPlaying(false);
      
      const nextNumber = numbers[currentNumber + 1];
      speak(`Siguiente número: ${nextNumber.number} (${nextNumber.name}).`);
    }
  };

  const handlePrevNumber = () => {
    if (currentNumber > 0 && !isCompleting) {
      setNumberStatus(prev => ({
        ...prev,
        [numbers[currentNumber].id]: 'pending',
        [numbers[currentNumber - 1].id]: 'current'
      }));

      setCurrentNumber(prev => prev - 1);
      setAccuracy(0);
      setTimeElapsed(0);
      setIsDetecting(false);
      setIsPlaying(false);
      
      const prevNumber = numbers[currentNumber - 1];
      speak(`Volviendo al número: ${prevNumber.number} (${prevNumber.name}).`);
    }
  };

  const selectNumber = (index) => {
    if (isCompleting) return;
    
    setNumberStatus(prev => {
      const newStatus = { ...prev };
      Object.keys(newStatus).forEach(key => {
        newStatus[key] = 'pending';
      });
      newStatus[numbers[index].id] = 'current';
      return newStatus;
    });

    setCurrentNumber(index);
    setAccuracy(0);
    setTimeElapsed(0);
    setIsDetecting(false);
    setIsPlaying(false);
    
    const selectedNumber = numbers[index];
    speak(`Número ${selectedNumber.number} (${selectedNumber.name}) seleccionado.`);
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

  const handleCompleteSession = () => {
    const totalPossible = numbers.length * 25;
    const percentage = Math.round((sessionScore / totalPossible) * 100);
    speak(`Sesión finalizada. Aprendiste ${completedNumbers.length} números. Puntos: ${sessionScore}. ¡Excelente trabajo numérico!`);
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

  const currentNumberData = numbers[currentNumber];
  const isNumberCompleted = completedNumbers.includes(currentNumberData.id);

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
              <h1 className="text-2xl font-bold text-white">Módulo de Números</h1>
              <p className="text-white/60">
                {isCompleting ? 'Completando número...' : 'Aprende señas para números del 0 al 10'}
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

            {/* Botones de control de audio e imagen */}
            <div className="flex gap-2">
              <button 
                onClick={toggleMute}
                className={`p-2 rounded-lg transition-all ${
                  isMuted ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
                title={isMuted ? 'Activar sonido' : 'Silenciar'}
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              
              <button 
                onClick={toggleImage}
                className={`p-2 rounded-lg transition-all ${
                  showImage ? 'bg-blue-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
                title={showImage ? 'Ocultar imagen' : 'Mostrar imagen'}
              >
                <Image size={20} />
              </button>
            </div>

            <button 
              onClick={() => speak(
                `Número ${currentNumberData.number} (${currentNumberData.name}). ${isNumberCompleted ? 'Completado' : 'Precisión: ' + accuracy + '%'}. Puntos: ${sessionScore}.`
              )}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 transition-colors"
              disabled={isCompleting || isMuted}
            >
              <Hash size={20} />
              Estado
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8">
          {/* Panel izquierdo */}
          <div className="space-y-6">
            {/* Selector de números */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
              <h3 className="text-white font-semibold mb-3">Números del 0 al 10</h3>
              <div className="grid grid-cols-5 gap-2">
                {numbers.map((number, index) => (
                  <button
                    key={number.id}
                    onClick={() => selectNumber(index)}
                    disabled={isCompleting}
                    className={`p-3 rounded-lg text-center transition-all ${
                      getStatusColor(numberStatus[number.id])
                    } ${currentNumber === index ? 'ring-2 ring-blue-400' : ''} ${
                      isCompleting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <div className="text-xl font-bold">{number.number}</div>
                    <div className="text-xs opacity-80 truncate">{number.name}</div>
                    <div className="text-xs opacity-60">{number.difficulty}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Cámara */}
            <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl">
              <div className="aspect-video bg-gray-900 flex items-center justify-center">
                <div className="text-center text-white">
                  <Camera size={64} className="mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Número: {currentNumberData.number} ({currentNumberData.name})</p>
                  <p className="text-sm text-white/60">
                    {isCompleting ? '✅ Completando...' : 
                     isNumberCompleted ? '✅ Dominado' : 
                     isDetecting ? '🔄 Detectando' : 'Lista para practicar'}
                  </p>
                </div>
                
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-64 border-4 border-green-400 rounded-full opacity-50 animate-pulse"></div>
                </div>
              </div>
              
              {isDetecting && !isCompleting && (
                <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold animate-pulse">
                  Detectando...
                </div>
              )}
              {isCompleting && (
                <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  ✅ Completado
                </div>
              )}
            </div>

            {/* Controles */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <button 
                  onClick={isPlaying ? stopDetection : startDetection}
                  disabled={isNumberCompleted || isCompleting}
                  className={`flex items-center justify-center gap-2 py-4 rounded-xl font-semibold transition-all ${
                    isNumberCompleted || isCompleting ? 'bg-gray-500 cursor-not-allowed' :
                    isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                  } text-white`}
                >
                  {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                  {isNumberCompleted ? 'Completado' : isPlaying ? 'Pausar' : 'Comenzar'}
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

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={handlePrevNumber}
                  disabled={currentNumber === 0 || isCompleting}
                  className="flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white rounded-xl transition-all"
                >
                  <ArrowLeft size={20} />
                  Anterior
                </button>
                <button 
                  onClick={handleNextNumber}
                  disabled={currentNumber >= numbers.length - 1 || isCompleting}
                  className="flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white rounded-xl transition-all"
                >
                  Siguiente
                  <ArrowLeft size={20} className="rotate-180" />
                </button>
              </div>

              {/* Barra de progreso */}
              <div className="mt-4">
                <div className="flex justify-between text-white mb-2">
                  <span>Progreso: {currentNumberData.number}</span>
                  <span>{isNumberCompleted ? '100%' : `${accuracy}%`}</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-blue-400 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${isNumberCompleted ? 100 : accuracy}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Sistema de puntos específico para números */}
            <div className="bg-green-500/20 rounded-2xl p-4 border border-green-400/30">
              <h4 className="text-green-300 font-semibold mb-2">🔢 Sistema de Puntos - Números</h4>
              <div className="text-green-200 text-sm space-y-1">
                <div>• <strong>Fácil (0-2):</strong> 15 puntos + bonus</div>
                <div>• <strong>Medio (3-5,10):</strong> 20 puntos + bonus</div>
                <div>• <strong>Difícil (6-9):</strong> 25 puntos + bonus</div>
                <div>• <strong>Bonus numérico:</strong> +1 punto extra por número consecutivo</div>
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
                    Referencia Visual del Número
                  </h3>
                  <span className="text-white/60 text-sm">Guía para la seña numérica</span>
                </div>
                <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-8xl font-bold mb-2">{currentNumberData.number}</div>
                    <div className="text-2xl mb-2">{currentNumberData.name}</div>
                    <div className="text-white/60">Imagen de referencia de la seña</div>
                    <div className="mt-2 text-sm text-blue-300">
                      {currentNumberData.description}
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getDifficultyColor(currentNumberData.difficulty)}`}>
                    Dificultad: {currentNumberData.difficulty}
                  </span>
                </div>
              </div>
            )}

            {/* Información del número */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <div className="text-center mb-6">
                <div className="text-8xl font-bold text-white mb-2">{currentNumberData.number}</div>
                <div className="text-2xl text-white/80 mb-3">{currentNumberData.name}</div>
                <div className="flex items-center justify-center gap-4 mb-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getDifficultyColor(currentNumberData.difficulty)}`}>
                    {currentNumberData.difficulty}
                  </span>
                  <span className="text-white/60">
                    {isNumberCompleted ? '✅ Completado' : isCompleting ? '🔄 Completando...' : 'En práctica'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-white font-semibold mb-2">Seña correcta:</h3>
                  <p className="text-white/80">{currentNumberData.description}</p>
                </div>
                
                <div>
                  <h3 className="text-white font-semibold mb-2">Dato curioso:</h3>
                  <p className="text-white/80 bg-purple-500/20 p-3 rounded-lg">
                    {currentNumberData.funFact}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-white font-semibold mb-2">Consejos para los dedos:</h3>
                  <ul className="text-white/80 space-y-1">
                    {currentNumberData.tips.map((tip, index) => (
                      <li key={index}>• {tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Progreso del módulo */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <h3 className="text-white font-semibold mb-4">Progreso General</h3>
              <div className="space-y-3">
                {numbers.map((number, index) => (
                  <div key={number.id} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      getStatusColor(numberStatus[number.id])
                    }`}>
                      {numberStatus[number.id] === 'completed' ? (
                        <CheckCircle size={16} />
                      ) : (
                        <span className="text-sm font-bold">{number.number}</span>
                      )}
                    </div>
                    <span className="flex-1 text-white/80">
                      {number.name} ({number.number}) - {number.difficulty}
                    </span>
                    <span className={`text-sm ${
                      numberStatus[number.id] === 'completed' ? 'text-green-400' : 'text-white/40'
                    }`}>
                      {numberStatus[number.id] === 'completed' ? 'Completado' : 
                       numberStatus[number.id] === 'current' ? 'Practicando' : 'Pendiente'}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-white/20">
                <button 
                  onClick={handleCompleteSession}
                  disabled={isCompleting}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 disabled:from-gray-500 disabled:to-gray-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:cursor-not-allowed"
                >
                  {isCompleting ? 'Completando...' : 'Finalizar Sesión Numérica'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NumbersDashboard;