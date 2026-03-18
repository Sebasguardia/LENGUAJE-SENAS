import React, { useState, useEffect } from 'react';
import {
    Database, HardDrive, Server, Activity, Save,
    RotateCcw, Trash2, ShieldCheck, Download, Upload,
    RefreshCw, Clock, AlertCircle, CheckCircle2, FileJson,
    HelpCircle, BookOpen
} from 'lucide-react';
import { adminService } from '../../api/adminService';
import apiClient from '../../api/apiClient'; // Import needed for blob download

const DatabaseManager = () => {
    const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
    const [backupProgress, setBackupProgress] = useState(0);
    const [backupStatus, setBackupStatus] = useState('idle'); // idle, processing, completed
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const [dbStats, setDbStats] = useState({
        tables: [],
        total_size_mb: 0,
        connection_status: 'Checking...'
    });

    const [backups, setBackups] = useState([]);

    const fetchData = async () => {
        try {
            setIsRefreshing(true);
            const stats = await adminService.getDatabaseStats();
            setDbStats(stats);
            const backupList = await adminService.listBackups();
            setBackups(backupList);
        } catch (error) {
            console.error("Error fetching database info:", error);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData().catch(() => {});
    }, []);

    const handleCreateBackup = async () => {
        setBackupStatus('processing');
        setBackupProgress(0);

        // Progress simulation for UX
        const interval = setInterval(() => {
            setBackupProgress(prev => {
                if (prev >= 95) return 95;
                return prev + (Math.random() * 15);
            });
        }, 300);

        try {
            await adminService.createBackup();
            setBackupProgress(100);
            setBackupStatus('completed');
            await fetchData(); // Refresh list
        } catch (error) {
            console.error("Backup failed", error);
            setBackupStatus('idle');
            alert("Error al crear el respaldo");
        } finally {
            clearInterval(interval);
        }
    };

    const handleDownload = async (fileName) => {
        try {
            const response = await apiClient.get(`/admin-tools/database/download/${fileName}`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error("Download failed", error);
            alert("No se pudo descargar el archivo.");
        }
    };

    if (loading && (!dbStats.tables || dbStats.tables.length === 0)) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] gap-6 animate-in fade-in duration-500">
                <div className="relative">
                    <div className="w-16 h-16 border-4 dark:border-emerald-500/20 border-emerald-500/10 rounded-full"></div>
                    <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0 shadow-[0_0_20px_rgba(16,185,129,0.3)]"></div>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <p className="text-emerald-500 font-black text-[10px] uppercase tracking-[0.4em] animate-pulse">Inyectando Protocolos</p>
                    <div className="flex gap-1.5">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-500/40 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const totalRecords = dbStats.tables.reduce((acc, t) => acc + (t.records || 0), 0);

    return (
        <div className="space-y-6 lg:space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-20 font-sans">

            {/* Header: Orbital Center */}
            <div className="relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-emerald-600/10 to-transparent pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 dark:bg-white/[0.02] bg-white backdrop-blur-3xl border dark:border-white/5 border-slate-200 p-8 lg:p-12 rounded-[3rem] lg:rounded-[4rem] shadow-2xl relative z-10 hover:dark:bg-white/[0.03] hover:bg-slate-50 transition-all">
                    <div className="flex items-center gap-6 lg:gap-10">
                        <div className="relative">
                            <div className="p-6 lg:p-8 bg-gradient-to-br from-emerald-400 to-teal-700 rounded-[2rem] lg:rounded-[2.5rem] shadow-xl shadow-emerald-500/20 transform transition-transform group-hover:rotate-6 duration-500">
                                <Database className="text-white" size={48} />
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 lg:w-10 lg:h-10 dark:bg-[#0a0c10] bg-white border-2 border-emerald-500 rounded-2xl flex items-center justify-center shadow-xl">
                                <ShieldCheck className="text-emerald-500" size={16} />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-3xl lg:text-5xl font-black dark:text-white text-slate-900 tracking-tighter uppercase">Bunker de Datos</h2>
                                <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-600 dark:text-emerald-400 text-[8px] font-black uppercase tracking-widest hidden sm:block">Cluster 01</span>
                            </div>
                            <p className="dark:text-white/40 text-slate-500 text-sm lg:text-lg font-bold uppercase tracking-widest max-w-md mt-1">Panel de operaciones críticas y redundancia estructural del sistema.</p>
                        </div>
                    </div>

                    <div className="flex flex-row items-center gap-6">
                        <div className="hidden md:block text-right">
                            <div className="text-[10px] font-black dark:text-white/20 text-slate-400 uppercase tracking-[0.3em] mb-1">LATENCIA NODO</div>
                            <div className="dark:text-white text-slate-900 font-mono font-bold">12ms <span className="text-emerald-500">STABLE</span></div>
                        </div>
                        <button
                            onClick={fetchData}
                            disabled={isRefreshing}
                            className={`p-5 rounded-[1.5rem] lg:rounded-3xl border dark:border-white/5 border-slate-200 dark:bg-white/[0.05] bg-slate-100 transition-all hover:dark:bg-white/[0.1] hover:bg-slate-200 active:scale-90 ${isRefreshing ? 'opacity-50' : ''}`}
                        >
                            <RefreshCw size={24} className={`dark:text-white/40 text-slate-500 ${isRefreshing ? 'animate-spin text-emerald-500' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Orbital Dashboard: Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="dark:bg-white/[0.02] bg-white backdrop-blur-3xl border dark:border-white/5 border-slate-200 rounded-[2.5rem] p-8 group hover:border-blue-500/30 hover:dark:bg-white/[0.04] hover:bg-slate-50 transition-all duration-500 relative overflow-hidden shadow-2xl">
                    <div className="absolute -right-2 -bottom-2 opacity-5 dark:text-white text-slate-900 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 pointer-events-none">
                        <HardDrive size={120} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 text-blue-500 dark:text-blue-400 mb-4">
                            <div className="p-2 dark:bg-blue-400/10 bg-blue-50 rounded-xl"><HardDrive size={20} /></div>
                            <span className="text-xs font-black uppercase tracking-widest leading-none">Carga Física</span>
                        </div>
                        <div className="text-4xl lg:text-5xl font-black dark:text-white text-slate-900 mb-2 tracking-tighter">{dbStats.total_size_mb} <span className="text-lg opacity-20">MB</span></div>
                        <div className="flex justify-between items-end">
                            <div className="text-[10px] font-bold dark:text-white/20 text-slate-400 uppercase">SQLITE OPTIMIZED</div>
                            <div className="text-blue-500 dark:text-blue-400 font-mono text-[10px] font-black">{(dbStats.total_size_mb / 20 * 100).toFixed(1)}%</div>
                        </div>
                    </div>
                </div>

                <div className="dark:bg-white/[0.02] bg-white backdrop-blur-3xl border dark:border-white/5 border-slate-200 rounded-[2.5rem] p-8 group hover:border-purple-500/30 hover:dark:bg-white/[0.04] hover:bg-slate-50 transition-all duration-500 relative overflow-hidden shadow-2xl">
                    <div className="absolute -right-2 -bottom-2 opacity-5 dark:text-white text-slate-900 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 pointer-events-none">
                        <Server size={120} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400 mb-4">
                            <div className="p-2 dark:bg-purple-400/10 bg-purple-50 rounded-xl"><Server size={20} /></div>
                            <span className="text-xs font-black uppercase tracking-widest leading-none">Registros</span>
                        </div>
                        <div className="text-4xl lg:text-5xl font-black dark:text-white text-slate-900 mb-2 tracking-tighter">{totalRecords > 1000 ? (totalRecords / 1000).toFixed(1) + 'k' : totalRecords}</div>
                        <div className="text-[10px] font-bold dark:text-white/20 text-slate-400 uppercase tracking-widest">FLUJO PERSISTENTE</div>
                    </div>
                </div>

                <div className="dark:bg-white/[0.02] bg-white backdrop-blur-3xl border dark:border-white/5 border-slate-200 rounded-[2.5rem] p-8 group hover:border-emerald-500/30 hover:dark:bg-white/[0.04] hover:bg-slate-50 transition-all duration-500 relative overflow-hidden shadow-2xl">
                    <div className="absolute -right-2 -bottom-2 opacity-5 dark:text-white text-slate-900 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 pointer-events-none">
                        <Activity size={120} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 mb-4">
                            <div className="p-2 dark:bg-emerald-400/10 bg-emerald-50 rounded-xl"><Activity size={20} /></div>
                            <span className="text-xs font-black uppercase tracking-widest leading-none">Salud Dataset</span>
                        </div>
                        <div className="text-4xl lg:text-5xl font-black dark:text-white text-slate-900 mb-2 tracking-tighter">99.8<span className="text-lg opacity-20">%</span></div>
                        <div className="flex items-center gap-2">
                            <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map(i => <div key={i} className={`w-2 h-2 rounded-full ${i < 5 ? 'bg-emerald-500' : 'bg-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse'}`} />)}
                            </div>
                            <span className="text-[10px] font-bold dark:text-white/20 text-slate-400 uppercase tracking-widest">NORMAL</span>
                        </div>
                    </div>
                </div>

                <div className="dark:bg-white/[0.02] bg-white backdrop-blur-3xl border dark:border-white/5 border-slate-200 rounded-[2.5rem] p-8 group hover:border-amber-500/30 hover:dark:bg-white/[0.04] hover:bg-slate-50 transition-all duration-500 relative overflow-hidden shadow-2xl">
                    <div className="absolute -right-2 -bottom-2 opacity-5 dark:text-white text-slate-900 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 pointer-events-none">
                        <ShieldCheck size={120} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 text-amber-600 dark:text-amber-500 mb-4">
                            <div className="p-2 dark:bg-amber-500/10 bg-amber-50 rounded-xl"><ShieldCheck size={20} /></div>
                            <span className="text-xs font-black uppercase tracking-widest leading-none">Respaldo</span>
                        </div>
                        <div className="text-xl lg:text-2xl font-black dark:text-white text-slate-900 mb-2 truncate group-hover:text-amber-500 transition-colors">
                            {backups.length > 0 ? backups[0].date.split(' ')[0] : 'NINGUNO'}
                        </div>
                        <div className="text-[10px] font-bold dark:text-white/20 text-slate-400 uppercase tracking-widest">{backups.length} PUNTOS DE RESTAURACIÓN</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

                {/* Structural Analysis */}
                <div className="lg:col-span-8 space-y-8 lg:space-y-12">
                    <div className="dark:bg-white/[0.02] bg-white backdrop-blur-3xl border dark:border-white/5 border-slate-200 rounded-[3rem] lg:rounded-[4rem] p-8 lg:p-12 shadow-2xl overflow-hidden relative">
                        {/* Ambient glow */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />

                        <div className="flex items-center justify-between mb-10 relative z-10">
                            <div>
                                <h3 className="dark:text-white text-slate-900 font-black text-xl lg:text-3xl tracking-tight mb-2 uppercase">
                                    Exploración Visual de Tablas
                                </h3>
                                <p className="dark:text-white/40 text-slate-500 text-sm font-bold uppercase tracking-[0.2em] mt-1">Sincronización de bajo nivel detectada</p>
                            </div>
                            <div className="p-4 dark:bg-white/5 bg-slate-50 rounded-2xl border dark:border-white/5 border-slate-200 dark:text-white/40 text-slate-400 hidden sm:block shadow-lg">
                                <HelpCircle size={24} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 relative z-10">
                            {dbStats.tables.map((table, i) => (
                                <div key={i} className="group dark:bg-white/[0.02] bg-slate-50 p-6 rounded-[2rem] border dark:border-white/5 border-slate-200 hover:dark:bg-white/[0.04] hover:bg-white hover:border-emerald-500/30 transition-all duration-500 flex flex-col relative overflow-hidden shadow-lg">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-500/10 to-transparent pointer-events-none rounded-full" />

                                    <div className="flex items-center justify-between mb-6 relative z-10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 dark:text-blue-400 group-hover:scale-110 group-hover:bg-blue-500/20 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-all duration-500 shadow-lg shadow-blue-500/10">
                                                <FileJson size={22} />
                                            </div>
                                            <div>
                                                <h4 className="dark:text-white text-slate-900 font-black text-lg tracking-tight capitalize leading-none mb-1">{table.name.replace('_', ' ')}</h4>
                                                <div className="text-[10px] font-black dark:text-white/40 text-slate-500 uppercase tracking-widest">{table.name} Schema</div>
                                            </div>
                                        </div>
                                        <div className={`text-[9px] font-black px-3 py-1.5 rounded-xl border ${table.health === 'Healthy' || table.health === 'Optimized' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/10' : 'bg-blue-500/10 border-blue-500/20 text-blue-400 shadow-lg shadow-blue-500/10'}`}>
                                            {table.health}
                                        </div>
                                    </div>

                                    <div className="space-y-4 relative z-10">
                                        <div className="flex justify-between items-end">
                                            <div className="text-[10px] font-black dark:text-white/40 text-slate-500 uppercase tracking-widest">Dataset Load</div>
                                            <div className="text-2xl font-black dark:text-white text-slate-900 tracking-tighter">{table.records?.toLocaleString() || 0} <span className="text-[10px] opacity-40">Rows</span></div>
                                        </div>
                                        <div className="h-2 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/5 shadow-inner">
                                            <div
                                                className={`h-full rounded-full transition-all duration-1000 ${i % 2 === 0 ? 'bg-gradient-to-r from-blue-500 to-indigo-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]'}`}
                                                style={{ width: `${Math.min(100, (table.records || 0) / 1000 * 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border border-blue-500/20 p-10 lg:p-14 rounded-[4rem] group hover:to-indigo-600/20 transition-all duration-700">
                        <div className="flex flex-col md:flex-row items-center gap-10">
                            <div className="shrink-0 relative">
                                <div className="p-8 bg-blue-500/20 rounded-[2.5rem] border border-blue-500/30 text-blue-400 group-hover:scale-110 transition-transform duration-500">
                                    <BookOpen size={48} />
                                </div>
                                <div className="absolute -top-3 -right-3 text-yellow-500 animate-pulse">
                                    <ShieldCheck size={32} />
                                </div>
                            </div>
                            <div className="space-y-4 text-center md:text-left">
                                <h4 className="dark:text-white text-slate-900 font-black text-2xl tracking-tight leading-none">Security Protocol & Maintenance</h4>
                                <p className="dark:text-blue-200/50 text-slate-600 text-base leading-relaxed font-medium">
                                    La arquitectura utiliza un nodo SQLite persistente con redundancia por software. Se recomienda realizar una descarga física del archivo <b className="dark:text-white text-slate-900">app.db</b> cada vez que el cluster de entrenamiento supere los 10,000 registros.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Vault: Backups Management */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="dark:bg-white/[0.02] bg-white backdrop-blur-3xl border dark:border-white/5 border-slate-200 rounded-[3rem] lg:rounded-[4rem] p-8 lg:p-10 relative overflow-hidden flex flex-col h-full shadow-2xl">
                        {/* Ambient glow */}
                        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />
                        <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
                            <Save size={300} className="text-white" />
                        </div>

                        <div className="relative z-10 flex flex-col h-full">
                            <div className="mb-10">
                                <h3 className="dark:text-white text-slate-900 font-black text-2xl lg:text-3xl tracking-tight mb-2 uppercase">Respaldo Vault</h3>
                                <p className="dark:text-white/40 text-slate-500 text-[10px] lg:text-xs font-black uppercase tracking-[0.3em] flex items-center gap-2 mt-1">
                                    <Clock size={12} /> Redundancia Offline
                                </p>
                            </div>

                            <button
                                onClick={() => setIsBackupModalOpen(true)}
                                className="w-full py-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-lg shadow-blue-500/20 hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-4 mb-10 group"
                            >
                                <Save size={20} className="group-hover:rotate-12 transition-transform" />
                                <span>Generar Snapshot</span>
                            </button>

                            <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar min-h-[400px]">
                                <h4 className="dark:text-white text-slate-900 font-black text-[10px] uppercase tracking-[0.4em] mb-6 border-b dark:border-white/5 border-slate-200 pb-4 sticky top-0 dark:bg-[#0a0f1d] bg-white z-20 py-2">
                                    HISTORIAL DISPONIBLE ({backups.length})
                                </h4>

                                {backups.map((backup, idx) => (
                                    <div key={idx} className="dark:bg-white/[0.02] bg-slate-50 rounded-[2rem] p-6 border dark:border-white/5 border-slate-200 hover:dark:bg-white/[0.04] hover:bg-white hover:border-blue-500/30 transition-all duration-500 group relative overflow-hidden shadow-lg">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/10 to-transparent pointer-events-none rounded-full" />

                                        <div className="flex justify-between items-start mb-4 relative z-10">
                                            <div className="w-12 h-12 dark:bg-white/5 bg-white border dark:border-white/5 border-slate-200 rounded-2xl flex items-center justify-center dark:text-white/60 text-slate-400 group-hover:dark:bg-blue-500/20 group-hover:bg-blue-50 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:border-blue-500/20 transition-all duration-500 shadow-lg shadow-blue-500/5">
                                                <Database size={20} />
                                            </div>
                                            <button
                                                onClick={() => handleDownload(backup.name)}
                                                className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500 hover:text-white transition-all flex items-center justify-center shadow-lg shadow-blue-500/20"
                                            >
                                                <Download size={18} />
                                            </button>
                                        </div>

                                        <div className="min-w-0 relative z-10">
                                            <div className="dark:text-white text-slate-900 font-black text-sm truncate mb-2 uppercase tracking-tight" title={backup.name}>{backup.name}</div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-[10px] font-black dark:text-white/40 text-slate-500 truncate uppercase tracking-widest">
                                                    <Clock size={12} className="shrink-0" />
                                                    {backup.date}
                                                </div>
                                                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 dark:bg-emerald-500/10 bg-emerald-50 border dark:border-emerald-500/20 border-emerald-200 px-2.5 py-1 rounded-lg uppercase shadow-lg shadow-emerald-500/10 tracking-widest">{backup.size}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {backups.length === 0 && (
                                    <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[3rem] opacity-30 text-center">
                                        <Database size={40} className="mb-4 text-white/50" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Vault Vacío</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Futuristic Modal: Backup Engine */}
            {isBackupModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 dark:bg-[#05070a]/90 bg-slate-900/40 backdrop-blur-2xl" onClick={() => backupStatus !== 'processing' && setIsBackupModalOpen(false)}></div>
                    <div className="dark:bg-[#0a0c10] bg-white border dark:border-white/10 border-slate-200 w-full max-w-xl rounded-[3rem] lg:rounded-[4rem] relative z-10 p-10 lg:p-14 text-center shadow-2xl animate-in zoom-in duration-500">

                        {backupStatus === 'idle' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="w-24 h-24 dark:bg-blue-500/10 bg-blue-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border dark:border-blue-500/20 border-blue-200 relative group">
                                    <Save size={40} className="text-blue-600 dark:text-blue-500" />
                                    <div className="absolute -inset-4 bg-blue-500/5 rounded-full animate-ping pointer-events-none" />
                                </div>
                                <h3 className="text-3xl lg:text-4xl font-black dark:text-white text-slate-900 mb-4 tracking-tighter">Inyectar Punto de Control</h3>
                                <p className="dark:text-white/40 text-slate-500 text-sm lg:text-lg mb-12 font-medium leading-relaxed max-w-sm mx-auto">
                                    Se generará un binario cifrado del cluster persistente (app.db). El sistema entrará en modo <strong className="dark:text-white text-slate-900">ReadOnly</strong> temporalmente.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button
                                        onClick={() => setIsBackupModalOpen(false)}
                                        className="flex-1 py-5 rounded-2xl lg:rounded-3xl border dark:border-white/10 border-slate-200 dark:text-white text-slate-600 font-black text-xs uppercase tracking-[0.2em] hover:dark:bg-white/5 hover:bg-slate-50 transition-all order-2 sm:order-1"
                                    >
                                        Abortar Acción
                                    </button>
                                    <button
                                        onClick={handleCreateBackup}
                                        className="flex-[2] py-5 rounded-2xl lg:rounded-3xl bg-blue-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 active:scale-95 transition-all order-1 sm:order-2"
                                    >
                                        Sincronizar Vault
                                    </button>
                                </div>
                            </div>
                        )}

                        {backupStatus === 'processing' && (
                            <div className="space-y-10 animate-in fade-in duration-500">
                                <div className="relative w-32 h-32 lg:w-40 lg:h-40 mx-auto">
                                    <div className="absolute inset-0 border-[6px] border-blue-500/10 rounded-full" />
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle
                                            cx="50%"
                                            cy="50%"
                                            r="45%"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            className="text-blue-500 transition-all duration-300"
                                            strokeDasharray="282.6"
                                            strokeDashoffset={282.6 - (282.6 * backupProgress) / 100}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <div className="text-3xl lg:text-4xl font-black dark:text-white text-slate-900 leading-none">{Math.round(backupProgress)}%</div>
                                        <div className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mt-1">BUS RAW</div>
                                    </div>
                                </div>
                                <h3 className="text-xl lg:text-2xl font-black dark:text-white text-slate-900 tracking-tight animate-pulse">Comprimiendo Clúster...</h3>
                            </div>
                        )}

                        {backupStatus === 'completed' && (
                            <div className="animate-in zoom-in duration-500">
                                <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/20 shadow-xl shadow-emerald-500/10">
                                    <CheckCircle2 size={48} className="text-emerald-500" />
                                </div>
                                <h3 className="text-3xl lg:text-4xl font-black dark:text-white text-slate-900 mb-4 tracking-tighter">Snaphot Sincronizado</h3>
                                <p className="dark:text-white/40 text-slate-500 text-sm lg:text-lg mb-12 font-medium leading-relaxed max-w-sm mx-auto">
                                    El punto de control se ha inyectado en el Vault correctamente.
                                </p>
                                <button
                                    onClick={() => { setIsBackupModalOpen(false); setBackupStatus('idle'); }}
                                    className="w-full py-5 rounded-[2rem] dark:bg-white bg-slate-900 dark:text-slate-950 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all"
                                >
                                    Reactivar Operaciones
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { 
                    background: rgba(59, 130, 246, 0.2); 
                    border-radius: 10px; 
                }
                :global(.light) .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(0, 0, 0, 0.1);
                }
            `}</style>
        </div>
    );
};

export default DatabaseManager;
