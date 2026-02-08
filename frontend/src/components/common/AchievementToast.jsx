import React from 'react';
import { Trophy, Star, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AchievementToast = ({ t, badge }) => {
    const Icon = badge.icon || Trophy;

    // Colores según el tier
    const colors = {
        bronze: 'from-orange-500/20 to-orange-600/20 text-orange-400 border-orange-500/30',
        silver: 'from-slate-300/20 to-slate-400/20 text-slate-300 border-slate-400/30',
        gold: 'from-yellow-400/20 to-yellow-500/20 text-yellow-400 border-yellow-500/30'
    };

    const tierColors = colors[badge.id] || colors.bronze;

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            className={`flex items-center gap-4 p-5 rounded-[2rem] bg-slate-900/90 backdrop-blur-2xl border ${tierColors} shadow-[0_20px_50px_rgba(0,0,0,0.5)] max-w-sm pointer-events-auto`}
        >
            <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0 relative overflow-hidden group`}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <Icon size={28} className="relative z-10" />
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">¡Nuevo Logro!</p>
                <h4 className="text-lg font-black text-white leading-tight truncate">{badge.title}</h4>
                <p className="text-xs font-bold opacity-80 mt-0.5">Nivel {badge.label} Desbloqueado</p>

                <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-black">
                        <Zap size={10} />
                        +{badge.xp} XP
                    </div>
                </div>
            </div>

            {/* Decorative effect */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full blur-sm animate-ping" />
        </motion.div>
    );
};

export default AchievementToast;
