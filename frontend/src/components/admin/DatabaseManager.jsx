import React, { useState } from 'react';
import {
    Database, HardDrive, Server, Activity, Save,
    RotateCcw, Trash2, ShieldCheck, Download, Upload,
    RefreshCw, Clock, AlertCircle, CheckCircle2, FileJson
} from 'lucide-react';

const DatabaseManager = () => {
    const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
    const [backupProgress, setBackupProgress] = useState(0);
    const [backupStatus, setBackupStatus] = useState('idle'); // idle, processing, completed

    const [tables] = useState([
        { name: 'users', records: 1250, size: '4.2 MB', health: 'Healthy', lastMod: 'Hace 2 min' },
        { name: 'learning_modules', records: 8, size: '1.5 MB', health: 'Healthy', lastMod: 'Hace 5 horas' },
        { name: 'ai_datasets', records: 45000, size: '850 MB', health: 'Optimized', lastMod: 'Ayer' },
        { name: 'user_progress', records: 3400, size: '12 MB', health: 'Healthy', lastMod: 'Hace 10 min' },
        { name: 'system_logs', records: 15600, size: '28 MB', health: 'Warning', lastMod: 'Ahora' },
    ]);

    const [backups] = useState([
        { id: 1, name: 'full_backup_v2.0.sql', date: '24/01/2024 03:00 AM', size: '895 MB', type: 'Automático' },
        { id: 2, name: 'pre_update_backup.sql', date: '20/01/2024 14:15 PM', size: '882 MB', type: 'Manual' },
        { id: 3, name: 'weekly_backup.sql', date: '17/01/2024 03:00 AM', size: '850 MB', type: 'Automático' },
    ]);

    const handleCreateBackup = () => {
        setBackupStatus('processing');
        setBackupProgress(0);

        // Simular proceso
        const interval = setInterval(() => {
            setBackupProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setBackupStatus('completed');
                    return 100;
                }
                return prev + 5;
            });
        }, 100);
    };

    const handleDownload = (fileName) => {
        alert(`Descargando copia de seguridad: ${fileName}`);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/40 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg shadow-emerald-500/20">
                        <Database className="text-white" size={32} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Centro de Datos</h2>
                        <p className="text-white/40 text-sm">Administración y Mantenimiento de la Base de Datos</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-black/20 p-2 pr-6 rounded-2xl border border-white/5">
                    <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center animate-pulse">
                        <Activity className="text-green-400" size={20} />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Estado del Sistema</div>
                        <div className="text-white font-bold text-sm">Operacional • 12ms Latencia</div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Storage Usage */}
                <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                        <HardDrive size={100} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 text-white/60 mb-2">
                            <HardDrive size={18} className="text-blue-400" />
                            <span className="text-sm font-bold">Almacenamiento Total</span>
                        </div>
                        <div className="text-3xl font-black text-white mb-4">
                            895 MB <span className="text-lg text-white/40 font-normal">/ 5 GB</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full w-[18%]"></div>
                        </div>
                    </div>
                </div>

                {/* Connections */}
                <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6">
                    <div className="flex items-center gap-2 text-white/60 mb-2">
                        <Server size={18} className="text-purple-400" />
                        <span className="text-sm font-bold">Conexiones Activas</span>
                    </div>
                    <div className="text-3xl font-black text-white mb-2">
                        128
                    </div>
                    <p className="text-white/40 text-xs">Pico más alto: 450 (Hace 2h)</p>
                </div>

                {/* Last Backup */}
                <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6">
                    <div className="flex items-center gap-2 text-white/60 mb-2">
                        <ShieldCheck size={18} className="text-green-400" />
                        <span className="text-sm font-bold">Seguridad</span>
                    </div>
                    <div className="text-3xl font-black text-white mb-2">
                        Protegido
                    </div>
                    <p className="text-white/40 text-xs flex items-center gap-1">
                        <CheckCircle2 size={12} className="text-green-500" />
                        Último respaldo hace 5h
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Content: Tables Status */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8">
                        <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                            <Database className="text-emerald-400" size={20} />
                            Estructura y Estado de Tablas
                        </h3>

                        <div className="space-y-3">
                            {tables.map((table, i) => (
                                <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                                            <FileJson size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold font-mono text-sm">{table.name}</h4>
                                            <div className="flex items-center gap-3 text-xs text-white/40 mt-1">
                                                <span>{table.records.toLocaleString()} registros</span>
                                                <span>•</span>
                                                <span>{table.size}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-xs font-bold px-2 py-1 rounded-lg inline-block mb-1 ${table.health === 'Healthy' ? 'bg-green-500/10 text-green-400' :
                                                table.health === 'Optimized' ? 'bg-blue-500/10 text-blue-400' :
                                                    'bg-yellow-500/10 text-yellow-400'
                                            }`}>
                                            {table.health}
                                        </div>
                                        <div className="text-[10px] text-white/30">Mod: {table.lastMod}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/5 flex gap-4">
                            <button className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2">
                                <RefreshCw size={16} /> Reindexar
                            </button>
                            <button className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2">
                                <Trash2 size={16} /> Limpiar Cache
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sidebar: Backups */}
                <div className="space-y-6">
                    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-20">
                            <Save size={120} className="text-white" />
                        </div>

                        <div className="relative z-10">
                            <h3 className="text-white font-bold text-lg mb-2">Copias de Seguridad</h3>
                            <p className="text-white/40 text-sm mb-6">Gestiona los puntos de restauración</p>

                            <button
                                onClick={() => setIsBackupModalOpen(true)}
                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl text-white font-bold text-sm uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 mb-8"
                            >
                                <Save size={18} /> Crear Respaldo Ahora
                            </button>

                            <div className="space-y-4">
                                <h4 className="text-white/40 text-xs font-bold uppercase tracking-widest">Historial Reciente</h4>
                                {backups.map(backup => (
                                    <div key={backup.id} className="bg-black/20 rounded-2xl p-4 border border-white/5 hover:border-white/10 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="bg-white/10 p-2 rounded-lg text-white/60">
                                                <Database size={16} />
                                            </div>
                                            <button onClick={() => handleDownload(backup.name)} className="text-blue-400 hover:text-white transition-colors">
                                                <Download size={16} />
                                            </button>
                                        </div>
                                        <div className="text-white font-bold text-xs truncate mb-1">{backup.name}</div>
                                        <div className="flex justify-between text-[10px] text-white/40">
                                            <span>{backup.size}</span>
                                            <span>{backup.type}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Modal de Proceso de Respaldo */}
            {isBackupModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => backupStatus !== 'processing' && setIsBackupModalOpen(false)}></div>
                    <div className="bg-slate-900 border border-white/10 w-full max-w-md rounded-[2.5rem] relative z-10 p-8 text-center shadow-2xl animate-in zoom-in duration-300">

                        {backupStatus === 'idle' && (
                            <>
                                <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
                                    <Save size={32} className="text-blue-500" />
                                </div>
                                <h3 className="text-xl font-black text-white mb-2">Nuevo Respaldo</h3>
                                <p className="text-white/60 text-sm mb-8">
                                    Se generará una copia completa de la base de datos (SQL). Esto puede tomar unos minutos.
                                </p>
                                <div className="flex gap-3">
                                    <button onClick={() => setIsBackupModalOpen(false)} className="flex-1 py-3 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 text-xs uppercase tracking-widest">Cancelar</button>
                                    <button onClick={handleCreateBackup} className="flex-1 py-3 rounded-xl bg-blue-500 text-white font-bold hover:bg-blue-600 shadow-lg shadow-blue-500/20 text-xs uppercase tracking-widest">Iniciar</button>
                                </div>
                            </>
                        )}

                        {backupStatus === 'processing' && (
                            <>
                                <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/20 animate-pulse">
                                    <RefreshCw size={32} className="text-blue-500 animate-spin" />
                                </div>
                                <h3 className="text-xl font-black text-white mb-4">Procesando...</h3>
                                <div className="w-full bg-white/10 rounded-full h-2 mb-2 overflow-hidden">
                                    <div className="bg-blue-500 h-full transition-all duration-300 ease-out" style={{ width: `${backupProgress}%` }}></div>
                                </div>
                                <p className="text-white/40 text-xs font-mono">{backupProgress}% Completado</p>
                            </>
                        )}

                        {backupStatus === 'completed' && (
                            <>
                                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20">
                                    <CheckCircle2 size={32} className="text-green-500" />
                                </div>
                                <h3 className="text-xl font-black text-white mb-2">¡Respaldo Exitoso!</h3>
                                <p className="text-white/60 text-sm mb-8">
                                    El archivo <strong>backup_now.sql</strong> se ha guardado correctamente en el servidor.
                                </p>
                                <button onClick={() => { setIsBackupModalOpen(false); setBackupStatus('idle'); }} className="w-full py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 text-xs uppercase tracking-widest">Cerrar</button>
                            </>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
};

export default DatabaseManager;
