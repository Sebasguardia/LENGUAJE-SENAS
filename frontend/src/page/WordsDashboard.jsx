import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Play, Pause, RotateCcw, Volume2, VolumeX, Camera, 
  Target, Clock, Award, CheckCircle, Star, Image,
  BookOpen, Mic, HelpCircle, TrendingUp, MessageSquare
} from 'lucide-react';

const WordsDashboard = () => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWord, setCurrentWord] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isDetecting, setIsDetecting] = useState(false);
  const [sessionScore, setSessionScore] = useState(0);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [completedWords, setCompletedWords] = useState([]);
  const [wordStatus, setWordStatus] = useState({});
  const [isCompleting, setIsCompleting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showImage, setShowImage] = useState(true);

  // Datos de las palabras con imágenes de referencia
  const words = [
    { 
      id: 1, 
      word: 'HOLA', 
      image: '/images/hola-seña.jpg',
      description: 'Mano abierta que se lleva de la frente hacia adelante',
      difficulty: 'Fácil',
      tips: ['Mano abierta con dedos juntos', 'Movimiento suave de la frente hacia adelante', 'Palma visible']
    },
    { 
      id: 2, 
      word: 'GRACIAS', 
      image: '/images/gracias-seña.jpg',
      description: 'Mano cerrada que se lleva de la boca hacia abajo',
      difficulty: 'Medio',
      tips: ['Mano en forma de puño suave', 'Movimiento desde la boca hacia abajo', 'Expresión facial amable']
    },
    { 
      id: 3, 
      word: 'POR FAVOR', 
      image: '/images/porfavor-seña.jpg',
      description: 'Mano abierta que realiza movimiento circular en el pecho',
      difficulty: 'Medio',
      tips: ['Mano abierta con palma hacia arriba', 'Movimiento circular suave', 'En la zona del pecho']
    },
    { 
      id: 4, 
      word: 'AMIGO', 
      image: '/images/amigo-seña.jpg',
      description: 'Dos dedos índice que se juntan y separan',
      difficulty: 'Difícil',
      tips: ['Dedos índice extendidos', 'Movimiento de unión y separación', 'Coordinación bilateral']
    },
    { 
      id: 5, 
      word: 'FAMILIA', 
      image: '/images/familia-seña.jpg',
      description: 'Dos manos con dedos extendidos que se entrelazan',
      difficulty: 'Difícil',
      tips: ['Ambas manos con dedos abiertos', 'Movimiento de entrelazado', 'Coordinación de ambas manos']
    },
    { 
      id: 6, 
      word: 'ESCUELA', 
      image: '/images/escuela-seña.jpg',
      description: 'Mano abierta que golpea suavemente la palma de la otra mano',
      difficulty: 'Medio',
      tips: ['Una mano abierta, la otra como base', 'Golpe suave en la palma', 'Movimiento controlado']
    }
  ];

  // Inicializar estado de las palabras
  useEffect(() => {
    const initialStatus = {};
    words.forEach(word => {
      initialStatus[word.id] = 'pending';
    });
    setWordStatus(initialStatus);
    setWordStatus(prev => ({ ...prev, [words[0].id]: 'current' }));
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
    const welcomeMessage = "Bienvenido al módulo de palabras. Aquí aprenderás señas para palabras comunes. Cada palabra tiene una imagen de referencia para guiarte. Comenzaremos con la palabra HOLA.";
    
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

  // Simulación de detección de IA - CORREGIDO
  const simulateDetection = () => {
    if (!isDetecting || isCompleting) return;

    const currentWordData = words[currentWord];
    
    // Si ya está completada, no hacer nada
    if (completedWords.includes(currentWordData.id)) return;

    // Velocidad de aprendizaje según dificultad
    const difficultyFactors = {
      'Fácil': { learning: 12, threshold: 80 },
      'Medio': { learning: 10, threshold: 85 },
      'Difícil': { learning: 8, threshold: 88 }
    };
    
    const factor = difficultyFactors[currentWordData.difficulty] || { learning: 10, threshold: 85 };
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
        const basePoints = currentWordData.difficulty === 'Fácil' ? 20 : 
                          currentWordData.difficulty === 'Medio' ? 25 : 30;
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
        
        setCompletedWords(prev => [...prev, currentWordData.id]);
        setWordStatus(prev => ({
          ...prev,
          [currentWordData.id]: 'completed'
        }));

        // Mensaje una sola vez
        speak(`¡Excelente! Palabra ${currentWordData.word} dominada. +${totalPoints} puntos.`);
        
        // Preparar para siguiente palabra después de un delay
        setTimeout(() => {
          if (currentWord < words.length - 1) {
            setWordStatus(prev => ({
              ...prev,
              [words[currentWord + 1].id]: 'current'
            }));
            setCurrentWord(prev => prev + 1);
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
  }, [isDetecting, accuracy, correctStreak, currentWord, isCompleting, completedWords]);

  const startDetection = () => {
    if (completedWords.includes(words[currentWord].id) || isCompleting) return;
    
    setIsDetecting(true);
    setIsPlaying(true);
    setAccuracy(0);
    setTimeElapsed(0);
    
    const currentWordData = words[currentWord];
    speak(`Practicando palabra: ${currentWordData.word}. Mira la imagen de referencia.`);
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
    speak("Práctica reiniciada para esta palabra.");
  };

  const handleNextWord = () => {
    if (currentWord < words.length - 1 && !isCompleting) {
      setWordStatus(prev => ({
        ...prev,
        [words[currentWord].id]: completedWords.includes(words[currentWord].id) ? 'completed' : 'pending',
        [words[currentWord + 1].id]: 'current'
      }));

      setCurrentWord(prev => prev + 1);
      setAccuracy(0);
      setTimeElapsed(0);
      setIsDetecting(false);
      setIsPlaying(false);
      
      const nextWord = words[currentWord + 1];
      speak(`Siguiente palabra: ${nextWord.word}.`);
    }
  };

  const handlePrevWord = () => {
    if (currentWord > 0 && !isCompleting) {
      setWordStatus(prev => ({
        ...prev,
        [words[currentWord].id]: 'pending',
        [words[currentWord - 1].id]: 'current'
      }));

      setCurrentWord(prev => prev - 1);
      setAccuracy(0);
      setTimeElapsed(0);
      setIsDetecting(false);
      setIsPlaying(false);
      
      const prevWord = words[currentWord - 1];
      speak(`Volviendo a la palabra: ${prevWord.word}.`);
    }
  };

  const selectWord = (index) => {
    if (isCompleting) return;
    
    setWordStatus(prev => {
      const newStatus = { ...prev };
      Object.keys(newStatus).forEach(key => {
        newStatus[key] = 'pending';
      });
      newStatus[words[index].id] = 'current';
      return newStatus;
    });

    setCurrentWord(index);
    setAccuracy(0);
    setTimeElapsed(0);
    setIsDetecting(false);
    setIsPlaying(false);
    
    const selectedWord = words[index];
    speak(`Palabra ${selectedWord.word} seleccionada.`);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      window.speechSynthesis.cancel(); // Silenciar inmediatamente
    }
  };

  const toggleImage = () => {
    setShowImage(!showImage);
  };

  const handleCompleteSession = () => {
    const totalPossible = words.length * 30;
    const percentage = Math.round((sessionScore / totalPossible) * 100);
    speak(`Sesión finalizada. Aprendiste ${completedWords.length} palabras. Puntos: ${sessionScore}. ¡Buen trabajo!`);
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

  const currentWordData = words[currentWord];
  const isWordCompleted = completedWords.includes(currentWordData.id);

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
              <h1 className="text-2xl font-bold text-white">Módulo de Palabras</h1>
              <p className="text-white/60">
                {isCompleting ? 'Completando palabra...' : 'Aprende señas para palabras comunes'}
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
                `Palabra ${currentWordData.word}. ${isWordCompleted ? 'Completada' : 'Precisión: ' + accuracy + '%'}. Puntos: ${sessionScore}.`
              )}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 transition-colors"
              disabled={isCompleting || isMuted}
            >
              <Mic size={20} />
              Estado
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8">
          {/* Panel izquierdo */}
          <div className="space-y-6">
            {/* Selector de palabras */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
              <h3 className="text-white font-semibold mb-3">Palabras</h3>
              <div className="grid grid-cols-3 gap-2">
                {words.map((word, index) => (
                  <button
                    key={word.id}
                    onClick={() => selectWord(index)}
                    disabled={isCompleting}
                    className={`p-3 rounded-lg text-center transition-all ${
                      getStatusColor(wordStatus[word.id])
                    } ${currentWord === index ? 'ring-2 ring-blue-400' : ''} ${
                      isCompleting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <div className="text-lg font-bold">{word.word}</div>
                    <div className="text-xs opacity-80">{word.difficulty}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Cámara */}
            <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl">
              <div className="aspect-video bg-gray-900 flex items-center justify-center">
                <div className="text-center text-white">
                  <Camera size={64} className="mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Palabra: {currentWordData.word}</p>
                  <p className="text-sm text-white/60">
                    {isCompleting ? '✅ Completando...' : 
                     isWordCompleted ? '✅ Dominada' : 
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
                  disabled={isWordCompleted || isCompleting}
                  className={`flex items-center justify-center gap-2 py-4 rounded-xl font-semibold transition-all ${
                    isWordCompleted || isCompleting ? 'bg-gray-500 cursor-not-allowed' :
                    isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                  } text-white`}
                >
                  {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                  {isWordCompleted ? 'Completada' : isPlaying ? 'Pausar' : 'Comenzar'}
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
                  <span>Progreso: {currentWordData.word}</span>
                  <span>{isWordCompleted ? '100%' : `${accuracy}%`}</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-blue-400 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${isWordCompleted ? 100 : accuracy}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Panel derecho - REORGANIZADO: Imagen arriba */}
          <div className="space-y-6">
            {/* Imagen de referencia - AHORA ARRIBA */}
            {showImage && (
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <Image size={20} />
                    Referencia Visual
                  </h3>
                  <span className="text-white/60 text-sm">Guía para la seña</span>
                </div>
                <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-4xl font-bold mb-2">{currentWordData.word}</div>
                    <div className="text-white/60">Imagen de referencia de la seña</div>
                    <div className="mt-2 text-sm text-blue-300">
                      {currentWordData.description}
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getDifficultyColor(currentWordData.difficulty)}`}>
                    Dificultad: {currentWordData.difficulty}
                  </span>
                </div>
              </div>
            )}

            {/* Información de la palabra */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <div className="text-center mb-6">
                <div className="text-6xl font-bold text-white mb-2">{currentWordData.word}</div>
                <div className="flex items-center justify-center gap-4 mb-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getDifficultyColor(currentWordData.difficulty)}`}>
                    {currentWordData.difficulty}
                  </span>
                  <span className="text-white/60">
                    {isWordCompleted ? '✅ Completada' : isCompleting ? '🔄 Completando...' : 'En práctica'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-white font-semibold mb-2">Seña correcta:</h3>
                  <p className="text-white/80">{currentWordData.description}</p>
                </div>
                
                <div>
                  <h3 className="text-white font-semibold mb-2">Consejos específicos:</h3>
                  <ul className="text-white/80 space-y-1">
                    {currentWordData.tips.map((tip, index) => (
                      <li key={index}>• {tip}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-blue-500/20 p-3 rounded-lg">
                  <h4 className="text-blue-300 font-semibold mb-1">📸 Imagen de referencia:</h4>
                  <p className="text-blue-200 text-sm">
                    Usa la imagen como guía para la posición correcta de la mano.
                    {!showImage && ' (Activa la visualización de imagen arriba)'}
                  </p>
                </div>
              </div>
            </div>

            {/* Progreso del módulo */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <h3 className="text-white font-semibold mb-4">Progreso General</h3>
              <div className="space-y-3">
                {words.map((word, index) => (
                  <div key={word.id} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      getStatusColor(wordStatus[word.id])
                    }`}>
                      {wordStatus[word.id] === 'completed' ? (
                        <CheckCircle size={16} />
                      ) : (
                        <span className="text-sm font-bold">{word.word.substring(0, 2)}</span>
                      )}
                    </div>
                    <span className="flex-1 text-white/80">
                      {word.word} - {word.difficulty}
                    </span>
                    <span className={`text-sm ${
                      wordStatus[word.id] === 'completed' ? 'text-green-400' : 'text-white/40'
                    }`}>
                      {wordStatus[word.id] === 'completed' ? 'Completada' : 
                       wordStatus[word.id] === 'current' ? 'Practicando' : 'Pendiente'}
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

export default WordsDashboard;