import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Play, Pause, RotateCcw, Volume2, VolumeX, Camera, 
  Target, Clock, Award, CheckCircle, Star, Image,
  BookOpen, Mic, HelpCircle, TrendingUp, Type
} from 'lucide-react';

const AlphabetDashboard = () => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLetter, setCurrentLetter] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isDetecting, setIsDetecting] = useState(false);
  const [sessionScore, setSessionScore] = useState(0);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [completedLetters, setCompletedLetters] = useState([]);
  const [letterStatus, setLetterStatus] = useState({});
  const [isCompleting, setIsCompleting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showImage, setShowImage] = useState(true);
  const [currentGroup, setCurrentGroup] = useState('A-E');

  // Datos del abecedario agrupado por dificultad
  const alphabet = [
    // Grupo 1: Letras básicas (Fácil)
    { 
      id: 1, 
      letter: 'A', 
      name: 'A',
      image: '/images/letra-a.jpg',
      description: 'Mano cerrada con el pulgar al lado de los dedos',
      difficulty: 'Fácil',
      tips: ['Mano en forma de puño', 'Pulgar al costado', 'Mano estable'],
      group: 'A-E',
      phonetic: 'A (como en "casa")'
    },
    { 
      id: 2, 
      letter: 'B', 
      name: 'B',
      image: '/images/letra-b.jpg',
      description: 'Mano abierta con dedos juntos y palma hacia adelante',
      difficulty: 'Fácil',
      tips: ['Dedos rectos y juntos', 'Palma visible', 'Mano plana'],
      group: 'A-E',
      phonetic: 'B (como en "boca")'
    },
    { 
      id: 3, 
      letter: 'C', 
      name: 'C',
      image: '/images/letra-c.jpg',
      description: 'Mano curvada formando una C, dedos ligeramente separados',
      difficulty: 'Fácil',
      tips: ['Forma de C clara', 'Dedos naturalmente curvados', 'Como sosteniendo una pelota'],
      group: 'A-E',
      phonetic: 'C (como en "casa")'
    },
    { 
      id: 4, 
      letter: 'D', 
      name: 'D',
      image: '/images/letra-d.jpg',
      description: 'Dedo índice apuntando hacia arriba, otros dedos cerrados',
      difficulty: 'Medio',
      tips: ['Solo índice extendido', 'Pulgar sobre dedos cerrados', 'Mano firme'],
      group: 'A-E',
      phonetic: 'D (como en "dedo")'
    },
    { 
      id: 5, 
      letter: 'E', 
      name: 'E',
      image: '/images/letra-e.jpg',
      description: 'Mano semi-cerrada con dedos curvados hacia la palma',
      difficulty: 'Medio',
      tips: ['Dedos curvados naturalmente', 'Como agarrando algo pequeño', 'Muñeca relajada'],
      group: 'A-E',
      phonetic: 'E (como en "elefante")'
    },

    // Grupo 2: Letras intermedias (Medio)
    { 
      id: 6, 
      letter: 'F', 
      name: 'F',
      image: '/images/letra-f.jpg',
      description: 'Pulgar e índice formando un círculo, otros dedos extendidos',
      difficulty: 'Medio',
      tips: ['Círculo con pulgar e índice', 'Otros dedos rectos', 'Coordinación precisa'],
      group: 'F-J',
      phonetic: 'F (como en "flor")'
    },
    { 
      id: 7, 
      letter: 'G', 
      name: 'G',
      image: '/images/letra-g.jpg',
      description: 'Dedo índice apuntando hacia la izquierda, mano en posición horizontal',
      difficulty: 'Medio',
      tips: ['Índice apuntando lateralmente', 'Mano horizontal', 'Posición específica'],
      group: 'F-J',
      phonetic: 'G (como en "gato")'
    },
    { 
      id: 8, 
      letter: 'H', 
      name: 'H',
      image: '/images/letra-h.jpg',
      description: 'Dedos índice y medio extendidos y paralelos, apuntando hacia la izquierda',
      difficulty: 'Medio',
      tips: ['Dos dedos paralelos', 'Movimiento lateral', 'Practicar coordinación'],
      group: 'F-J',
      phonetic: 'H (como en "casa" - muda)'
    },
    { 
      id: 9, 
      letter: 'I', 
      name: 'I',
      image: '/images/letra-i.jpg',
      description: 'Dedo meñique extendido, otros dedos cerrados',
      difficulty: 'Difícil',
      tips: ['Solo meñique extendido', 'Pulgar sobre dedos cerrados', 'Mano estable'],
      group: 'F-J',
      phonetic: 'I (como en "isla")'
    },
    { 
      id: 10, 
      letter: 'J', 
      name: 'J',
      image: '/images/letra-j.jpg',
      description: 'Dedo meñique extendido haciendo movimiento de J en el aire',
      difficulty: 'Difícil',
      tips: ['Movimiento de J claro', 'Trazar la letra en el aire', 'Coordinación'],
      group: 'F-J',
      phonetic: 'J (como en "jirafa")'
    },

    // Grupo 3: Letras avanzadas (Difícil)
    { 
      id: 11, 
      letter: 'K', 
      name: 'K',
      image: '/images/letra-k.jpg',
      description: 'Dedos índice y medio formando V, pulgar extendido',
      difficulty: 'Difícil',
      tips: ['Forma de K clara', 'Pulgar específico', 'Practicar lentamente'],
      group: 'K-Ñ',
      phonetic: 'K (como en "koala")'
    },
    { 
      id: 12, 
      letter: 'L', 
      name: 'L',
      image: '/images/letra-l.jpg',
      description: 'Dedos índice y pulgar formando L, otros dedos cerrados',
      difficulty: 'Medio',
      tips: ['Forma de L definida', 'Ángulo de 90 grados', 'Mano estable'],
      group: 'K-Ñ',
      phonetic: 'L (como en "luna")'
    },
    { 
      id: 13, 
      letter: 'M', 
      name: 'M',
      image: '/images/letra-m.jpg',
      description: 'Tres dedos curvados hacia la palma, pulgar fuera',
      difficulty: 'Difícil',
      tips: ['Tres dedos específicos', 'Curvatura precisa', 'Practicar frente al espejo'],
      group: 'K-Ñ',
      phonetic: 'M (como en "mano")'
    },
    { 
      id: 14, 
      letter: 'N', 
      name: 'N',
      image: '/images/letra-n.jpg',
      description: 'Dos dedos curvados hacia la palma, pulgar fuera',
      difficulty: 'Difícil',
      tips: ['Dos dedos curvados', 'Posición específica', 'Coordinación'],
      group: 'K-Ñ',
      phonetic: 'N (como en "nube")'
    },
    { 
      id: 15, 
      letter: 'Ñ', 
      name: 'Ñ',
      image: '/images/letra-ñ.jpg',
      description: 'Mano con movimiento de N seguido de pequeña ondulación',
      difficulty: 'Avanzado',
      tips: ['Movimiento de N primero', 'Ondulación suave', 'Letra específica del español'],
      group: 'K-Ñ',
      phonetic: 'Ñ (como en "niño")'
    },

    // Grupo 4: Letras finales (Medio-Difícil)
    { 
      id: 16, 
      letter: 'O', 
      name: 'O',
      image: '/images/letra-o.jpg',
      description: 'Mano formando círculo perfecto con todos los dedos',
      difficulty: 'Medio',
      tips: ['Círculo bien definido', 'Todos los dedos participan', 'Forma redonda'],
      group: 'O-T',
      phonetic: 'O (como en "oso")'
    },
    { 
      id: 17, 
      letter: 'P', 
      name: 'P',
      image: '/images/letra-p.jpg',
      description: 'Dedo índice extendido hacia abajo, mano en movimiento',
      difficulty: 'Difícil',
      tips: ['Índice hacia abajo', 'Movimiento específico', 'Coordinación'],
      group: 'O-T',
      phonetic: 'P (como en "perro")'
    },
    { 
      id: 18, 
      letter: 'Q', 
      name: 'Q',
      image: '/images/letra-q.jpg',
      description: 'Mano formando círculo con movimiento hacia abajo',
      difficulty: 'Avanzado',
      tips: ['Círculo y movimiento', 'Coordinación compleja', 'Practicar lentamente'],
      group: 'O-T',
      phonetic: 'Q (como en "queso")'
    },
    { 
      id: 19, 
      letter: 'R', 
      name: 'R',
      image: '/images/letra-r.jpg',
      description: 'Dedos cruzados con movimiento específico',
      difficulty: 'Avanzado',
      tips: ['Dedos cruzados', 'Movimiento fluido', 'Letra más difícil'],
      group: 'O-T',
      phonetic: 'R (como en "ratón")'
    },
    { 
      id: 20, 
      letter: 'S', 
      name: 'S',
      image: '/images/letra-s.jpg',
      description: 'Mano cerrada con el pulgar sobre los dedos',
      difficulty: 'Medio',
      tips: ['Mano completamente cerrada', 'Pulgar sobre dedos', 'Puño firme'],
      group: 'O-T',
      phonetic: 'S (como en "sol")'
    },
    { 
      id: 21, 
      letter: 'T', 
      name: 'T',
      image: '/images/letra-t.jpg',
      description: 'Mano cerrada con el pulgar entre índice y medio',
      difficulty: 'Difícil',
      tips: ['Pulgar posición específica', 'Entre índice y medio', 'Practicar posición'],
      group: 'O-T',
      phonetic: 'T (como en "taza")'
    },

    // Grupo 5: Letras finales
    { 
      id: 22, 
      letter: 'U', 
      name: 'U',
      image: '/images/letra-u.jpg',
      description: 'Dedos índice y medio extendidos juntos hacia arriba',
      difficulty: 'Medio',
      tips: ['Dos dedos juntos', 'Extensión completa', 'Mano estable'],
      group: 'U-Z',
      phonetic: 'U (como en "uva")'
    },
    { 
      id: 23, 
      letter: 'V', 
      name: 'V',
      image: '/images/letra-v.jpg',
      description: 'Dedos índice y medio extendidos separados formando V',
      difficulty: 'Medio',
      tips: ['Forma de V clara', 'Dedos separados', 'Ángulo definido'],
      group: 'U-Z',
      phonetic: 'V (como en "vaca")'
    },
    { 
      id: 24, 
      letter: 'W', 
      name: 'W',
      image: '/images/letra-w.jpg',
      description: 'Tres dedos extendidos formando W',
      difficulty: 'Difícil',
      tips: ['Tres dedos específicos', 'Forma de W', 'Coordinación'],
      group: 'U-Z',
      phonetic: 'W (como en "water" - extranjerismo)'
    },
    { 
      id: 25, 
      letter: 'X', 
      name: 'X',
      image: '/images/letra-x.jpg',
      description: 'Dedos índice cruzados formando X',
      difficulty: 'Difícil',
      tips: ['Dedos cruzados', 'Forma de X', 'Posición específica'],
      group: 'U-Z',
      phonetic: 'X (como en "xilófono")'
    },
    { 
      id: 26, 
      letter: 'Y', 
      name: 'Y',
      image: '/images/letra-y.jpg',
      description: 'Dedo meñique y pulgar extendidos, otros cerrados',
      difficulty: 'Medio',
      tips: ['Meñique y pulgar', 'Forma de Y', 'Mano estable'],
      group: 'U-Z',
      phonetic: 'Y (como en "yoyo")'
    },
    { 
      id: 27, 
      letter: 'Z', 
      name: 'Z',
      image: '/images/letra-z.jpg',
      description: 'Dedo índice trazando Z en el aire',
      difficulty: 'Difícil',
      tips: ['Movimiento de Z', 'Trazar en el aire', 'Coordinación'],
      group: 'U-Z',
      phonetic: 'Z (como en "zapato")'
    }
  ];

  // Filtrar letras por grupo
  const filteredLetters = alphabet.filter(letter => letter.group === currentGroup);
  const currentLetterIndex = alphabet.findIndex(letter => letter.id === filteredLetters[currentLetter]?.id);

  // Inicializar estado de las letras
  useEffect(() => {
    const initialStatus = {};
    alphabet.forEach(letter => {
      initialStatus[letter.id] = 'pending';
    });
    setLetterStatus(initialStatus);
    setLetterStatus(prev => ({ ...prev, [filteredLetters[0]?.id]: 'current' }));
  }, [currentGroup]);

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
    const welcomeMessage = "Bienvenido al módulo del abecedario. Aquí aprenderás las señas para todas las letras del alfabeto español, agrupadas por dificultad. Comenzaremos con la letra A.";
    
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

    const currentLetterData = filteredLetters[currentLetter];
    if (!currentLetterData) return;
    
    // Si ya está completada, no hacer nada
    if (completedLetters.includes(currentLetterData.id)) return;

    // Velocidad de aprendizaje según dificultad
    const difficultyFactors = {
      'Fácil': { learning: 20, threshold: 80 },
      'Medio': { learning: 16, threshold: 85 },
      'Difícil': { learning: 14, threshold: 88 },
      'Avanzado': { learning: 12, threshold: 90 }
    };
    
    const factor = difficultyFactors[currentLetterData.difficulty] || { learning: 16, threshold: 85 };
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
        const basePoints = currentLetterData.difficulty === 'Fácil' ? 15 : 
                          currentLetterData.difficulty === 'Medio' ? 20 : 
                          currentLetterData.difficulty === 'Difícil' ? 25 : 30;
        const streakBonus = correctStreak * 5;
        const timeBonus = Math.max(0, 12 - Math.floor(timeElapsed / 15));
        const totalPoints = basePoints + streakBonus + timeBonus;
        
        // Actualizar estados una sola vez
        setSessionScore(prev => prev + totalPoints);
        setCorrectStreak(prev => {
          const newStreak = prev + 1;
          if (newStreak > bestStreak) setBestStreak(newStreak);
          return newStreak;
        });
        
        setCompletedLetters(prev => [...prev, currentLetterData.id]);
        setLetterStatus(prev => ({
          ...prev,
          [currentLetterData.id]: 'completed'
        }));

        // Mensaje una sola vez
        speak(`¡Excelente! Letra ${currentLetterData.letter} dominada. +${totalPoints} puntos.`);
        
        // Preparar para siguiente letra después de un delay
        setTimeout(() => {
          if (currentLetter < filteredLetters.length - 1) {
            setLetterStatus(prev => ({
              ...prev,
              [filteredLetters[currentLetter + 1].id]: 'current'
            }));
            setCurrentLetter(prev => prev + 1);
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
      speak("Precisión baja. Corrige la posición de la mano.");
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
  }, [isDetecting, accuracy, correctStreak, currentLetter, isCompleting, completedLetters, filteredLetters]);

  const startDetection = () => {
    if (!filteredLetters[currentLetter] || completedLetters.includes(filteredLetters[currentLetter].id) || isCompleting) return;
    
    setIsDetecting(true);
    setIsPlaying(true);
    setAccuracy(0);
    setTimeElapsed(0);
    
    const currentLetterData = filteredLetters[currentLetter];
    speak(`Practicando letra: ${currentLetterData.letter}. Pronunciación: ${currentLetterData.phonetic}. Mira la imagen de referencia.`);
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
    speak("Práctica reiniciada para esta letra.");
  };

  const handleNextLetter = () => {
    if (currentLetter < filteredLetters.length - 1 && !isCompleting) {
      setLetterStatus(prev => ({
        ...prev,
        [filteredLetters[currentLetter].id]: completedLetters.includes(filteredLetters[currentLetter].id) ? 'completed' : 'pending',
        [filteredLetters[currentLetter + 1].id]: 'current'
      }));

      setCurrentLetter(prev => prev + 1);
      setAccuracy(0);
      setTimeElapsed(0);
      setIsDetecting(false);
      setIsPlaying(false);
      
      const nextLetter = filteredLetters[currentLetter + 1];
      speak(`Siguiente letra: ${nextLetter.letter}. Pronunciación: ${nextLetter.phonetic}.`);
    }
  };

  const handlePrevLetter = () => {
    if (currentLetter > 0 && !isCompleting) {
      setLetterStatus(prev => ({
        ...prev,
        [filteredLetters[currentLetter].id]: 'pending',
        [filteredLetters[currentLetter - 1].id]: 'current'
      }));

      setCurrentLetter(prev => prev - 1);
      setAccuracy(0);
      setTimeElapsed(0);
      setIsDetecting(false);
      setIsPlaying(false);
      
      const prevLetter = filteredLetters[currentLetter - 1];
      speak(`Volviendo a la letra: ${prevLetter.letter}. Pronunciación: ${prevLetter.phonetic}.`);
    }
  };

  const selectLetter = (index) => {
    if (isCompleting) return;
    
    setLetterStatus(prev => {
      const newStatus = { ...prev };
      // Reset all letters in current group to pending
      filteredLetters.forEach(letter => {
        newStatus[letter.id] = 'pending';
      });
      newStatus[filteredLetters[index].id] = 'current';
      return newStatus;
    });

    setCurrentLetter(index);
    setAccuracy(0);
    setTimeElapsed(0);
    setIsDetecting(false);
    setIsPlaying(false);
    
    const selectedLetter = filteredLetters[index];
    speak(`Letra ${selectedLetter.letter} seleccionada. Pronunciación: ${selectedLetter.phonetic}.`);
  };

  const changeGroup = (group) => {
    setCurrentGroup(group);
    setCurrentLetter(0);
    setAccuracy(0);
    setTimeElapsed(0);
    setIsDetecting(false);
    setIsPlaying(false);
    
    const firstLetter = alphabet.find(letter => letter.group === group);
    speak(`Cambiando al grupo ${group}. Comenzando con la letra ${firstLetter?.letter}.`);
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
    const totalPossible = alphabet.length * 25;
    const percentage = Math.round((sessionScore / totalPossible) * 100);
    speak(`Sesión finalizada. Aprendiste ${completedLetters.length} letras del abecedario. Puntos: ${sessionScore}. ¡Excelente trabajo!`);
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
      case 'Avanzado': return 'text-purple-400 border-purple-400';
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

  const currentLetterData = filteredLetters[currentLetter];
  const isLetterCompleted = currentLetterData ? completedLetters.includes(currentLetterData.id) : false;

  // Grupos disponibles
  const groups = ['A-E', 'F-J', 'K-Ñ', 'O-T', 'U-Z'];

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
              <h1 className="text-2xl font-bold text-white">Módulo del Abecedario</h1>
              <p className="text-white/60">
                {isCompleting ? 'Completando letra...' : 'Aprende señas para todas las letras del alfabeto'}
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
              onClick={() => currentLetterData && speak(
                `Letra ${currentLetterData.letter}. Pronunciación: ${currentLetterData.phonetic}. ${isLetterCompleted ? 'Completada' : 'Precisión: ' + accuracy + '%'}. Puntos: ${sessionScore}.`
              )}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 transition-colors"
              disabled={isCompleting || isMuted || !currentLetterData}
            >
              <Type size={20} />
              Estado
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8">
          {/* Panel izquierdo */}
          <div className="space-y-6">
            {/* Selector de grupos */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
              <h3 className="text-white font-semibold mb-3">Grupos del Abecedario</h3>
              <div className="grid grid-cols-5 gap-2">
                {groups.map((group) => (
                  <button
                    key={group}
                    onClick={() => changeGroup(group)}
                    disabled={isCompleting}
                    className={`p-3 rounded-lg text-center transition-all ${
                      currentGroup === group ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'
                    } ${isCompleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="text-sm font-bold">{group}</div>
                    <div className="text-xs opacity-80">
                      {alphabet.filter(l => l.group === group).length} letras
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Selector de letras */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
              <h3 className="text-white font-semibold mb-3">Letras del Grupo {currentGroup}</h3>
              <div className="grid grid-cols-6 gap-2">
                {filteredLetters.map((letter, index) => (
                  <button
                    key={letter.id}
                    onClick={() => selectLetter(index)}
                    disabled={isCompleting}
                    className={`p-2 rounded-lg text-center transition-all ${
                      getStatusColor(letterStatus[letter.id])
                    } ${currentLetter === index ? 'ring-2 ring-blue-400' : ''} ${
                      isCompleting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <div className="text-lg font-bold">{letter.letter}</div>
                    <div className="text-xs opacity-80">{letter.difficulty.charAt(0)}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Cámara */}
            <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl">
              <div className="aspect-video bg-gray-900 flex items-center justify-center">
                <div className="text-center text-white">
                  <Camera size={64} className="mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Letra: {currentLetterData?.letter || 'Selecciona una letra'}</p>
                  <p className="text-sm text-white/60">
                    {isCompleting ? '✅ Completando...' : 
                     isLetterCompleted ? '✅ Dominada' : 
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
                  disabled={!currentLetterData || isLetterCompleted || isCompleting}
                  className={`flex items-center justify-center gap-2 py-4 rounded-xl font-semibold transition-all ${
                    !currentLetterData || isLetterCompleted || isCompleting ? 'bg-gray-500 cursor-not-allowed' :
                    isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                  } text-white`}
                >
                  {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                  {!currentLetterData ? 'Selecciona letra' : isLetterCompleted ? 'Completada' : isPlaying ? 'Pausar' : 'Comenzar'}
                </button>
                
                <button 
                  onClick={resetPractice}
                  disabled={isCompleting || !currentLetterData}
                  className="flex items-center justify-center gap-2 py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-500 text-white rounded-xl font-semibold transition-all disabled:cursor-not-allowed"
                >
                  <RotateCcw size={24} />
                  Reiniciar
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={handlePrevLetter}
                  disabled={currentLetter === 0 || isCompleting || !currentLetterData}
                  className="flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white rounded-xl transition-all"
                >
                  <ArrowLeft size={20} />
                  Anterior
                </button>
                <button 
                  onClick={handleNextLetter}
                  disabled={currentLetter >= filteredLetters.length - 1 || isCompleting || !currentLetterData}
                  className="flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white rounded-xl transition-all"
                >
                  Siguiente
                  <ArrowLeft size={20} className="rotate-180" />
                </button>
              </div>

              {/* Barra de progreso */}
              <div className="mt-4">
                <div className="flex justify-between text-white mb-2">
                  <span>Progreso: {currentLetterData?.letter || '-'}</span>
                  <span>{isLetterCompleted ? '100%' : `${accuracy}%`}</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-blue-400 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${isLetterCompleted ? 100 : accuracy}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Sistema de puntos específico para abecedario */}
            <div className="bg-blue-500/20 rounded-2xl p-4 border border-blue-400/30">
              <h4 className="text-blue-300 font-semibold mb-2">🔤 Sistema de Puntos - Abecedario</h4>
              <div className="text-blue-200 text-sm space-y-1">
                <div>• <strong>Fácil (A-C):</strong> 15 puntos + bonus</div>
                <div>• <strong>Medio (D, F-H, etc.):</strong> 20 puntos + bonus</div>
                <div>• <strong>Difícil (I, K, M, etc.):</strong> 25 puntos + bonus</div>
                <div>• <strong>Avanzado (Ñ, Q, R):</strong> 30 puntos + bonus</div>
                <div>• <strong>Bonus alfabético:</strong> +2 puntos por letra consecutiva</div>
              </div>
            </div>
          </div>

          {/* Panel derecho */}
          <div className="space-y-6">
            {/* Imagen de referencia */}
            {showImage && currentLetterData && (
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <Image size={20} />
                    Referencia Visual de la Letra
                  </h3>
                  <span className="text-white/60 text-sm">Guía para la seña alfabética</span>
                </div>
                <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-8xl font-bold mb-2">{currentLetterData.letter}</div>
                    <div className="text-2xl mb-2">{currentLetterData.phonetic}</div>
                    <div className="text-white/60">Imagen de referencia de la seña</div>
                    <div className="mt-2 text-sm text-blue-300">
                      {currentLetterData.description}
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getDifficultyColor(currentLetterData.difficulty)}`}>
                    Dificultad: {currentLetterData.difficulty}
                  </span>
                </div>
              </div>
            )}

            {/* Información de la letra */}
            {currentLetterData ? (
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <div className="text-center mb-6">
                  <div className="text-8xl font-bold text-white mb-2">{currentLetterData.letter}</div>
                  <div className="text-2xl text-white/80 mb-3">{currentLetterData.phonetic}</div>
                  <div className="flex items-center justify-center gap-4 mb-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getDifficultyColor(currentLetterData.difficulty)}`}>
                      {currentLetterData.difficulty}
                    </span>
                    <span className="text-white/60">
                      {isLetterCompleted ? '✅ Completada' : isCompleting ? '🔄 Completando...' : 'En práctica'}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-white font-semibold mb-2">Seña correcta:</h3>
                    <p className="text-white/80">{currentLetterData.description}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-white font-semibold mb-2">Pronunciación:</h3>
                    <p className="text-white/80 bg-green-500/20 p-3 rounded-lg">
                      {currentLetterData.phonetic}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-white font-semibold mb-2">Consejos para la mano:</h3>
                    <ul className="text-white/80 space-y-1">
                      {currentLetterData.tips.map((tip, index) => (
                        <li key={index}>• {tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <div className="text-center text-white/60">
                  <Type size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Selecciona una letra para comenzar</p>
                  <p className="text-sm">Elige una letra del grupo {currentGroup} para ver su información</p>
                </div>
              </div>
            )}

            {/* Progreso del módulo */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <h3 className="text-white font-semibold mb-4">Progreso General del Abecedario</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {alphabet.map((letter, index) => (
                  <div key={letter.id} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      getStatusColor(letterStatus[letter.id])
                    }`}>
                      {letterStatus[letter.id] === 'completed' ? (
                        <CheckCircle size={16} />
                      ) : (
                        <span className="text-sm font-bold">{letter.letter}</span>
                      )}
                    </div>
                    <span className="flex-1 text-white/80">
                      {letter.letter} - {letter.group}
                    </span>
                    <span className={`text-sm ${
                      letterStatus[letter.id] === 'completed' ? 'text-green-400' : 'text-white/40'
                    }`}>
                      {letterStatus[letter.id] === 'completed' ? 'Completada' : 
                       letterStatus[letter.id] === 'current' ? 'Practicando' : 'Pendiente'}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-white/20">
                <div className="flex justify-between text-white/60 text-sm mb-2">
                  <span>Progreso total:</span>
                  <span>{completedLetters.length} de {alphabet.length} letras</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2 mb-4">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full transition-all"
                    style={{ width: `${(completedLetters.length / alphabet.length) * 100}%` }}
                  ></div>
                </div>
                
                <button 
                  onClick={handleCompleteSession}
                  disabled={isCompleting}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 disabled:from-gray-500 disabled:to-gray-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:cursor-not-allowed"
                >
                  {isCompleting ? 'Completando...' : 'Finalizar Sesión del Abecedario'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlphabetDashboard;