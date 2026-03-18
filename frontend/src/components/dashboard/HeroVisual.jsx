import React, { useEffect, useState, useRef } from 'react';
import { Cpu, Wifi, CheckCircle2, Zap, Activity } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const HeroVisual = ({ userName, userStats, onVoiceWelcome }) => {
    const { theme } = useTheme();
    const [isVisible, setIsVisible] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [activeNode, setActiveNode] = useState(0);
    const hasSpokenRef = useRef(false);

    useEffect(() => {
        setIsVisible(true);

        // Voice welcome - only once per session
        if (!hasSpokenRef.current && onVoiceWelcome && userName) {
            const completedModules = userStats?.completedModules || 0;
            const totalModules = userStats?.totalModules || 6;
            let welcomeMessage = '';

            if (completedModules === 0) {
                welcomeMessage = `¡Hola ${userName}! Bienvenido a Señas IA. Para conocer más sobre la plataforma, encontrarás preguntas útiles en el chat de la esquina inferior. ¡Comencemos tu viaje!`;
            } else if (completedModules < totalModules / 2) {
                welcomeMessage = `¡Hola ${userName}! Qué gusto verte de nuevo. Llevas ${completedModules} módulo${completedModules > 1 ? 's' : ''} completado${completedModules > 1 ? 's' : ''}. ¡Sigamos aprendiendo juntos!`;
            } else if (completedModules < totalModules) {
                welcomeMessage = `¡Hola ${userName}! Ya estás en la recta final. Has completado ${completedModules} de ${totalModules} módulos.`;
            } else {
                welcomeMessage = `¡Hola ${userName}! Felicitaciones por completar todos los módulos. ¡Eres un maestro de señas!`;
            }

            setTimeout(() => {
                onVoiceWelcome(welcomeMessage);
                hasSpokenRef.current = true;
            }, 1500);
        }

        // Animated scan line
        const scanInterval = setInterval(() => {
            setScanProgress(p => (p >= 100 ? 0 : p + 0.8));
        }, 20);

        // Cycle active landmark node
        const nodeInterval = setInterval(() => {
            setActiveNode(n => (n + 1) % 21);
        }, 350);

        return () => {
            clearInterval(scanInterval);
            clearInterval(nodeInterval);
        };
    }, []);

    // Hand landmark positions (normalized 0-1, mapped to SVG viewBox 0-200)
    // Represents a realistic open hand / "Hola" sign
    const landmarks = [
        // Wrist
        { x: 100, y: 175, id: 0 },
        // Thumb
        { x: 70, y: 152, id: 1 }, { x: 50, y: 132, id: 2 }, { x: 35, y: 115, id: 3 }, { x: 25, y: 100, id: 4 },
        // Index
        { x: 82, y: 130, id: 5 }, { x: 80, y: 100, id: 6 }, { x: 78, y: 75, id: 7 }, { x: 77, y: 55, id: 8 },
        // Middle
        { x: 100, y: 125, id: 9 }, { x: 100, y: 93, id: 10 }, { x: 100, y: 67, id: 11 }, { x: 100, y: 48, id: 12 },
        // Ring
        { x: 118, y: 128, id: 13 }, { x: 120, y: 97, id: 14 }, { x: 121, y: 72, id: 15 }, { x: 122, y: 53, id: 16 },
        // Pinky
        { x: 135, y: 137, id: 17 }, { x: 140, y: 112, id: 18 }, { x: 143, y: 93, id: 19 }, { x: 145, y: 77, id: 20 },
    ];

    // Connections between landmarks
    const connections = [
        [0, 1], [1, 2], [2, 3], [3, 4],         // Thumb
        [0, 5], [5, 6], [6, 7], [7, 8],           // Index
        [0, 9], [9, 10], [10, 11], [11, 12],       // Middle
        [0, 13], [13, 14], [14, 15], [15, 16],     // Ring
        [0, 17], [17, 18], [18, 19], [19, 20],     // Pinky
        [5, 9], [9, 13], [13, 17],                 // Palm
    ];

    const scanY = (scanProgress / 100) * 200;

    return (
        <div className={`relative w-full h-full flex items-center justify-center transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>

            {/* Ambient glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-72 h-72 rounded-full bg-blue-600/10 blur-[80px] animate-pulse" />
            </div>

            {/* Main container */}
            <div className="relative flex flex-col items-center gap-5 w-full max-w-xs transition-colors duration-500">

                {/* Header badge */}
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full dark:bg-white/5 bg-slate-100 border dark:border-white/10 border-slate-200 transition-colors">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 dark:bg-green-400 animate-pulse" />
                    <span className="text-[10px] font-black dark:text-white/50 text-slate-500 uppercase tracking-[0.25em] transition-colors">IA Vision · Online</span>
                </div>

                {/* SVG Hand Scanner */}
                <div className="relative w-56 h-56">

                    {/* Outer frame */}
                    <div className="absolute inset-0 rounded-2xl dark:border-white/8 border-slate-300 dark:bg-white/[0.02] bg-slate-100/50 transition-colors shadow-inner" />

                    {/* Corner brackets */}
                    {[
                        'top-0 left-0 border-t-2 border-l-2 rounded-tl-xl',
                        'top-0 right-0 border-t-2 border-r-2 rounded-tr-xl',
                        'bottom-0 left-0 border-b-2 border-l-2 rounded-bl-xl',
                        'bottom-0 right-0 border-b-2 border-r-2 rounded-br-xl',
                    ].map((cls, i) => (
                        <div key={i} className={`absolute w-5 h-5 border-blue-500/60 ${cls}`} />
                    ))}

                    {/* SVG hand with landmarks */}
                    <svg
                        viewBox="0 30 200 160"
                        className="w-full h-full"
                        style={{ overflow: 'hidden' }}
                    >
                        {/* Scan line */}
                        <defs>
                            <linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="rgba(59,130,246,0)" />
                                <stop offset="50%" stopColor="rgba(59,130,246,0.4)" />
                                <stop offset="100%" stopColor="rgba(59,130,246,0)" />
                            </linearGradient>
                            <filter id="glow">
                                <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
                                <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                            </filter>
                        </defs>

                        {/* Skeleton connections */}
                        {connections.map(([a, b], i) => {
                            const pa = landmarks[a];
                            const pb = landmarks[b];
                            return (
                                <line
                                    key={i}
                                    x1={pa.x} y1={pa.y}
                                    x2={pb.x} y2={pb.y}
                                    stroke={theme === 'dark' ? 'rgba(59,130,246,0.35)' : '#1e40af'}
                                    strokeWidth={theme === 'dark' ? '1.5' : '2'}
                                    strokeLinecap="round"
                                />
                            );
                        })}

                        {/* Landmark nodes */}
                        {landmarks.map((pt, i) => {
                            const isActive = activeNode === i;
                            return (
                                <g key={i} filter={theme === 'dark' ? "url(#glow)" : ""}>
                                    {isActive && (
                                        <circle cx={pt.x} cy={pt.y} r="8" fill={theme === 'dark' ? "rgba(59,130,246,0.15)" : "rgba(30,64,175,0.2)"} />
                                    )}
                                    <circle
                                        cx={pt.x} cy={pt.y} r={isActive ? 4 : 3}
                                        fill={isActive ? (theme === 'dark' ? '#3b82f6' : '#1e40af') : (theme === 'dark' ? 'rgba(147,197,253,0.7)' : '#3b82f6')}
                                        stroke={isActive ? (theme === 'dark' ? '#60a5fa' : '#111827') : 'transparent'}
                                        strokeWidth="1.5"
                                    />
                                </g>
                            );
                        })}

                        {/* Active node label */}
                        {(() => {
                            const pt = landmarks[activeNode];
                            const labels = ['Muñeca', 'Pulgar B', 'Pulgar', 'Pulgar', 'Pulgar P', 'Índice B', 'Índice', 'Índice', 'Índice P', 'Medio B', 'Medio', 'Medio', 'Medio P', 'Anular B', 'Anular', 'Anular', 'Anular P', 'Meñique B', 'Meñique', 'Meñique', 'Meñique P'];
                            const isLeft = pt.x > 100;
                            return (
                                <g>
                                    <line x1={pt.x} y1={pt.y} x2={isLeft ? pt.x + 20 : pt.x - 20} y2={pt.y - 10} stroke={theme === 'dark' ? 'rgba(59,130,246,0.4)' : '#1e40af'} strokeWidth="1" />
                                    <text x={isLeft ? pt.x + 22 : pt.x - 22} y={pt.y - 10} fill={theme === 'dark' ? 'rgba(147,197,253,0.8)' : '#111827'} fontSize="7" textAnchor={isLeft ? 'start' : 'end'} fontFamily="monospace" fontWeight="900">
                                        {labels[activeNode]}
                                    </text>
                                    <text x={isLeft ? pt.x + 22 : pt.x - 22} y={pt.y - 2} fill={theme === 'dark' ? 'rgba(59,130,246,0.5)' : '#1e40af'} fontSize="6" textAnchor={isLeft ? 'start' : 'end'} fontFamily="monospace" fontWeight="900">
                                        #{String(activeNode).padStart(2, '0')}
                                    </text>
                                </g>
                            );
                        })()}

                        {/* Scan line sweep */}
                        <rect
                            x="0" y={30 + (scanY * 160 / 200) - 8}
                            width="200" height="16"
                            fill="url(#scanGrad)"
                            opacity="0.6"
                        />
                        <line
                            x1="0" y1={30 + (scanY * 160 / 200)}
                            x2="200" y2={30 + (scanY * 160 / 200)}
                            stroke={theme === 'dark' ? "rgba(59,130,246,0.5)" : "rgba(37,99,235,1)"}
                            strokeWidth="1.5"
                        />
                    </svg>

                    {/* Confidence readout */}
                    <div className="absolute bottom-2 left-0 right-0 flex justify-center">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 dark:bg-[#05070a]/80 bg-white shadow-lg backdrop-blur rounded-lg border dark:border-white/5 border-slate-200 transition-colors">
                            <Activity size={9} className="text-green-600 dark:text-green-400" />
                            <span className="text-[9px] font-black text-green-600 dark:text-green-400 font-mono tracking-wider transition-colors">CONF: 98.4%</span>
                        </div>
                    </div>
                </div>

                {/* Status indicators */}
                <div className="grid grid-cols-3 gap-2 w-full">
                    {[
                        { icon: Cpu, label: 'MODELO', value: 'v2.4', color: 'text-blue-600 dark:text-blue-400' },
                        { icon: Wifi, label: 'SEÑALES', value: '21 pts', color: 'text-purple-600 dark:text-purple-400' },
                        { icon: Zap, label: 'FPS', value: '60 fps', color: 'text-yellow-600 dark:text-yellow-400' },
                    ].map((item, i) => (
                        <div key={i} className="flex flex-col items-center gap-1 p-2.5 rounded-xl dark:bg-white/[0.03] bg-slate-100 border dark:border-white/5 border-slate-200 transition-colors">
                            <item.icon size={12} className={item.color} />
                            <span className="text-[8px] font-black dark:text-white/20 text-slate-400 uppercase tracking-wider transition-colors">{item.label}</span>
                            <span className={`text-[10px] font-black font-mono ${item.color} transition-colors`}>{item.value}</span>
                        </div>
                    ))}
                </div>

                {/* Detection status bar */}
                <div className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl dark:bg-white/[0.03] bg-slate-100 border dark:border-white/5 border-slate-200 transition-colors">
                    <CheckCircle2 size={14} className="text-green-600 dark:text-green-400 shrink-0 transition-colors" />
                    <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-black dark:text-white/30 text-slate-400 uppercase tracking-[0.2em] transition-colors">Estado del sistema</p>
                        <p className="text-[11px] font-bold dark:text-white/70 text-slate-700 truncate transition-colors">Reconocimiento activo · Listo</p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400 animate-pulse shrink-0" />
                </div>

            </div>

            <style>{`
                @keyframes orbit { from { transform: rotate(0deg) translateX(160px); } to { transform: rotate(360deg) translateX(160px); } }
                @keyframes pulse-ring { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
            `}</style>
        </div>
    );
};

export default HeroVisual;
