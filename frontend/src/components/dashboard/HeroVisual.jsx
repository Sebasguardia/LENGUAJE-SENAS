import React, { useEffect, useState, useRef } from 'react';
import {
    Sparkles, TrendingUp, Trophy, Target,
    Zap, Award, Star, Brain, Activity
} from 'lucide-react';

const HeroVisual = ({ userName, userStats, onVoiceWelcome }) => {
    const [isVisible, setIsVisible] = useState(false);
    const hasSpokenRef = useRef(false);

    useEffect(() => {
        setIsVisible(true);

        // Voice welcome - only once per session
        if (!hasSpokenRef.current && onVoiceWelcome && userName) {
            const completedModules = userStats?.completedModules || 0;
            const totalModules = userStats?.totalModules || 6;

            let welcomeMessage = '';

            if (completedModules === 0) {
                // Usuario nuevo
                welcomeMessage = `¡Hola ${userName}! Bienvenido a Señas IA. Soy tu asistente virtual. Para conocer más sobre la plataforma, encontrarás preguntas útiles en el chat de la esquina inferior. ¡Comencemos tu viaje!`;
            } else if (completedModules < totalModules / 2) {
                // Usuario con progreso inicial
                welcomeMessage = `¡Hola ${userName}! Qué gusto verte de nuevo. Llevas ${completedModules} módulo${completedModules > 1 ? 's' : ''} completado${completedModules > 1 ? 's' : ''}. ¡Sigamos aprendiendo juntos!`;
            } else if (completedModules < totalModules) {
                // Usuario avanzado
                welcomeMessage = `¡Hola ${userName}! Ya estás en la recta final. Has completado ${completedModules} de ${totalModules} módulos. ¡Estás muy cerca de dominar el lenguaje de señas!`;
            } else {
                // Usuario que completó todo
                welcomeMessage = `¡Hola ${userName}! Felicitaciones por completar todos los módulos. Puedes repasar cualquier lección o ayudar a otros estudiantes. ¡Eres un maestro de señas!`;
            }

            setTimeout(() => {
                onVoiceWelcome(welcomeMessage);
                hasSpokenRef.current = true;
            }, 1500);
        }
    }, []); // Solo se ejecuta una vez al montar

    return (
        <div className="relative w-full h-[500px] flex items-center justify-center">

            {/* Animated Background Circle */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-96 h-96 rounded-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 blur-3xl animate-pulse" />
            </div>

            {/* Main Content */}
            <div className={`relative z-10 transition-all duration-1000 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>

                {/* Central Logo/Icon */}
                <div className="relative w-80 h-80 mx-auto mb-8">
                    {/* Outer Ring */}
                    <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 animate-spin-slow" />

                    {/* Middle Ring */}
                    <div className="absolute inset-8 rounded-full border-4 border-purple-500/20 animate-spin-reverse" />

                    {/* Inner Circle */}
                    <div className="absolute inset-16 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-2xl shadow-blue-600/50">
                        <Brain size={120} className="text-white animate-float" />
                    </div>

                    {/* Floating Stats Badges Removed as per user request for cleaner UI */}

                    {/* Orbiting Particles */}
                    {[...Array(8)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-3 h-3 rounded-full bg-blue-400/60"
                            style={{
                                top: '50%',
                                left: '50%',
                                transform: `rotate(${i * 45}deg) translateX(160px)`,
                                animation: `orbit 10s linear infinite ${i * 0.5}s`
                            }}
                        />
                    ))}
                </div>

                {/* Welcome Text */}
                <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                    <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-blue-500/10 border border-blue-500/20">
                        <Sparkles size={16} className="text-blue-400" />
                        <span className="text-sm font-black text-blue-400 uppercase tracking-widest">Sistema IA Activo</span>
                    </div>
                    <div className="flex items-center justify-center gap-4">
                        <Activity size={24} className="text-green-500 animate-pulse" />
                        <p className="text-xl font-bold text-white/60">
                            Análisis de progreso en tiempo real
                        </p>
                    </div>
                </div>

            </div>

            <style>{`
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes spin-reverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes orbit { from { transform: rotate(0deg) translateX(160px); } to { transform: rotate(360deg) translateX(160px); } }
        
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
        .animate-spin-reverse { animation: spin-reverse 15s linear infinite; }
        .animate-float { animation: float 4s ease-in-out infinite; }
      `}</style>
        </div>
    );
};

export default HeroVisual;
