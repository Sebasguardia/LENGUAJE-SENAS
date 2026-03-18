import React, { useState, useEffect, useRef } from 'react';
import {
    Bot, MessageCircle, X, ChevronRight,
    Sparkles, HelpCircle, Target, Trophy,
    BookOpen, Send, Minus, User, ArrowLeft,
    Lightbulb, Info
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ChatWidget = ({ userStats, currentUser, allModules = [], onSpeak, isMuted }) => {
    const { theme } = useTheme();
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [currentMenu, setCurrentMenu] = useState('main'); // 'main', 'progress', 'faq', 'tips'
    const scrollRef = useRef(null);
    const hasWelcomedRef = useRef(false);

    // Saludo inicial personalizado único
    useEffect(() => {
        if (isChatOpen && !hasWelcomedRef.current && currentUser) {
            const userName = currentUser.full_name
                ? currentUser.full_name.split(' ')[0]
                : (currentUser.name || 'Estudiante');

            const initialMsg = {
                type: 'bot',
                message: `¡Hola ${userName}! 👋 Soy Lexa. ¿En qué puedo ayudarte hoy?`,
                timestamp: new Date()
            };
            setMessages([initialMsg]);

            if (onSpeak && !isMuted) {
                onSpeak(initialMsg.message);
            }
            hasWelcomedRef.current = true;
        }
    }, [isChatOpen, currentUser, onSpeak, isMuted]);

    // Auto-scroll al fondo
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, currentMenu]);

    // Estructura de navegación y respuestas
    const menuOptions = {
        main: [
            { id: 'progress', label: 'Mi Progreso y Estadísticas', icon: Target, nextMenu: 'progress_menu' },
            { id: 'modules', label: 'Explorar Módulos del Curso', icon: BookOpen, nextMenu: 'modules_menu' },
            { id: 'tips', label: 'Consejos de Aprendizaje', icon: Lightbulb, nextMenu: 'tips_menu' },
            { id: 'curiosities', label: '¿Sabías que...?', icon: Sparkles, action: 'show_curiosity' },
            { id: 'motivation', label: 'Motivación del día', icon: Trophy, action: 'show_motivation' },
            { id: 'platform', label: 'Uso de la Plataforma', icon: HelpCircle, action: 'explain_platform' }
        ],
        modules_menu: [
            ...(allModules.length > 0
                ? allModules.map(m => ({
                    id: `mod_${m.id}`,
                    label: `Módulo: ${m.title}`,
                    action: `info_mod_${m.id}`
                }))
                : [{ id: 'no_mods', label: 'Cargando módulos...', action: 'wait_mods' }]),
            { id: 'back', label: 'Volver', icon: ArrowLeft, nextMenu: 'main', style: 'secondary' }
        ],
        progress_menu: [
            { id: 'my_stats', label: '¿Cómo voy en el curso?', action: 'report_progress' },
            { id: 'ranking', label: '¿Cuál es mi puesto?', action: 'report_ranking' },
            { id: 'xp_info', label: '¿Cómo gano más XP?', action: 'explain_xp' },
            { id: 'back', label: 'Volver al Menú Principal', icon: ArrowLeft, nextMenu: 'main', style: 'secondary' }
        ],
        tips_menu: [
            { id: 'camera_tip', label: 'Mejorar detección de cámara', action: 'tip_camera' },
            { id: 'study_tip', label: 'Rutina de estudio recomendada', action: 'tip_study' },
            { id: 'signs_tip', label: 'Señas difíciles', action: 'tip_signs' },
            { id: 'back', label: 'Volver al Menú Principal', icon: ArrowLeft, nextMenu: 'main', style: 'secondary' }
        ]
    };

    const handleOptionClick = (option) => {
        // 1. Agregar mensaje del usuario
        const userMsg = {
            type: 'user',
            message: option.label,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMsg]);

        // 2. Procesar acción o navegación
        setTimeout(() => {
            if (option.nextMenu) {
                setCurrentMenu(option.nextMenu);
                // Respuesta de transición opcional
                /*
               addBotMessage(
                   option.id === 'back' 
                   ? "Menú principal. ¿Algo más?" 
                   : `Claro, hablemos sobre ${option.label.toLowerCase()}. Selecciona una opción:`
               );
               */
            } else if (option.action) {
                const response = getBotResponse(option.action);
                addBotMessage(response);
            }
        }, 500);
    };

    const addBotMessage = (text) => {
        const botMsg = {
            type: 'bot',
            message: text,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, botMsg]);
        if (onSpeak && !isMuted) {
            onSpeak(text);
        }
    };

    const getBotResponse = (actionId) => {
        switch (actionId) {
            case 'explain_about':
                return "Somos 'SeñasIA', una plataforma educativa impulsada por inteligencia artificial diseñada para democratizar el aprendizaje del lenguaje de señas peruano, haciéndolo accesible, interactivo y gratuito para todos.";
            case 'explain_platform':
                return "Es muy sencillo: Elige un módulo (como Vocales), permite el acceso a tu cámara y repite las señas que ves en pantalla. Nuestra IA evaluará tus movimientos en tiempo real y te dará feedback instantáneo.";

            // Stats
            case 'report_progress':
                const completed = userStats?.completedModules || 0;
                const total = userStats?.totalModules || 6;
                if (completed === 0) return "Aún no has completado módulos, pero todo viaje empieza con un primer paso. ¡Prueba el módulo de Vocales!";
                return `Llevas ${completed} de ${total} módulos completados. ¡Tu precisión promedio es del ${userStats?.averageAccuracy || 0}%! Estás haciendo un gran trabajo.`;
            case 'report_ranking':
                return `Actualmente estás en el puesto #${userStats?.rank || 99}. ¡Mantén tu racha diaria para subir posiciones y alcanzar el Top 3!`;
            case 'explain_xp':
                return "Ganas Puntos de Experiencia (XP) completando lecciones con alta precisión (>90%) y manteniendo tu racha diaria. ¡A mayor precisión, más XP!";

            // Tips
            case 'tip_camera':
                return "Para una mejor detección: 1) Asegúrate de tener buena luz frente a ti, no detrás. 2) Mantén tu mano dentro del cuadro central. 3) Usa un fondo liso si es posible.";
            case 'tip_study':
                return "La consistencia vence a la intensidad. Es mejor practicar 10 minutos todos los días que 2 horas una vez a la semana. ¡Tu cerebro retendrá mejor las señas!";
            case 'tip_signs':
                return "Si una seña es difícil, usa el botón de 'Cámara Lenta' en la lección para ver el movimiento paso a paso. También puedes ver tu propia grabación para comparar.";

            // New Interactions
            case 'show_curiosity':
                const curiosities = [
                    "El lenguaje de señas no es universal. Cada país tiene el suyo propio, ¡es fascinante!",
                    "Las expresiones faciales son tan importantes como el movimiento de las manos.",
                    "¡El lenguaje de señas tiene su propia gramática, diferente al español hablado!",
                    "En el Perú usamos el LSP (Lengua de Señas Peruana)."
                ];
                return curiosities[Math.floor(Math.random() * curiosities.length)];
            case 'show_motivation':
                const quotes = [
                    "La paciencia y la práctica son las llaves del aprendizaje. ¡Vas muy bien!",
                    "Cada seña que aprendes es un puente más hacia la inclusión.",
                    "No te preocupes por la velocidad, sino por la precisión. ¡Sigue así!",
                    "¡Tu esfuerzo hoy permitirá una comunicación sin barreras mañana!"
                ];
                return quotes[Math.floor(Math.random() * quotes.length)];

            // Logic for Dynamic Module Info
            default:
                if (actionId.startsWith('info_mod_')) {
                    const modId = actionId.replace('info_mod_', '');
                    const mod = allModules.find(m => m.id == modId);

                    if (!mod) {
                        return "No encuentro los detalles de ese módulo ahora, intenta nuevamente.";
                    }

                    let modStatus = mod.is_locked
                        ? "🔒 Bloqueado (falta contenido)"
                        : "✅ Disponible";

                    if (mod.progress >= 100) modStatus = "🏆 Completado al 100%";
                    else if (mod.progress > 0) modStatus = `⏳ En progreso (${mod.progress}%)`;

                    return `El módulo "${mod.title}" es de dificultad ${mod.difficulty}. Tiene ${mod.elementsCount} elementos para aprender y dura aprox. ${mod.duration}. Estado actual: ${modStatus}.`;
                }

                return "Entendido. ¿Hay algo más en lo que pueda apoyarte?";
                        
                    }
    };

    return (
        <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-[200] flex flex-col items-end gap-4 sm:gap-5 font-sans">

            {/* Ventana de Chat */}
            {isChatOpen && (
                <div className="w-[calc(100vw-2rem)] sm:w-[400px] h-[70vh] sm:h-[600px] max-h-[600px] dark:bg-[#0a0c10]/95 bg-white backdrop-blur-2xl border dark:border-white/10 border-slate-200 rounded-[2.5rem] shadow-[0_20px_80px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_80px_rgba(0,0,0,0.6)] overflow-hidden animate-in slide-in-from-bottom-12 fade-in duration-300 flex flex-col">

                    {/* Header Sticky */}
                    <div className="shrink-0 p-5 bg-gradient-to-r dark:from-blue-900/40 dark:to-indigo-900/40 from-blue-50 to-indigo-50 dark:border-b dark:border-white/5 border-b border-slate-100 flex items-center justify-between backdrop-blur-md">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                                    <Bot size={20} />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 dark:border-slate-900 border-white rounded-full animate-pulse"></div>
                            </div>
                            <div>
                                <h3 className="dark:text-white text-slate-900 font-bold text-sm transition-colors">Lexa IA</h3>
                                <p className="dark:text-blue-300 text-blue-600 text-[10px] font-bold uppercase tracking-wider transition-colors">Asistente Virtual</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsChatOpen(false)}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:dark:bg-white/10 hover:bg-slate-200 dark:text-white/40 text-slate-400 hover:dark:text-white hover:text-slate-900 transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Área de Mensajes (Scrollable) */}
                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar scroll-smooth"
                    >
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex gap-3 ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 fade-in duration-300`}>
                                {msg.type === 'bot' && (
                                    <div className="w-8 h-8 shrink-0 rounded-full dark:bg-[#05070a] bg-slate-100 flex items-center justify-center dark:text-blue-400 text-blue-600 dark:border-white/5 border-slate-200 mt-auto shadow-sm transition-colors">
                                        <Bot size={14} />
                                    </div>
                                )}
                                <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${msg.type === 'user'
                                    ? 'bg-blue-600 text-white rounded-br-none shadow-lg shadow-blue-900/10 dark:shadow-blue-900/20'
                                    : 'dark:bg-[#05070a] bg-slate-50 dark:text-slate-200 text-slate-800 dark:border-white/5 border-slate-100 rounded-bl-none shadow-sm transition-colors'
                                    }`}>
                                    {msg.message}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Área de Opciones (Menu) */}
                    <div className="shrink-0 p-4 dark:bg-[#05070a]/50 bg-slate-50 dark:border-t dark:border-white/5 border-t border-slate-100 transition-colors">
                        <p className="text-[10px] dark:text-white/30 text-slate-400 font-black uppercase tracking-widest mb-3 pl-1 transition-colors">
                            {currentMenu === 'main' ? 'Opciones Disponibles' : 'Selecciona una opción'}
                        </p>
                        <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto custom-scrollbar pr-1">
                            {menuOptions[currentMenu]?.map((option) => {
                                const Icon = option.icon || ChevronRight;
                                return (
                                    <button
                                        key={option.id}
                                        onClick={() => handleOptionClick(option)}
                                        className={`group w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${option.style === 'secondary'
                                            ? 'bg-transparent dark:border-white/10 border-slate-200 hover:dark:bg-white/5 hover:bg-slate-100 dark:text-white/60 text-slate-500 dark:hover:text-white hover:text-slate-900'
                                            : 'dark:bg-white/5 bg-white dark:border-white/5 border-slate-200 hover:dark:border-blue-500/30 hover:border-blue-500/30 hover:dark:bg-blue-600/10 hover:bg-blue-50 dark:text-slate-200 text-slate-700 dark:hover:text-white hover:text-blue-600 shadow-sm'
                                            }`}
                                    >
                                        <Icon size={16} className={`${option.style === 'secondary' ? 'text-white/40' : 'text-blue-400 group-hover:text-blue-300'}`} />
                                        <span className="text-xs font-bold">{option.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                </div>
            )}

            {/* Botón Flotante de Activación */}
            <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className={`relative w-16 h-16 rounded-full flex items-center justify-center shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.5)] transition-all duration-500 hover:scale-110 active:scale-95 z-[200] ${isChatOpen
                    ? 'bg-white text-slate-950 rotate-90 scale-90'
                    : 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white animate-bounce-subtle'
                    }`}
            >
                {isChatOpen ? <X size={28} /> : <MessageCircle size={32} />}

                {!isChatOpen && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-sky-500 border-2 border-slate-950"></span>
                    </span>
                )}
            </button>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: ${theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}; }
                @keyframes bounce-subtle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
                .animate-bounce-subtle { animation: bounce-subtle 3s ease-in-out infinite; }
            `}</style>
        </div>
    );
};

export default ChatWidget;
