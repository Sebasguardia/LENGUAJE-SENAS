import React, { useState } from 'react';
import { X, History, Calendar, Clock, Target, Zap, ArrowRight, BarChart3, CheckCircle2, ChevronLeft } from 'lucide-react';

const HistoryModal = ({ isOpen, onClose, userHistory }) => {
    const [selectedSession, setSelectedSession] = useState(null);

    // Helper para tiempo relativo
    const formatRelativeTime = (dateString) => {
        if (!dateString) return '...';
        const now = new Date();
        const date = new Date(dateString);
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'hace unos segundos';
        if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)} min`;
        if (diffInSeconds < 86400) return `hace ${Math.floor(diffInSeconds / 3600)} horas`;
        if (diffInSeconds < 172800) return 'ayer';
        return `hace ${Math.floor(diffInSeconds / 86400)} días`;
    };

    if (!isOpen) return null;

    const SessionDetailView = ({ session, onBack }) => {
        const details = session.details ? JSON.parse(session.details) : [];

        // El backend ahora devuelve el porcentaje (0-100)
        // Pero si es una sesión vieja con escala 0-1, lo normalizamos
        const displayAccuracy = (details.length > 0 && session.accuracy < 1)
            ? Math.round(details.reduce((acc, el) => acc + (Math.min(100, (el.confidence_score * 100 / 0.9))), 0) / details.length)
            : Math.min(100, session.accuracy);

        return (
            <div className="flex flex-col h-full animate-in slide-in-from-right duration-300">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-widest mb-6 hover:text-blue-300 transition-colors"
                >
                    <ChevronLeft size={16} /> Volver al historial
                </button>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-3xl font-black text-white tracking-tight leading-none">{session.module_title}</h3>
                            {session.module_id === null && (
                                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-[0.2em] border border-purple-500/30">
                                    Módulo Traductor
                                </span >
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest flex items-center gap-1">
                                <Calendar size={12} /> {new Date(session.created_at).toLocaleDateString()}
                            </span>
                            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest flex items-center gap-1">
                                <Clock size={12} /> {session.duration}
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="text-center px-6 py-3 bg-white/5 rounded-2xl border border-white/5">
                            <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Palabras</p>
                            <p className="text-xl font-black text-blue-400">{session.score}</p>
                        </div>
                        <div className="text-center px-6 py-3 bg-white/5 rounded-2xl border border-white/5">
                            <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">XP Ganado</p>
                            <p className="text-xl font-black text-yellow-500">+{Math.min(50, (session.score / 10) * 5)}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-3 pb-8">
                    <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">
                        {session.module_id === null ? 'Frase Construida' : 'Desglose por Elemento'}
                    </h4>

                    {session.module_id === null ? (
                        <div className="flex flex-wrap gap-3 p-6 bg-white/[0.03] border border-white/5 rounded-[2.5rem]">
                            {details.map((el, i) => (
                                <span key={i} className="px-4 py-2 bg-purple-500/20 border border-purple-500/20 rounded-xl text-purple-200 font-bold text-lg animate-in fade-in zoom-in duration-300">
                                    {el.status}
                                </span>
                            ))}
                        </div>
                    ) : details.length > 0 ? (
                        details.map((el, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-white/5 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${el.confidence_score >= 0.85 ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-white/40'}`}>
                                        {i + 1}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white">Elemento {el.element_id}</p>
                                        <p className={`text-[9px] font-black uppercase tracking-widest ${el.confidence_score >= 0.85 ? 'text-green-500/60' : 'text-white/20'}`}>
                                            {el.status === 'completed' ? 'Completado' : 'Pendiente'}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-black text-white">{Math.round(el.confidence_score * 100)}%</div>
                                    <div className="h-1 w-24 bg-white/5 rounded-full mt-1 overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-1000 ${el.confidence_score >= 0.85 ? 'bg-green-500' : 'bg-blue-500/40'}`}
                                            style={{ width: `${el.confidence_score * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-white/20 text-xs italic text-center py-8">No hay detalles disponibles para esta sesión antigua.</p>
                    )}
                </div>
            </div>
        );
    };

    const handleClose = () => {
        setSelectedSession(null);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div
                className="absolute inset-0 dark:bg-[#05070a]/80 bg-slate-900/40 backdrop-blur-xl animate-in fade-in duration-300"
                onClick={handleClose}
            />

            <div className="relative w-full max-w-4xl max-h-[85vh] dark:bg-[#0a0c10] bg-white dark:border-white/10 border-slate-200 rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="p-8 dark:border-b dark:border-white/5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r dark:from-blue-500/10 from-blue-50 to-transparent shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-500 shadow-lg shadow-blue-500/10">
                            <History size={32} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black dark:text-white text-slate-900 tracking-tight transition-colors transition-colors">Historial de Aprendizaje</h2>
                            <p className="text-xs font-bold dark:text-white/40 text-slate-400 uppercase tracking-[0.2em] transition-colors">Registro completo de tus sesiones</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-3 rounded-2xl dark:bg-white/5 bg-slate-100 dark:text-white/40 text-slate-400 hover:dark:text-white hover:text-slate-900 hover:dark:bg-white/10 hover:bg-slate-200 transition-all font-bold"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar dark:bg-[#05070a]/30 bg-slate-50/50">
                    {selectedSession ? (
                        <SessionDetailView
                            session={selectedSession}
                            onBack={() => setSelectedSession(null)}
                        />
                    ) : userHistory.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {userHistory.map((session, index) => (
                                <div
                                    key={index}
                                    onClick={() => setSelectedSession(session)}
                                    className={`group relative border rounded-[2.5rem] p-6 hover:border-blue-500/30 transition-all flex flex-col gap-6 cursor-pointer overflow-hidden shadow-sm hover:shadow-xl ${session.module_id === null ? 'dark:bg-indigo-500/5 bg-indigo-50 dark:border-purple-500/20 border-purple-200' : 'dark:bg-white/[0.02] bg-white dark:border-white/5 border-slate-200'}`}
                                >
                                    <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity ${session.module_id === null ? 'bg-purple-500/10' : 'bg-blue-500/5'}`} />

                                    <div className="flex justify-between items-start relative z-10">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Calendar size={12} className="dark:text-white/20 text-slate-400" />
                                                <span className="text-[10px] font-black dark:text-white/20 text-slate-400 uppercase tracking-widest transition-colors">
                                                    {new Date(session.created_at).toLocaleDateString()} a las {new Date(session.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    <span className="ml-2 text-blue-500/40">({formatRelativeTime(session.created_at)})</span>
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <h3 className={`text-xl font-black tracking-tight group-hover:text-blue-500 transition-colors uppercase transition-colors ${session.module_id === null ? 'dark:text-purple-400 text-purple-600' : 'dark:text-white text-slate-900'}`}>
                                                    {session.module_title}
                                                </h3>
                                                {session.module_id === null && (
                                                    <span className="px-2 py-0.5 rounded-md dark:bg-purple-500/20 bg-purple-100 dark:text-purple-400 text-purple-600 text-[8px] font-black uppercase tracking-widest border dark:border-purple-500/30 border-purple-200 transition-colors">
                                                        Live
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="px-3 py-1 rounded-full dark:bg-white/5 bg-slate-100 dark:text-white/40 text-slate-500 text-[9px] font-black uppercase tracking-widest border dark:border-white/5 border-slate-200 transition-colors">
                                            {session.duration}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 relative z-10">
                                        <div className="p-4 rounded-2xl dark:bg-white/5 bg-slate-50 border dark:border-white/5 border-slate-100 transition-colors">
                                            <div className="flex items-center gap-2 mb-2 text-blue-500">
                                                <Target size={14} />
                                                <span className="text-[10px] font-black uppercase tracking-widest transition-colors">Precisión</span>
                                            </div>
                                            <p className="text-2xl font-black dark:text-white text-slate-800 transition-colors">{session.accuracy}%</p>
                                        </div>
                                        <div className="p-4 rounded-2xl dark:bg-white/5 bg-slate-50 border dark:border-white/5 border-slate-100 transition-colors">
                                            <div className="flex items-center gap-2 mb-2 text-yellow-600 dark:text-yellow-500">
                                                <Zap size={14} />
                                                <span className="text-[10px] font-black uppercase tracking-widest transition-colors">XP</span>
                                            </div>
                                            <p className="text-2xl font-black dark:text-white text-slate-800 transition-colors">{session.score}</p>
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-4 dark:border-t dark:border-white/5 border-t border-slate-100 flex justify-between items-center relative z-10 dark:text-white/20 text-slate-400 group-hover:text-blue-500 transition-colors">
                                        <span className="text-[10px] font-black uppercase tracking-widest">Ver Detalles</span>
                                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                            <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/10">
                                <BarChart3 size={48} />
                            </div>
                            <h3 className="text-xl font-black text-white mb-2">Sin actividad aún</h3>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {!selectedSession && (
                    <div className="p-8 dark:bg-white/[0.02] bg-slate-50 dark:border-t dark:border-white/5 border-t border-slate-100 flex items-center justify-between shrink-0 transition-colors">
                        <div className="flex gap-8">
                            <div>
                                <p className="text-[10px] font-black dark:text-white/30 text-slate-400 uppercase tracking-widest mb-1 transition-colors">Total Sesiones</p>
                                <p className="text-xl font-black dark:text-white text-slate-900 transition-colors">{userHistory.length}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black dark:text-white/30 text-slate-400 uppercase tracking-widest mb-1 transition-colors">Precisión Media</p>
                                <p className="text-xl font-black text-green-600 dark:text-green-400 transition-colors">
                                    {userHistory.length > 0
                                        ? Math.round(userHistory.reduce((acc, s) => acc + s.accuracy, 0) / userHistory.length)
                                        : 0}%
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-600/20"
                        >
                            Cerrar Historial
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HistoryModal;
