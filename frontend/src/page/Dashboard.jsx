import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/dashboard/Header';
import PhaseSelector from '../components/dashboard/PhaseSelector';
import ModuleCard from '../components/dashboard/ModuleCard';
import Footer from '../components/dashboard/Footer';
import { 
  BookText, MessageSquare, Hash, Calculator, BookOpen, Plus,
  TrendingUp, Clock, Award, MessageCircle, Bot, PlayCircle,
  BrainCircuit, Mic
} from 'lucide-react';

// ... (los modulesData se mantienen igual)
// Datos de ejemplo mejorados
const modulesData = [
  {
    id: 1,
    icon: BookText,
    title: 'Vocales',
    elements: '5 elementos',
    status: 'Completado',
    isLearnEnabled: true,
    progress: 100,
    timeSpent: '45 min',
    lastPractice: '2024-01-15',
    accuracy: 95,
    color: 'from-green-500 to-blue-500'
  },
  {
    id: 2,
    icon: MessageSquare,
    title: 'Palabras',
    elements: '25 elementos',
    status: 'En progreso',
    isLearnEnabled: true,
    progress: 60,
    timeSpent: '1h 20min',
    lastPractice: '2024-01-14',
    accuracy: 88,
    color: 'from-blue-500 to-purple-500'
  },
  {
    id: 3,
    icon: Hash,
    title: 'Números',
    elements: '10 elementos',
    status: 'Completado',
    isLearnEnabled: true,
    progress: 100,
    timeSpent: '30 min',
    lastPractice: '2024-01-13',
    accuracy: 92,
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 4,
    icon: Calculator,
    title: 'Signos Matemáticos',
    elements: '4 elementos',
    status: 'Pendiente',
    isLearnEnabled: true,
    progress: 30,
    timeSpent: '0 min',
    lastPractice: '-',
    accuracy: 0,
    color: 'from-pink-500 to-red-500'
  },
  {
    id: 5,
    icon: BookOpen,
    title: 'Abecedario',
    elements: '26 elementos',
    status: 'En progreso',
    isLearnEnabled: true,
    progress: 40,
    timeSpent: '2h 15min',
    lastPractice: '2024-01-14',
    accuracy: 85,
    color: 'from-red-500 to-orange-500'
  },
  {
    id: 6,
    icon: Plus,
    title: 'Operaciones',
    elements: '8 elementos',
    status: 'Pendiente',
    isLearnEnabled: true,
    progress: 60,
    timeSpent: '0 min',
    lastPractice: '-',
    accuracy: 0,
    color: 'from-orange-500 to-yellow-500'
  }
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [activePhase, setActivePhase] = useState('all');
  const [userStats, setUserStats] = useState({
    totalModules: 6,
    completedModules: 2,
    totalTime: '4h 50min',
    averageAccuracy: 89,
    streak: 7,
    totalPractice: '24 sesiones'
  });
  const [chatMessage, setChatMessage] = useState('');
  const [particles, setParticles] = useState([]);

  // Función para hablar (Text-to-Speech)
  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Cancelar cualquier speech anterior
      const speech = new SpeechSynthesisUtterance(text);
      speech.lang = 'es-ES';
      speech.rate = 0.9;
      speech.volume = 0.8;
      window.speechSynthesis.speak(speech);
    }
  };

  // Mensaje de bienvenida al cargar el dashboard
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const userName = userData.name || 'Estudiante';
    const welcomeMessage = `¡Bienvenido ${userName} al dashboard! Tienes ${userStats.completedModules} módulos completados de ${userStats.totalModules}. Tu precisión promedio es del ${userStats.averageAccuracy}%. ¿En qué módulo te gustaría practicar hoy?`;

    const timer = setTimeout(() => {
      speak(welcomeMessage);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Partículas flotantes para el fondo
  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 10 + 5
    }));
    setParticles(newParticles);
  }, []);

  const filteredModules = modulesData.filter(module => {
    if (activePhase === 'all') return true;
    if (activePhase === 'completed') return module.status === 'Completado';
    if (activePhase === 'progress') return module.status === 'En progreso';
    if (activePhase === 'pending') return module.status === 'Pendiente';
    return true;
  });

  const handleModuleClick = (moduleId) => {
    const module = modulesData.find(m => m.id === moduleId);
    if (module.isLearnEnabled) {
      // Mensaje de voz según el progreso del módulo
      let message = '';
      if (module.progress === 0) {
        message = `Comenzando módulo de ${module.title}. ¡Vamos a aprender!`;
      } else if (module.progress === 100) {
        message = `Repasando módulo de ${module.title}. ¡Excelente trabajo completado!`;
      } else {
        message = `Continuando con ${module.title}. Llevas el ${module.progress}% completado.`;
      }
      speak(message);

      const routeMap = {
        1: '/vocals',
        2: '/words',
        3: '/numeros',
        4: '/math-signs',
        5: '/alphabet',
        6: '/operations'
      };
      navigate(routeMap[moduleId]);
    }
  };

  const handleAssistantClick = () => {
    speak("¡Hola! Soy tu asistente de aprendizaje. Puedo explicarte los módulos disponibles, tu progreso actual o ayudarte a elegir qué practicar. ¿En qué te puedo ayudar?");
  };

  const handleContinueLearning = () => {
    // Encontrar el módulo en progreso o el primero pendiente
    const nextModule = modulesData.find(m => m.status === 'En progreso') || 
                      modulesData.find(m => m.status === 'Pendiente' && m.isLearnEnabled);
    if (nextModule) {
      speak(`Continuando con ${nextModule.title}. ${nextModule.progress > 0 ? `Llevas el ${nextModule.progress}% completado.` : '¡Vamos a comenzar!'}`);
      handleModuleClick(nextModule.id);
    } else {
      speak("¡Felicidades! Has completado todos los módulos disponibles. Pronto agregaremos más contenido.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex flex-col relative overflow-hidden">
      {/* Fondo idéntico al login/landing */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Partículas flotantes */}
        {particles.map(particle => (
          <div
            key={particle.id}
            className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-30 animate-float"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDuration: `${particle.duration}s`,
              animationDelay: `${particle.id * 0.5}s`
            }}
          />
        ))}

        {/* Formas geométricas animadas */}
        <div className="absolute top-1/4 -left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        
        {/* Efecto de grid sutil */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />

        {/* Olas animadas en la parte inferior */}
        <div className="absolute bottom-0 left-0 w-full h-32">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="absolute bottom-0 w-full h-full">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" className="fill-blue-600"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" className="fill-purple-600"></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" className="fill-indigo-600"></path>
          </svg>
        </div>
      </div>

      <div className="relative z-10 flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <Header />
          
          {/* Hero Principal SIN robot que sigue mouse */}
          <section className="text-center mb-12 py-12">
            {/* Icono del agente IA en lugar del robot que sigue mouse */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6 rounded-3xl shadow-2xl">
                  <BrainCircuit className="text-white" size={48} />
                </div>
                <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
                  <Mic size={16} className="text-white" />
                </div>
              </div>
            </div>
            
            <h1 className="text-6xl font-bold text-white mb-6">
              ¡Hola, <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Ana</span>!
            </h1>
            
            <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto leading-relaxed">
              Bienvenida a tu centro de aprendizaje inteligente. Tu asistente IA te guiará en cada paso.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={handleContinueLearning}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-blue-500/25 hover:scale-105 transition-all duration-300 flex items-center gap-3"
              >
                <PlayCircle size={24} />
                Continuar Aprendiendo
              </button>
              <button 
                onClick={handleAssistantClick}
                className="border-2 border-white/30 text-white px-8 py-4 rounded-2xl font-bold hover:bg-white/10 backdrop-blur-sm transition-all duration-300 flex items-center gap-3"
              >
                <Bot size={24} />
                Asistente IA
              </button>
            </div>
          </section>

          {/* Chat de bienvenida */}
          <div className="mb-8 animate-fade-in">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-2xl">
                  <MessageCircle className="text-white" size={28} />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium text-lg">
                    Tu asistente IA está listo para ayudarte. Haz clic en "Asistente IA" para hablar conmigo.
                  </p>
                  <div className="flex gap-4 mt-3">
                    <button 
                      onClick={handleAssistantClick}
                      className="text-blue-300 font-medium hover:text-blue-200 transition-colors flex items-center gap-2"
                    >
                      <Bot size={16} />
                      Hablar con el Asistente
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ... (el resto del código se mantiene igual: estadísticas, módulos, etc.) */}
          {/* Estadísticas principales */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { 
                icon: Award, 
                value: `${userStats.completedModules}/${userStats.totalModules}`, 
                label: 'Módulos completados',
                color: 'from-green-500 to-emerald-500'
              },
              { 
                icon: Clock, 
                value: userStats.totalTime, 
                label: 'Tiempo total',
                color: 'from-blue-500 to-cyan-500'
              },
              { 
                icon: TrendingUp, 
                value: `${userStats.averageAccuracy}%`, 
                label: 'Precisión promedio',
                color: 'from-purple-500 to-pink-500'
              },
              { 
                icon: BrainCircuit, 
                value: `${userStats.streak} días`, 
                label: 'Racha actual',
                color: 'from-orange-500 to-red-500'
              }
            ].map((stat, index) => (
              <div 
                key={index}
                className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl bg-gradient-to-r ${stat.color}`}>
                    <stat.icon className="text-white" size={28} />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                    <p className="text-white/60">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <main className="animate-fade-in-up">
            <PhaseSelector 
              activePhase={activePhase}
              onPhaseChange={setActivePhase}
            />
            
            {/* Módulos de aprendizaje */}
            <div className="mt-12">
              <div className="text-center mb-12">
                <h2 className="text-5xl font-bold text-white mb-4">
                  Módulos de Aprendizaje
                </h2>
                <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
                  Domina el lenguaje de señas paso a paso. Cada módulo utiliza IA avanzada 
                  para ofrecerte una experiencia de aprendizaje personalizada y efectiva.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredModules.map((module, index) => (
                  <div 
                    key={module.id} 
                    className="animate-fade-in-up hover-lift group cursor-pointer"
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={() => handleModuleClick(module.id)}
                  >
                    <ModuleCard
                      icon={module.icon}
                      title={module.title}
                      elements={module.elements}
                      status={module.status}
                      isLearnEnabled={module.isLearnEnabled}
                      progress={module.progress}
                      timeSpent={module.timeSpent}
                      lastPractice={module.lastPractice}
                      accuracy={module.accuracy}
                      color={module.color}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Progreso reciente */}
            <div className="mt-16 bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-3xl font-bold text-white mb-2">Progreso Reciente</h3>
                  <p className="text-white/60">Resumen de tus actividades de aprendizaje</p>
                </div>
                <button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-2xl font-semibold hover:shadow-lg transition-all">
                  Ver historial completo
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modulesData.filter(m => m.lastPractice !== '-').slice(0, 3).map(module => (
                  <div key={module.id} className="bg-white/5 rounded-2xl p-6 border border-white/10">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${module.color}`}>
                        <module.icon size={24} className="text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-white">{module.title}</p>
                        <p className="text-sm text-white/60">{module.lastPractice}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-2xl font-bold text-white">{module.accuracy}%</p>
                        <p className="text-sm text-white/60">Precisión</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-white">{module.timeSpent}</p>
                        <p className="text-sm text-white/60">Duración</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
          
          <Footer />
        </div>
      </div>

      {/* Estilos CSS para animaciones */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .hover-lift:hover {
          transform: translateY(-8px);
        }
        
        .shadow-3xl {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
      `}</style>
    </div>
  );
};

export default Dashboard;