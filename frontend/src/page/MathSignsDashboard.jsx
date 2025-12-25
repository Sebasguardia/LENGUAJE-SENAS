import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Play, Pause, RotateCcw, Volume2, VolumeX, Camera, 
  Target, Clock, Award, CheckCircle, Star, Image,
  BookOpen, Mic, HelpCircle, TrendingUp, Calculator
} from 'lucide-react';

const MathSignsDashboard = () => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSign, setCurrentSign] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isDetecting, setIsDetecting] = useState(false);
  const [sessionScore, setSessionScore] = useState(0);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [completedSigns, setCompletedSigns] = useState([]);
  const [signStatus, setSignStatus] = useState({});
  const [isCompleting, setIsCompleting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showImage, setShowImage] = useState(true);

  // Datos de los signos matemáticos con imágenes de referencia
  const mathSigns = [
    { 
      id: 1, 
      sign: '+', 
      name: 'SUMA',
      image: '/images/suma-seña.jpg',
      description: 'Dedos índice y medio cruzados formando una cruz',
      difficulty: 'Fácil',
      tips: ['Dedos índice y medio extendidos', 'Formar una cruz clara', 'Mano estable'],
      usage: 'Operación de adición'
    },
    { 
      id: 2, 
      sign: '-', 
      name: 'RESTA',
      image: '/images/resta-seña.jpg',
      description: 'Dedo índice horizontal moviéndose de izquierda a derecha',
      difficulty: 'Fácil',
      tips: ['Solo dedo índice extendido', 'Movimiento horizontal suave', 'Mano paralela al suelo'],
      usage: 'Operación de sustracción'
    },
    { 
      id: 3, 
      sign: '×', 
      name: 'MULTIPLICACIÓN',
      image: '/images/multiplicacion-seña.jpg',
      description: 'Dedos índice cruzados formando una X',
      difficulty: 'Medio',
      tips: ['Ambos dedos índices cruzados', 'Formar una X bien definida', 'Cruzar en el centro'],
      usage: 'Operación de multiplicación'
    },
    { 
      id: 4, 
      sign: '÷', 
      name: 'DIVISIÓN',
      image: '/images/division-seña.jpg',
      description: 'Mano abierta con movimiento de separación',
      difficulty: 'Medio',
      tips: ['Mano abierta con dedos separados', 'Movimiento de separación simétrico', 'Ambas manos coordinadas'],
      usage: 'Operación de división'
    },
    { 
      id: 5, 
      sign: '=', 
      name: 'IGUAL',
      image: '/images/igual-seña.jpg',
      description: 'Dos dedos índices paralelos moviéndose juntos',
      difficulty: 'Medio',
      tips: ['Dedos índices paralelos', 'Movimiento simultáneo', 'Mantener la paralelismo'],
      usage: 'Indica igualdad'
    },
    { 
      id: 6, 
      sign: '>', 
      name: 'MAYOR QUE',
      image: '/images/mayorque-seña.jpg',
      description: 'Mano formando un ángulo agudo hacia la derecha',
      difficulty: 'Difícil',
      tips: ['Mano en forma de V', 'Ángulo bien definido', 'Orientación correcta'],
      usage: 'Comparación mayor que'
    },
    { 
      id: 7, 
      sign: '<', 
      name: 'MENOR QUE',
      image: '/images/menorque-seña.jpg',
      description: 'Mano formando un ángulo agudo hacia la izquierda',
      difficulty: 'Difícil',
      tips: ['Mano en forma de V invertida', 'Ángulo simétrico al mayor que', 'Orientación izquierda'],
      usage: 'Comparación menor que'
    }
  ];

  // Inicializar estado de los signos
  useEffect(() => {
    const initialStatus = {};
    mathSigns.forEach(sign => {
      initialStatus[sign.id] = 'pending';
    });
    setSignStatus(initialStatus);
    setSignStatus(prev => ({ ...prev, [mathSigns[0].id]: 'current' }));
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
    const welcomeMessage = "Bienvenido al módulo de signos matemáticos. Aquí aprenderás las señas para operaciones y símbolos matemáticos básicos. Comenzaremos con el signo de suma.";
    
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

    const currentSignData = mathSigns[currentSign];
    
    // Si ya está completada, no hacer nada
    if (completedSigns.includes(currentSignData.id)) return;

    // Velocidad de aprendizaje según dificultad
    const difficultyFactors = {
      'Fácil': { learning: 15, threshold: 80 },
      'Medio': { learning: 12, threshold: 85 },
      'Difícil': { learning: 10, threshold: 88 }
    };
    
    const factor = difficultyFactors[currentSignData.difficulty] || { learning: 12, threshold: 85 };
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
        const basePoints = currentSignData.difficulty === 'Fácil' ? 20 : 
                          currentSignData.difficulty === 'Medio' ? 25 : 30;
        const streakBonus = correctStreak * 5;
        const timeBonus = Math.max(0, 10 - Math.floor(timeElapsed / 20));
        const totalPoints = basePoints + streakBonus + timeBonus;
        
        // Actualizar estados una sola vez
        setSessionScore(prev => prev + totalPoints);
        setCorrectStreak(prev => {
          const newStreak = prev + 1;
          if (newStreak > bestStreak) setBestStreak(newStreak);
          return newStreak;
        });
        
        setCompletedSigns(prev => [...prev, currentSignData.id]);
        setSignStatus(prev => ({
          ...prev,
          [currentSignData.id]: 'completed'
        }));

        // Mensaje una sola vez
        speak(`¡Excelente! Signo ${currentSignData.sign} dominado. +${totalPoints} puntos.`);
        
        // Preparar para siguiente signo después de un delay
        setTimeout(() => {
          if (currentSign < mathSigns.length - 1) {
            setSignStatus(prev => ({
              ...prev,
              [mathSigns[currentSign + 1].id]: 'current'
            }));
            setCurrentSign(prev => prev + 1);
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
      speak("Precisión baja. Corrige la posición.");
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
  }, [isDetecting, accuracy, correctStreak, currentSign, isCompleting, completedSigns]);

  const startDetection = () => {
    if (completedSigns.includes(mathSigns[currentSign].id) || isCompleting) return;
    
    setIsDetecting(true);
    setIsPlaying(true);
    setAccuracy(0);
    setTimeElapsed(0);
    
    const currentSignData = mathSigns[currentSign];
    speak(`Practicando signo: ${currentSignData.name} (${currentSignData.sign}). Mira la imagen de referencia.`);
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
    speak("Práctica reiniciada para este signo.");
  };

  const handleNextSign = () => {
    if (currentSign < mathSigns.length - 1 && !isCompleting) {
      setSignStatus(prev => ({
        ...prev,
        [mathSigns[currentSign].id]: completedSigns.includes(mathSigns[currentSign].id) ? 'completed' : 'pending',
        [mathSigns[currentSign + 1].id]: 'current'
      }));

      setCurrentSign(prev => prev + 1);
      setAccuracy(0);
      setTimeElapsed(0);
      setIsDetecting(false);
      setIsPlaying(false);
      
      const nextSign = mathSigns[currentSign + 1];
      speak(`Siguiente signo: ${nextSign.name} (${nextSign.sign}).`);
    }
  };

  const handlePrevSign = () => {
    if (currentSign > 0 && !isCompleting) {
      setSignStatus(prev => ({
        ...prev,
        [mathSigns[currentSign].id]: 'pending',
        [mathSigns[currentSign - 1].id]: 'current'
      }));

      setCurrentSign(prev => prev - 1);
      setAccuracy(0);
      setTimeElapsed(0);
      setIsDetecting(false);
      setIsPlaying(false);
      
      const prevSign = mathSigns[currentSign - 1];
      speak(`Volviendo al signo: ${prevSign.name} (${prevSign.sign}).`);
    }
  };

  const selectSign = (index) => {
    if (isCompleting) return;
    
    setSignStatus(prev => {
      const newStatus = { ...prev };
      Object.keys(newStatus).forEach(key => {
        newStatus[key] = 'pending';
      });
      newStatus[mathSigns[index].id] = 'current';
      return newStatus;
    });

    setCurrentSign(index);
    setAccuracy(0);
    setTimeElapsed(0);
    setIsDetecting(false);
    setIsPlaying(false);
    
    const selectedSign = mathSigns[index];
    speak(`Signo ${selectedSign.name} (${selectedSign.sign}) seleccionado.`);
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
    const totalPossible = mathSigns.length * 30;
    const percentage = Math.round((sessionScore / totalPossible) * 100);
    speak(`Sesión finalizada. Aprendiste ${completedSigns.length} signos matemáticos. Puntos: ${sessionScore}. ¡Excelente trabajo matemático!`);
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

  const currentSignData = mathSigns[currentSign];
  const isSignCompleted = completedSigns.includes(currentSignData.id);

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
              <h1 className="text-2xl font-bold text-white">Módulo de Signos Matemáticos</h1>
              <p className="text-white/60">
                {isCompleting ? 'Completando signo...' : 'Aprende señas para operaciones matemáticas'}
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
                `Signo ${currentSignData.name} (${currentSignData.sign}). ${isSignCompleted ? 'Completado' : 'Precisión: ' + accuracy + '%'}. Puntos: ${sessionScore}.`
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
            {/* Selector de signos */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
              <h3 className="text-white font-semibold mb-3">Signos Matemáticos</h3>
              <div className="grid grid-cols-4 gap-2">
                {mathSigns.map((sign, index) => (
                  <button
                    key={sign.id}
                    onClick={() => selectSign(index)}
                    disabled={isCompleting}
                    className={`p-3 rounded-lg text-center transition-all ${
                      getStatusColor(signStatus[sign.id])
                    } ${currentSign === index ? 'ring-2 ring-blue-400' : ''} ${
                      isCompleting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <div className="text-xl font-bold">{sign.sign}</div>
                    <div className="text-xs opacity-80 truncate">{sign.name}</div>
                    <div className="text-xs opacity-60">{sign.difficulty}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Cámara */}
            <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl">
              <div className="aspect-video bg-gray-900 flex items-center justify-center">
                <div className="text-center text-white">
                  <Camera size={64} className="mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Signo: {currentSignData.sign} ({currentSignData.name})</p>
                  <p className="text-sm text-white/60">
                    {isCompleting ? '✅ Completando...' : 
                     isSignCompleted ? '✅ Dominado' : 
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
                  disabled={isSignCompleted || isCompleting}
                  className={`flex items-center justify-center gap-2 py-4 rounded-xl font-semibold transition-all ${
                    isSignCompleted || isCompleting ? 'bg-gray-500 cursor-not-allowed' :
                    isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                  } text-white`}
                >
                  {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                  {isSignCompleted ? 'Completado' : isPlaying ? 'Pausar' : 'Comenzar'}
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
                  onClick={handlePrevSign}
                  disabled={currentSign === 0 || isCompleting}
                  className="flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white rounded-xl transition-all"
                >
                  <ArrowLeft size={20} />
                  Anterior
                </button>
                <button 
                  onClick={handleNextSign}
                  disabled={currentSign >= mathSigns.length - 1 || isCompleting}
                  className="flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white rounded-xl transition-all"
                >
                  Siguiente
                  <ArrowLeft size={20} className="rotate-180" />
                </button>
              </div>

              {/* Barra de progreso */}
              <div className="mt-4">
                <div className="flex justify-between text-white mb-2">
                  <span>Progreso: {currentSignData.sign}</span>
                  <span>{isSignCompleted ? '100%' : `${accuracy}%`}</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-blue-400 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${isSignCompleted ? 100 : accuracy}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Sistema de puntos específico para matemáticas */}
            <div className="bg-purple-500/20 rounded-2xl p-4 border border-purple-400/30">
              <h4 className="text-purple-300 font-semibold mb-2">🧮 Sistema de Puntos - Matemáticas</h4>
              <div className="text-purple-200 text-sm space-y-1">
                <div>• <strong>Fácil:</strong> 20 puntos + bonus</div>
                <div>• <strong>Medio:</strong> 25 puntos + bonus</div>
                <div>• <strong>Difícil:</strong> 30 puntos + bonus</div>
                <div>• <strong>Bonus matemático:</strong> +2 puntos extra por signo</div>
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
                    Referencia Visual del Signo
                  </h3>
                  <span className="text-white/60 text-sm">Guía para la seña matemática</span>
                </div>
                <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-6xl font-bold mb-2">{currentSignData.sign}</div>
                    <div className="text-2xl mb-2">{currentSignData.name}</div>
                    <div className="text-white/60">Imagen de referencia de la seña</div>
                    <div className="mt-2 text-sm text-blue-300">
                      {currentSignData.description}
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getDifficultyColor(currentSignData.difficulty)}`}>
                    Dificultad: {currentSignData.difficulty}
                  </span>
                </div>
              </div>
            )}

            {/* Información del signo matemático */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <div className="text-center mb-6">
                <div className="text-8xl font-bold text-white mb-2">{currentSignData.sign}</div>
                <div className="text-2xl text-white/80 mb-3">{currentSignData.name}</div>
                <div className="flex items-center justify-center gap-4 mb-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getDifficultyColor(currentSignData.difficulty)}`}>
                    {currentSignData.difficulty}
                  </span>
                  <span className="text-white/60">
                    {isSignCompleted ? '✅ Completado' : isCompleting ? '🔄 Completando...' : 'En práctica'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-white font-semibold mb-2">Seña correcta:</h3>
                  <p className="text-white/80">{currentSignData.description}</p>
                </div>
                
                <div>
                  <h3 className="text-white font-semibold mb-2">Uso matemático:</h3>
                  <p className="text-white/80 bg-blue-500/20 p-3 rounded-lg">
                    {currentSignData.usage}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-white font-semibold mb-2">Consejos específicos:</h3>
                  <ul className="text-white/80 space-y-1">
                    {currentSignData.tips.map((tip, index) => (
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
                {mathSigns.map((sign, index) => (
                  <div key={sign.id} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      getStatusColor(signStatus[sign.id])
                    }`}>
                      {signStatus[sign.id] === 'completed' ? (
                        <CheckCircle size={16} />
                      ) : (
                        <span className="text-sm font-bold">{sign.sign}</span>
                      )}
                    </div>
                    <span className="flex-1 text-white/80">
                      {sign.name} ({sign.sign}) - {sign.difficulty}
                    </span>
                    <span className={`text-sm ${
                      signStatus[sign.id] === 'completed' ? 'text-green-400' : 'text-white/40'
                    }`}>
                      {signStatus[sign.id] === 'completed' ? 'Completado' : 
                       signStatus[sign.id] === 'current' ? 'Practicando' : 'Pendiente'}
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
                  {isCompleting ? 'Completando...' : 'Finalizar Sesión Matemática'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MathSignsDashboard;