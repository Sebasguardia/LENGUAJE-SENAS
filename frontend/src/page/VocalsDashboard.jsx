import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Play, Pause, RotateCcw, Volume2, VolumeX, Camera, 
  Target, Award, CheckCircle, Star, Image,
  BookOpen, Mic, HelpCircle, TrendingUp
} from 'lucide-react';

const VocalsDashboard = () => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVowel, setCurrentVowel] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isDetecting, setIsDetecting] = useState(false);
  const [sessionScore, setSessionScore] = useState(0);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [completedVowels, setCompletedVowels] = useState([]);
  const [vowelStatus, setVowelStatus] = useState({});
  const [isCompleting, setIsCompleting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showImage, setShowImage] = useState(true);

  // Datos de las vocales con imágenes de referencia
  const vowels = [
    { 
      id: 1, 
      vowel: 'A', 
      name: 'VOCAL A',
      image: 'https://placehold.co/600x400/1e293b/ffffff?text=Seña+de+la+A',
      description: 'Puño cerrado con el pulgar posicionado a un lado, tocando el índice.',
      difficulty: 'Fácil',
      tips: ['Cierra todos los dedos firmemente', 'El pulgar debe estar visible a un lado', 'Mantén la muñeca recta y firme'],
      usage: 'Se usa en palabras como "Amor", "Árbol", "Agua".'
    },
    { 
      id: 2, 
      vowel: 'E', 
      name: 'VOCAL E',
      image: 'https://placehold.co/600x400/1e293b/ffffff?text=Seña+de+la+E',
      description: 'Dedos flexionados sobre la palma, con el pulgar doblado por un lado.',
      difficulty: 'Medio',
      tips: ['Dobla los cuatro dedos hacia la palma', 'Las yemas deben tocar la base de los dedos', 'El pulgar se apoya sobre el índice y medio'],
      usage: 'Se usa en palabras como "Elefante", "Estrella", "Escuela".'
    },
    { 
      id: 3, 
      vowel: 'I', 
      name: 'VOCAL I',
      image: 'https://placehold.co/600x400/1e293b/ffffff?text=Seña+de+la+I',
      description: 'Puño cerrado con el dedo meñique completamente extendido hacia arriba.',
      difficulty: 'Fácil',
      tips: ['Asegúrate que solo el meñique esté levantado', 'Los otros dedos deben estar bien cerrados', 'El meñique debe estar recto y firme'],
      usage: 'Se usa en palabras como "Iglesia", "Isla", "Idea".'
    },
    { 
      id: 4, 
      vowel: 'O', 
      name: 'VOCAL O',
      image: 'https://placehold.co/600x400/1e293b/ffffff?text=Seña+de+la+O',
      description: 'Todos los dedos se juntan en las puntas formando un círculo claro.',
      difficulty: 'Fácil',
      tips: ['Forma una "O" perfecta con tus dedos', 'No dejes espacios entre las yemas', 'La forma debe ser redonda y visible'],
      usage: 'Se usa en palabras como "Oso", "Ojo", "Oro".'
    },
    { 
      id: 5, 
      vowel: 'U', 
      name: 'VOCAL U',
      image: 'https://placehold.co/600x400/1e293b/ffffff?text=Seña+de+la+U',
      description: 'Dedos índice y medio extendidos hacia arriba, juntos y rectos.',
      difficulty: 'Fácil',
      tips: ['Los dedos índice y medio deben estar pegados', 'El pulgar sujeta los dedos anular y meñique', 'Mantén los dedos rectos'],
      usage: 'Se usa en palabras como "Uva", "Uno", "Universo".'
    }
  ];

  // Inicializar estado de las vocales
  useEffect(() => {
    const initialStatus = {};
    vowels.forEach(vowel => {
      initialStatus[vowel.id] = 'pending';
    });
    setVowelStatus(initialStatus);
    setVowelStatus(prev => ({ ...prev, [vowels[0].id]: 'current' }));
  }, []);

  // Función para hablar (Text-to-Speech) con control de mute
  const speak = (text) => {
    if ('speechSynthesis' in window && !isMuted) {
      window.speechSynthesis.cancel();
      const speech = new SpeechSynthesisUtterance(text);
      speech.lang = 'es-ES';
      speech.rate = 0.9;
      speech.volume = 1;
      window.speechSynthesis.speak(speech);
    }
  };

  // Mensaje de bienvenida al módulo
  useEffect(() => {
    const welcomeMessage = "Bienvenido al módulo de vocales. Aquí aprenderás las señas fundamentales del abecedario. Comenzaremos con la vocal A.";
    
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

    const currentVowelData = vowels[currentVowel];
    
    if (completedVowels.includes(currentVowelData.id)) return;

    const difficultyFactors = {
      'Fácil': { learning: 15, threshold: 80 },
      'Medio': { learning: 12, threshold: 85 },
      'Difícil': { learning: 10, threshold: 88 }
    };
    
    const factor = difficultyFactors[currentVowelData.difficulty] || { learning: 12, threshold: 85 };
    const newAccuracy = Math.min(100, accuracy + Math.random() * factor.learning);
    setAccuracy(newAccuracy);

    if (newAccuracy >= factor.threshold && !isCompleting) {
      setIsCompleting(true);
      setIsDetecting(false);
      setIsPlaying(false);

      const advanceDelay = 2000;
      
      setTimeout(() => {
        const basePoints = currentVowelData.difficulty === 'Fácil' ? 20 : 25;
        const streakBonus = correctStreak * 5;
        const totalPoints = basePoints + streakBonus;
        
        setSessionScore(prev => prev + totalPoints);
        setCorrectStreak(prev => {
          const newStreak = prev + 1;
          if (newStreak > bestStreak) setBestStreak(newStreak);
          return newStreak;
        });
        
        setCompletedVowels(prev => [...prev, currentVowelData.id]);
        setVowelStatus(prev => ({
          ...prev,
          [currentVowelData.id]: 'completed'
        }));

        speak(`¡Excelente! Vocal ${currentVowelData.vowel} dominada. +${totalPoints} puntos.`);
        
        setTimeout(() => {
          if (currentVowel < vowels.length - 1) {
            setVowelStatus(prev => ({
              ...prev,
              [vowels[currentVowel + 1].id]: 'current'
            }));
            setCurrentVowel(prev => prev + 1);
            setAccuracy(0);
            setTimeElapsed(0);
          }
          setIsCompleting(false);
        }, 3000);

      }, advanceDelay);
    }

    if (newAccuracy < 25 && correctStreak > 0 && !isCompleting) {
      setCorrectStreak(0);
      speak("Precisión baja. Corrige la posición de tu mano.");
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
  }, [isDetecting, accuracy, correctStreak, currentVowel, isCompleting, completedVowels]);

  const startDetection = () => {
    if (completedVowels.includes(vowels[currentVowel].id) || isCompleting) return;
    
    setIsDetecting(true);
    setIsPlaying(true);
    setAccuracy(0);
    setTimeElapsed(0);
    
    const currentVowelData = vowels[currentVowel];
    speak(`Practicando vocal: ${currentVowelData.name}. Mira la imagen de referencia.`);
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
    speak("Práctica reiniciada para esta vocal.");
  };

  const handleNextVowel = () => {
    if (currentVowel < vowels.length - 1 && !isCompleting) {
        setVowelStatus(prev => ({
        ...prev,
        [vowels[currentVowel].id]: completedVowels.includes(vowels[currentVowel].id) ? 'completed' : 'pending',
        [vowels[currentVowel + 1].id]: 'current'
      }));

      setCurrentVowel(prev => prev + 1);
      setAccuracy(0);
      setTimeElapsed(0);
      setIsDetecting(false);
      setIsPlaying(false);
      
      const nextVowel = vowels[currentVowel + 1];
      speak(`Siguiente vocal: ${nextVowel.name}.`);
    }
  };

  const handlePrevVowel = () => {
    if (currentVowel > 0 && !isCompleting) {
      setVowelStatus(prev => ({
        ...prev,
        [vowels[currentVowel].id]: completedVowels.includes(vowels[currentVowel].id) ? 'completed' : 'pending',
        [vowels[currentVowel - 1].id]: 'current'
      }));

      setCurrentVowel(prev => prev - 1);
      setAccuracy(0);
      setTimeElapsed(0);
      setIsDetecting(false);
      setIsPlaying(false);
      
      const prevVowel = vowels[currentVowel - 1];
      speak(`Volviendo a la vocal: ${prevVowel.name}.`);
    }
  };
  
  const selectVowel = (index) => {
    if (isCompleting) return;
    
    setVowelStatus(prev => {
      const newStatus = { ...prev };
      Object.keys(newStatus).forEach(key => {
        if (completedVowels.includes(parseInt(key))) {
            newStatus[key] = 'completed';
        } else {
            newStatus[key] = 'pending';
        }
      });
      newStatus[vowels[index].id] = 'current';
      return newStatus;
    });

    setCurrentVowel(index);
    setAccuracy(0);
    setTimeElapsed(0);
    setIsDetecting(false);
    setIsPlaying(false);
    
    const selectedVowel = vowels[index];
    speak(`Vocal ${selectedVowel.name} seleccionada.`);
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
    speak(`Sesión finalizada. Aprendiste ${completedVowels.length} vocales. Puntos: ${sessionScore}. ¡Gran trabajo!`);
    navigate('/dashboard');
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

  const currentVowelData = vowels[currentVowel];
  const isVowelCompleted = completedVowels.includes(currentVowelData.id);

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
              <h1 className="text-2xl font-bold text-white">Módulo de Vocales</h1>
              <p className="text-white/60">
                {isCompleting ? 'Completando vocal...' : 'Aprende las señas de las vocales'}
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
                `Vocal ${currentVowelData.name}. ${isVowelCompleted ? 'Completado' : 'Precisión: ' + Math.round(accuracy) + '%'}. Puntos: ${sessionScore}.`
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
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
              <h3 className="text-white font-semibold mb-3">Vocales</h3>
              <div className="grid grid-cols-5 gap-2">
                {vowels.map((vowel, index) => (
                  <button
                    key={vowel.id}
                    onClick={() => selectVowel(index)}
                    disabled={isCompleting}
                    className={`p-3 rounded-lg text-center transition-all aspect-square flex flex-col justify-center items-center ${
                      getStatusColor(vowelStatus[vowel.id])
                    } ${currentVowel === index ? 'ring-2 ring-blue-400' : ''} ${
                      isCompleting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <div className="text-2xl font-bold">{vowel.vowel}</div>
                    <div className="text-xs opacity-80 truncate">{vowel.difficulty}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl">
              <div className="aspect-video bg-gray-900 flex items-center justify-center">
                <div className="text-center text-white">
                  <Camera size={64} className="mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Vocal: {currentVowelData.vowel} ({currentVowelData.name})</p>
                  <p className="text-sm text-white/60">
                    {isCompleting ? '✅ Completando...' : 
                      isVowelCompleted ? '✅ Dominada' : 
                      isDetecting ? '🔄 Detectando...' : 'Lista para practicar'}
                  </p>
                </div>
              </div>
              
              {isDetecting && !isCompleting && (
                <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold animate-pulse">
                  Detectando...
                </div>
              )}
              {isCompleting && (
                <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  ✅ ¡Correcto!
                </div>
              )}
            </div>

            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <button 
                  onClick={isPlaying ? stopDetection : startDetection}
                  disabled={isVowelCompleted || isCompleting}
                  className={`flex items-center justify-center gap-2 py-4 rounded-xl font-semibold transition-all ${
                    isVowelCompleted || isCompleting ? 'bg-gray-500 cursor-not-allowed' :
                    isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                  } text-white`}
                >
                  {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                  {isVowelCompleted ? 'Completado' : isPlaying ? 'Pausar' : 'Comenzar'}
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
                  onClick={handlePrevVowel}
                  disabled={currentVowel === 0 || isCompleting}
                  className="flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white rounded-xl transition-all"
                >
                  <ArrowLeft size={20} />
                  Anterior
                </button>
                <button 
                  onClick={handleNextVowel}
                  disabled={currentVowel >= vowels.length - 1 || isCompleting}
                  className="flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white rounded-xl transition-all"
                >
                  Siguiente
                  <ArrowLeft size={20} className="rotate-180" />
                </button>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-white mb-2">
                  <span>Precisión: {currentVowelData.vowel}</span>
                  <span>{isVowelCompleted ? '100%' : `${Math.round(accuracy)}%`}</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-blue-400 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${isVowelCompleted ? 100 : accuracy}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Panel derecho */}
          <div className="space-y-6">
            {showImage && (
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <Image size={20} />
                    Referencia Visual de la Vocal
                  </h3>
                  <span className="text-white/60 text-sm">Guía para la seña</span>
                </div>
                <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
                  <img src={currentVowelData.image} alt={`Referencia de la seña para la vocal ${currentVowelData.vowel}`} className="w-full h-full object-cover rounded-lg" />
                </div>
                <div className="mt-3 text-center">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getDifficultyColor(currentVowelData.difficulty)}`}>
                    Dificultad: {currentVowelData.difficulty}
                  </span>
                </div>
              </div>
            )}

            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <div className="text-center mb-6">
                <div className="text-8xl font-bold text-white mb-2">{currentVowelData.vowel}</div>
                <div className="text-2xl text-white/80 mb-3">{currentVowelData.name}</div>
                <div className="flex items-center justify-center gap-4 mb-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getDifficultyColor(currentVowelData.difficulty)}`}>
                    {currentVowelData.difficulty}
                  </span>
                  <span className="text-white/60">
                    {isVowelCompleted ? '✅ Completado' : isCompleting ? '🔄 Completando...' : 'En práctica'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-white font-semibold mb-2">Descripción de la seña:</h3>
                  <p className="text-white/80">{currentVowelData.description}</p>
                </div>
                
                <div>
                  <h3 className="text-white font-semibold mb-2">Uso y ejemplo:</h3>
                  <p className="text-white/80 bg-blue-500/20 p-3 rounded-lg">
                    {currentVowelData.usage}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-white font-semibold mb-2">Consejos para perfeccionar:</h3>
                  <ul className="text-white/80 space-y-1 list-disc list-inside">
                    {currentVowelData.tips.map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <h3 className="text-white font-semibold mb-4">Progreso del Módulo</h3>
              <div className="space-y-3">
                {vowels.map((vowel) => (
                  <div key={vowel.id} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      getStatusColor(vowelStatus[vowel.id])
                    }`}>
                      {vowelStatus[vowel.id] === 'completed' ? (
                        <CheckCircle size={16} />
                      ) : (
                        <span className="text-sm font-bold">{vowel.vowel}</span>
                      )}
                    </div>
                    <span className="flex-1 text-white/80">
                      {vowel.name} - {vowel.difficulty}
                    </span>
                    <span className={`text-sm ${
                      vowelStatus[vowel.id] === 'completed' ? 'text-green-400' : 'text-white/40'
                    }`}>
                      {vowelStatus[vowel.id] === 'completed' ? 'Completado' : 
                        vowelStatus[vowel.id] === 'current' ? 'Practicando' : 'Pendiente'}
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
                  {isCompleting ? 'Completando...' : 'Finalizar Sesión de Vocales'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VocalsDashboard;

