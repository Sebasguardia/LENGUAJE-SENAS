import React, { useState } from 'react';
import {
    Settings, Shield, Users, Bell, Lock, Globe,
    Save, RefreshCcw, ToggleLeft, ToggleRight,
    CheckCircle2, AlertTriangle, Key, Mail, Smartphone, ShieldCheck
} from 'lucide-react';

const SystemSettings = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [hasChanges, setHasChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Estados de Configuración General
    const [generalConfig, setGeneralConfig] = useState({
        siteName: 'Plataforma de Señas IA',
        maintenanceMode: false,
        allowRegistration: true,
        maxUploadSize: '10', // MB
        language: 'es',
        timezone: 'UTC-5'
    });

    // Estados de Gestión de Admins
    const [adminUsers, setAdminUsers] = useState([
        {
            id: 1,
            name: 'Super Admin',
            email: 'admin@system.com',
            role: 'SuperAdmin',
            permissions: { users: true, content: true, ai: true, settings: true },
            lastActive: 'Ahora'
        },
        {
            id: 2,
            name: 'Gestor de Contenido',
            email: 'editor@system.com',
            role: 'Editor',
            permissions: { users: false, content: true, ai: false, settings: false },
            lastActive: 'Hace 2h'
        },
        {
            id: 3,
            name: 'Especialista IA',
            email: 'dev_ai@system.com',
            role: 'Developer',
            permissions: { users: false, content: true, ai: true, settings: false },
            lastActive: 'Ayer'
        }
    ]);

    // Estados de Seguridad
    const [securityConfig, setSecurityConfig] = useState({
        twoFactorAuth: true,
        passwordExpiration: 90, // días
        sessionTimeout: 30, // minutos
        loginNotifications: true
    });

    const handleGeneralChange = (key, value) => {
        setGeneralConfig({ ...generalConfig, [key]: value });
        setHasChanges(true);
    };

    const togglePermission = (userId, perm) => {
        setAdminUsers(adminUsers.map(user => {
            if (user.id === userId) {
                // No se pueden quitar permisos al SuperAdmin principal
                if (user.role === 'SuperAdmin' && perm === 'settings') return user;

                return {
                    ...user,
                    permissions: { ...user.permissions, [perm]: !user.permissions[perm] }
                };
            }
            return user;
        }));
        setHasChanges(true);
    };

    const handleSaveChanges = () => {
        setIsSaving(true);
        // Simular guardado
        setTimeout(() => {
            setIsSaving(false);
            setHasChanges(false);
            alert('Configuración del sistema actualizada correctamente.');
        }, 1500);
    };

    const TabButton = ({ id, icon: Icon, label }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all font-bold text-sm ${activeTab === id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'text-white/40 hover:bg-white/5 hover:text-white'
                }`}
        >
            <Icon size={18} />
            {label}
        </button>
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/40 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-gradient-to-br from-slate-600 to-slate-800 rounded-2xl shadow-lg shadow-slate-500/20">
                        <Settings className="text-white" size={32} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Configuración Global</h2>
                        <p className="text-white/40 text-sm">Control total del sistema y permisos administrativos</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {hasChanges && (
                        <span className="text-yellow-400 text-xs font-bold uppercase tracking-widest animate-pulse mr-2">
                            Cambios sin guardar
                        </span>
                    )}
                    <button
                        onClick={handleSaveChanges}
                        disabled={!hasChanges || isSaving}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${hasChanges
                            ? 'bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-500/20 cursor-pointer'
                            : 'bg-white/5 text-white/20 cursor-not-allowed'
                            }`}
                    >
                        {isSaving ? <RefreshCcw className="animate-spin" size={18} /> : <Save size={18} />}
                        Guardar
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* Sidebar de Navegación */}
                <div className="lg:col-span-1 space-y-2">
                    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-4 flex flex-col gap-2">
                        <TabButton id="general" icon={Globe} label="General" />
                        <TabButton id="permissions" icon={Shield} label="Roles y Permisos" />
                        <TabButton id="security" icon={Lock} label="Seguridad" />
                        <TabButton id="notifications" icon={Bell} label="Notificaciones" />
                    </div>

                    <div className="bg-blue-600/10 border border-blue-600/20 rounded-[2rem] p-6">
                        <h4 className="flex items-center gap-2 text-blue-400 font-bold mb-2">
                            <ShieldCheck size={18} /> Super Admin
                        </h4>
                        <p className="text-blue-200/60 text-xs leading-relaxed">
                            Estás operando con privilegios de nivel 0. Tienes acceso irrestricto a todas las configuraciones del sistema.
                        </p>
                    </div>
                </div>

                {/* Contenido Principal */}
                <div className="lg:col-span-3">
                    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 min-h-[500px]">

                        {/* TAB: GENERAL */}
                        {activeTab === 'general' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="border-b border-white/10 pb-6 mb-6">
                                    <h3 className="text-xl font-bold text-white mb-2">Identidad y Acceso</h3>
                                    <p className="text-white/40 text-sm">Configuraciones básicas del sitio público.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-1">Nombre de la Plataforma</label>
                                        <input
                                            type="text"
                                            value={generalConfig.siteName}
                                            onChange={(e) => handleGeneralChange('siteName', e.target.value)}
                                            className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-blue-500/50"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-1">Idioma por Defecto</label>
                                        <select
                                            value={generalConfig.language}
                                            onChange={(e) => handleGeneralChange('language', e.target.value)}
                                            className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-blue-500/50 appearance-none"
                                        >
                                            <option value="es">Español (Latinoamérica)</option>
                                            <option value="en">English (US)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="bg-white/5 rounded-2xl p-6 border border-white/5 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-white font-bold">Modo Mantenimiento</h4>
                                            <p className="text-white/40 text-xs mt-1">Si se activa, solo los administradores podrán acceder al sitio.</p>
                                        </div>
                                        <button
                                            onClick={() => handleGeneralChange('maintenanceMode', !generalConfig.maintenanceMode)}
                                            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${generalConfig.maintenanceMode ? 'bg-red-500' : 'bg-slate-700'}`}
                                        >
                                            <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${generalConfig.maintenanceMode ? 'translate-x-7' : 'translate-x-1'}`} />
                                        </button>
                                    </div>

                                    <div className="h-px bg-white/5 w-full"></div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-white font-bold">Registro de Usuarios</h4>
                                            <p className="text-white/40 text-xs mt-1">Permitir que nuevos estudiantes se registren libremente.</p>
                                        </div>
                                        <button
                                            onClick={() => handleGeneralChange('allowRegistration', !generalConfig.allowRegistration)}
                                            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${generalConfig.allowRegistration ? 'bg-green-500' : 'bg-slate-700'}`}
                                        >
                                            <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${generalConfig.allowRegistration ? 'translate-x-7' : 'translate-x-1'}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB: PERMISSIONS */}
                        {activeTab === 'permissions' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="border-b border-white/10 pb-6 mb-6 flex justify-between items-end">
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-2">Gestión de Administradores</h3>
                                        <p className="text-white/40 text-sm">Controla quién tiene acceso al panel de administración.</p>
                                    </div>
                                    <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all">
                                        <Users size={14} /> Nuevo Admin
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {adminUsers.map(user => (
                                        <div key={user.id} className="bg-white/5 border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                                        {user.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-white font-bold">{user.name} <span className="ml-2 px-2 py-0.5 rounded text-[10px] bg-white/10 text-white/60 uppercase">{user.role}</span></h4>
                                                        <p className="text-white/40 text-xs">{user.email}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Último Acceso</div>
                                                    <div className="text-white font-medium text-sm">{user.lastActive}</div>
                                                </div>
                                            </div>

                                            <div className="bg-black/20 rounded-xl p-4">
                                                <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3">Permisos de Acceso</div>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    {Object.keys(user.permissions).map(perm => (
                                                        <label key={perm} className={`flex items-center gap-2 cursor-pointer ${user.role === 'SuperAdmin' && perm === 'settings' ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                            <div
                                                                className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${user.permissions[perm]
                                                                    ? 'bg-blue-500 border-blue-500 text-white'
                                                                    : 'border-white/20 hover:border-white/40'
                                                                    }`}
                                                                onClick={() => togglePermission(user.id, perm)}
                                                            >
                                                                {user.permissions[perm] && <CheckCircle2 size={14} />}
                                                            </div>
                                                            <span className="text-white/80 text-xs font-bold capitalize">
                                                                {perm === 'users' ? 'Usuarios' :
                                                                    perm === 'content' ? 'Módulos' :
                                                                        perm === 'ai' ? 'IA y Data' : 'Settings'}
                                                            </span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* TAB: SECURITY */}
                        {activeTab === 'security' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="border-b border-white/10 pb-6 mb-6">
                                    <h3 className="text-xl font-bold text-white mb-2">Protocolos de Seguridad</h3>
                                    <p className="text-white/40 text-sm">Endurecimiento de la protección del sistema.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-white/5 border border-white/5 rounded-2xl p-6 relative overflow-hidden">
                                        <div className="absolute right-0 top-0 p-4 opacity-10">
                                            <Smartphone size={100} />
                                        </div>
                                        <h4 className="text-white font-bold mb-4 relative z-10">Autenticación de Dos Factores</h4>
                                        <div className="relative z-10">
                                            <button
                                                onClick={() => {
                                                    setSecurityConfig({ ...securityConfig, twoFactorAuth: !securityConfig.twoFactorAuth });
                                                    setHasChanges(true);
                                                }}
                                                className={`w-full py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 border ${securityConfig.twoFactorAuth
                                                    ? 'bg-green-500/10 border-green-500/50 text-green-400'
                                                    : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                                                    }`}
                                            >
                                                {securityConfig.twoFactorAuth ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                                                {securityConfig.twoFactorAuth ? 'Activo (Requerido)' : 'Desactivado'}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
                                        <div className="flex items-center gap-3 mb-6">
                                            <Key className="text-yellow-400" size={24} />
                                            <div>
                                                <h4 className="text-white font-bold">Rotación de Contraseñas</h4>
                                                <p className="text-white/40 text-xs">Forzar cambio cada X días</p>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <input
                                                type="range"
                                                min="30"
                                                max="365"
                                                step="30"
                                                value={securityConfig.passwordExpiration}
                                                onChange={(e) => {
                                                    setSecurityConfig({ ...securityConfig, passwordExpiration: parseInt(e.target.value) });
                                                    setHasChanges(true);
                                                }}
                                                className="w-full accent-blue-500"
                                            />
                                            <div className="flex justify-between text-xs font-bold text-white/60">
                                                <span>30 días</span>
                                                <span className="text-white bg-blue-500/20 px-2 py-1 rounded">{securityConfig.passwordExpiration} días</span>
                                                <span>1 año</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB: NOTIFICATIONS */}
                        {activeTab === 'notifications' && (
                            <div className="flex flex-col items-center justify-center h-full py-20 text-center animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
                                    <Mail size={40} className="text-white/20" />
                                </div>
                                <h3 className="text-white font-bold text-xl mb-2">Configuración de Alertas</h3>
                                <p className="text-white/40 text-sm max-w-sm mx-auto mb-8">
                                    Gestiona las plantillas de correo y las notificaciones push para los eventos del sistema.
                                </p>
                                <button className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-bold transition-all">
                                    Ver Plantillas de Email
                                </button>
                            </div>
                        )}

                    </div>
                </div>

            </div>

            {/* Import to fix linter unused imports if any */}
            <span className="hidden"><ShieldCheck /></span>
        </div>
    );
};

export default SystemSettings;
