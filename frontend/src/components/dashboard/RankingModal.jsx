import React from 'react';
import { X, Trophy, Crown, Star, Medal, ArrowUpRight } from 'lucide-react';

const RankingModal = ({ isOpen, onClose, currentUserId, usersData }) => {
    if (!isOpen) return null;

    const sortedUsers = [...usersData].sort((a, b) => b.xp - a.xp);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-2xl max-h-[85vh] bg-slate-900 border border-white/10 rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-yellow-500/10 to-transparent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-yellow-500/20 rounded-2xl flex items-center justify-center text-yellow-500 shadow-lg shadow-yellow-500/10">
                            <Trophy size={32} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-white tracking-tight">Ranking Global</h2>
                            <p className="text-xs font-bold text-white/40 uppercase tracking-[0.2em]">Los mejores de la comunidad</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 rounded-2xl bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <div className="space-y-3">
                        {sortedUsers.map((user, index) => {
                            const isCurrentUser = user.id === currentUserId;
                            const rank = index + 1;

                            return (
                                <div
                                    key={user.id}
                                    className={`flex items-center justify-between p-5 rounded-[2rem] transition-all border ${isCurrentUser
                                            ? 'bg-blue-600 border-blue-400 shadow-xl shadow-blue-600/20 z-10 scale-[1.02]'
                                            : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'
                                        }`}
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="relative">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${rank === 1 ? 'bg-yellow-500 text-slate-900' :
                                                    rank === 2 ? 'bg-slate-300 text-slate-900' :
                                                        rank === 3 ? 'bg-orange-500 text-slate-900' :
                                                            'bg-slate-800 text-white/40'
                                                } shadow-lg`}>
                                                {rank}
                                            </div>
                                            {rank === 1 && (
                                                <div className="absolute -top-2 -right-2 text-yellow-400 drop-shadow-lg">
                                                    <Crown size={20} fill="currentColor" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${isCurrentUser ? 'bg-white/20' : 'bg-white/5'} text-white`}>
                                                {user.avatar || user.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <p className={`font-black tracking-tight ${isCurrentUser ? 'text-white' : 'text-white/90'}`}>
                                                    {user.name} {isCurrentUser && <span className="text-[10px] ml-2 px-2 py-0.5 bg-white/20 rounded-full">TÚ</span>}
                                                </p>
                                                <p className={`text-[10px] font-bold uppercase tracking-widest ${isCurrentUser ? 'text-white/60' : 'text-white/30'}`}>
                                                    {user.xp} XP • {rank <= 3 ? 'Leyenda' : 'Estudiante'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {rank <= 3 && (
                                            <div className={`${rank === 1 ? 'text-yellow-500' :
                                                    rank === 2 ? 'text-slate-300' :
                                                        'text-orange-500'
                                                }`}>
                                                <Medal size={20} />
                                            </div>
                                        )}
                                        <div className={`text-xl font-black ${isCurrentUser ? 'text-white' : 'text-white/40'}`}>
                                            #{rank}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 bg-white/[0.02] border-t border-white/5 text-center">
                    <p className="text-xs font-bold text-white/40 uppercase tracking-widest">
                        Sigue practicando para subir de nivel y alcanzar la cima
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RankingModal;
