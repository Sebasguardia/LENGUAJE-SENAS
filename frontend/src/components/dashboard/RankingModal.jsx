import React from 'react';
import { X, Trophy, Crown, Star, Medal, ArrowUpRight } from 'lucide-react';

const RankingModal = ({ isOpen, onClose, currentUserId, usersData }) => {
    if (!isOpen) return null;

    const sortedUsers = [...usersData].sort((a, b) => b.xp - a.xp);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 dark:bg-[#05070a]/80 bg-slate-900/40 backdrop-blur-xl animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-2xl max-h-[85vh] dark:bg-[#0a0c10] bg-white dark:border-white/10 border-slate-200 rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="p-8 dark:border-b dark:border-white/5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r dark:from-yellow-500/10 from-yellow-50 to-transparent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-yellow-500/20 rounded-2xl flex items-center justify-center text-yellow-600 dark:text-yellow-500 shadow-lg shadow-yellow-500/10">
                            <Trophy size={32} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black dark:text-white text-slate-900 tracking-tight transition-colors">Ranking Global</h2>
                            <p className="text-xs font-bold dark:text-white/40 text-slate-400 uppercase tracking-[0.2em] transition-colors">Los mejores de la comunidad</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 rounded-2xl dark:bg-white/5 bg-slate-100 dark:text-white/40 text-slate-400 hover:dark:text-white hover:text-slate-900 hover:dark:bg-white/10 hover:bg-slate-200 transition-all font-bold"
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
                                            ? 'bg-blue-600 border-blue-400 shadow-xl shadow-blue-600/20 z-10 scale-[1.02] text-white'
                                            : 'dark:bg-white/[0.02] bg-slate-50 dark:border-white/5 border-slate-100 hover:dark:bg-white/[0.05] hover:bg-white shadow-sm hover:shadow-md'
                                        }`}
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="relative">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${rank === 1 ? 'bg-yellow-500 text-slate-900 shadow-yellow-500/20' :
                                                    rank === 2 ? 'bg-slate-300 text-slate-900 shadow-slate-300/20' :
                                                        rank === 3 ? 'bg-orange-500 text-slate-900 shadow-orange-500/20' :
                                                            'dark:bg-white/5 bg-slate-200 dark:text-white/40 text-slate-500 dark:border-white/5 border-slate-300 shadow-inner'
                                                } shadow-lg transition-colors`}>
                                                {rank}
                                            </div>
                                            {rank === 1 && (
                                                <div className="absolute -top-2 -right-2 text-yellow-400 drop-shadow-lg">
                                                    <Crown size={20} fill="currentColor" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${isCurrentUser ? 'bg-white/20' : 'dark:bg-white/5 bg-slate-200'} ${isCurrentUser ? 'text-white' : 'dark:text-white text-slate-800'} transition-colors`}>
                                                {user.avatar || user.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <p className={`font-black tracking-tight transition-colors ${isCurrentUser ? 'text-white' : 'dark:text-white text-slate-800'}`}>
                                                    {user.name} {isCurrentUser && <span className="text-[10px] ml-2 px-2 py-0.5 bg-white/20 rounded-full">TÚ</span>}
                                                </p>
                                                <p className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${isCurrentUser ? 'text-white/60' : 'dark:text-white/30 text-slate-400'}`}>
                                                    {user.xp} XP • {rank <= 3 ? 'Leyenda' : 'Estudiante'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {rank <= 3 && (
                                            <div className={`${rank === 1 ? 'text-yellow-500' :
                                                    rank === 2 ? 'text-slate-400' :
                                                        'text-orange-500'
                                                }`}>
                                                <Medal size={20} />
                                            </div>
                                        )}
                                        <div className={`text-xl font-black transition-colors ${isCurrentUser ? 'text-white' : 'dark:text-white/40 text-slate-400'}`}>
                                            #{rank}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 dark:bg-white/[0.02] bg-slate-50 dark:border-t dark:border-white/5 border-t border-slate-100 text-center transition-colors">
                    <p className="text-xs font-bold dark:text-white/40 text-slate-400 uppercase tracking-widest">
                        Sigue practicando para subir de nivel y alcanzar la cima
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RankingModal;
