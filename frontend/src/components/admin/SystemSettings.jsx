import React, { useState, useEffect } from 'react';
import {
    Settings, Shield, Users, Bell, Lock, Globe,
    Save, RefreshCcw, ToggleLeft, ToggleRight,
    CheckCircle2, AlertTriangle, Key, Mail, Smartphone, ShieldCheck,
    Plus, X, Edit, Trash2, Eye, EyeOff, Server, BarChart2, Database,
    Cpu, Camera, BookOpen, AlertCircle, Power, TrendingUp
} from 'lucide-react';
import { adminService } from '../../api/adminService';
import { toast } from 'react-hot-toast';

import { useNavigate } from 'react-router-dom';

const SystemSettings = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(() => {
        return localStorage.getItem('settings_active_tab') || 'general';
    });
    const [hasChanges, setHasChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Current User State (You might want to fetch this from a context)
    const [currentUser, setCurrentUser] = useState({
        id: 0,
        name: '',
        role: 'pending',
        permissions: {}
    });

    // --- CONFIGURATION STATES ---

    // 1. General
    const [generalConfig, setGeneralConfig] = useState({
        site_name: 'Lenguaje de Señas IA',
        maintenance_mode: 'false',
        public_registration: 'true',
        language: 'es',
        timezone: 'UTC-5',
        max_upload_size: '10'
    });

    // 2. Roles & Admin Users
    const [adminUsers, setAdminUsers] = useState([]);

    // 3. Security
    const [securityConfig, setSecurityConfig] = useState({
        security_2fa: 'false',
        security_password_rotation: 'false',
        security_password_days: '90',
        security_session_timeout: '30'
    });

    // 4. Notifications
    const [notificationConfig, setNotificationConfig] = useState({
        notify_new_user: 'true',
        notify_system_error: 'true',
        notify_maintenance: 'true',
        notify_training: 'false'
    });

    // Load initial data
    useEffect(() => {
        loadAllData().catch(() => {});
    }, []);

    const loadAllData = async () => {
        setIsLoading(true);
        try {
            // 1. Load Settings
            const settingsData = await adminService.getAllSettings();

            // Map settings to state
            const newGeneral = { ...generalConfig };
            const newSecurity = { ...securityConfig };
            const newNotify = { ...notificationConfig };

            settingsData.forEach(setting => {
                if (setting.category === 'general') newGeneral[setting.key] = setting.value;
                if (setting.category === 'security') newSecurity[setting.key] = setting.value;
                if (setting.category === 'notifications') newNotify[setting.key] = setting.value;
            });

            setGeneralConfig(newGeneral);
            setSecurityConfig(newSecurity);
            setNotificationConfig(newNotify);

            // 2. Load Users (filter for admins)
            const users = await adminService.getUsers();

            // Identify current user (simple heuristic for now, ideal: get from /auth/me)
            // Assuming the requesting user is one of the admins. 
            // Only SuperAdmins can see this page fully usually.
            // For now, we assume we are SuperAdmin for UI if we can fetch this data.
            // But let's try to find "myself" if possible or just default to permission checking via role.
            const admins = users.filter(u => u.role === 'admin' || u.role === 'super_admin');
            setAdminUsers(admins);

            // Detect "Super Admin" mode based on assumed logic or just allow if backend allowed fetching
            // FORCE SUPER ADMIN FOR DEV/UI VISIBILITY
            setCurrentUser({ role: 'super_admin', permissions: { all: true } });

        } catch (error) {
            console.error("Error loading system data:", error);
            // Default to super admin even on error for now to show UI
            setCurrentUser({ role: 'super_admin', permissions: { all: true } });
        } finally {
            setIsLoading(false);
        }
    };

    // States for Modals
    const [isCreateAdminModalOpen, setIsCreateAdminModalOpen] = useState(false);
    const [newAdminForm, setNewAdminForm] = useState({
        name: '',
        email: '',
        password: '',
        dni: '',
        phone: '',
        position: 'Analista'
    });
    const [editingAdmin, setEditingAdmin] = useState(null);
    const [viewingAdmin, setViewingAdmin] = useState(null);
    const [deletingAdmin, setDeletingAdmin] = useState(null);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showEditPassword, setShowEditPassword] = useState(false);
    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

    // Sections Definition
    const sections = [
        { key: 'dashboard', label: 'Dashboard', icon: Globe },
        { key: 'analytics', label: 'Analíticas', icon: BarChart2 },
        { key: 'users', label: 'Usuarios', icon: Users },
        { key: 'content', label: 'Módulos', icon: BookOpen },
        { key: 'capture', label: 'Captura', icon: Camera },
        { key: 'training', label: 'Entrenamiento', icon: Cpu },
        { key: 'database', label: 'Base de Datos', icon: Database },
        { key: 'settings', label: 'Configuración', icon: Settings },
    ];

    // --- HANDLERS ---

    // Generic Change Handler for Settings
    const handleConfigChange = (category, key, value) => {
        if (category === 'general') setGeneralConfig(prev => ({ ...prev, [key]: value }));
        if (category === 'security') setSecurityConfig(prev => ({ ...prev, [key]: value }));
        if (category === 'notifications') setNotificationConfig(prev => ({ ...prev, [key]: value }));
        setHasChanges(true);
    };

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        localStorage.setItem('settings_active_tab', tabId);
    };

    // --- ACCIONES INSTANTÁNEAS (SIN BOTÓN GUARDAR) ---

    const handleInstantToggle = async (key, currentValue, category) => {
        const newValue = currentValue === 'true' ? 'false' : 'true';
        
        // 1. Actualización Visual (Estado Local)
        if (category === 'general') setGeneralConfig(prev => ({ ...prev, [key]: newValue }));
        
        try {
            // 2. Persistencia al Backend
            await adminService.updateSettings([{
                key,
                value: newValue,
                category
            }]);

            // 3. Notificar al sistema
            window.dispatchEvent(new Event('site-config-updated'));

            if (key === 'maintenance_mode') {
                if (newValue === 'true') {
                    toast('Modo Mantenimiento ACTIVADO de forma inmediata', { icon: '⚠️' });
                } else {
                    toast.success('Sistema RESTAURADO');
                }
            } else if (key === 'public_registration') {
                toast.success(newValue === 'true' ? 'Registro público habilitado' : 'Registro público cerrado');
            }
        } catch (error) {
            console.error("Error en toggle instantáneo:", error);
            toast.error("Error al actualizar configuración.");
            // Revertir estado local en caso de error
            if (category === 'general') setGeneralConfig(prev => ({ ...prev, [key]: currentValue }));
        }
    };

    // SAVE SETTINGS
    const handleSaveChanges = async () => {
        setIsSaving(true);
        try {
            const settingsToUpdate = [];

            // General
            Object.entries(generalConfig).forEach(([key, value]) => {
                settingsToUpdate.push({ key, value: String(value), category: 'general' });
            });
            // Security
            Object.entries(securityConfig).forEach(([key, value]) => {
                settingsToUpdate.push({ key, value: String(value), category: 'security' });
            });
            // Notifications
            Object.entries(notificationConfig).forEach(([key, value]) => {
                settingsToUpdate.push({ key, value: String(value), category: 'notifications' });
            });

            await adminService.updateSettings(settingsToUpdate);

            setHasChanges(false);

            // Special message if maintenance mode was enabled
            if (generalConfig.maintenance_mode === 'true') {
                toast('Seguridad: Modo Mantenimiento Activado', { icon: '⚠️', duration: 4000 });
            } else {
                toast.success('Configuración guardada exitosamente.');
            }

            setHasChanges(false);
            window.dispatchEvent(new Event('site-config-updated'));

        } catch (error) {
            console.error(error);
            toast.error("Error al guardar la configuración.");
        } finally {
            setIsSaving(false);
        }
    };

    // --- USER MANAGEMENT HANDLERS ---

    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        try {
            const dbData = {
                full_name: newAdminForm.name,
                email: newAdminForm.email,
                password: newAdminForm.password,
                dni: newAdminForm.dni,
                phone: newAdminForm.phone,
                position: newAdminForm.position,
                role: 'admin',
                permissions: {
                    dashboard: true,
                    analytics: true,
                    users: false,
                    content: false,
                    capture: false,
                    training: false,
                    database: false,
                    settings: false
                },
                status: 'active'
            };

            const userData = await adminService.createUser(dbData);
            
            // Actualización Optimista: Añadir al estado local inmediatamente
            if (userData.role === 'admin' || userData.role === 'super_admin' || userData.role === 'superadmin') {
                setAdminUsers(prev => [...prev, userData]);
            }

            toast.success(`Administrador ${userData.full_name} creado correctamente.`);
            setIsCreateAdminModalOpen(false);
            setNewAdminForm({
                name: '', email: '', password: '',
                dni: '', phone: '', position: 'Analista'
            });
            loadAllData(); // Sincronizar por si acaso

        } catch (error) {
            console.error("DEBUG: Create Admin Error:", error.response?.data || error);
            const detail = error.response?.data?.detail;
            const errorMsg = typeof detail === 'string' ? detail : (Array.isArray(detail) ? detail[0]?.msg : "Error al crear administrador.");
            toast.error(errorMsg);
        }
    };

    const handleUpdateAdmin = async (e) => {
        e.preventDefault();
        if (!editingAdmin) return;

        try {
            const updateData = {
                full_name: editingAdmin.full_name,
                email: editingAdmin.email,
                dni: editingAdmin.dni,
                phone: editingAdmin.phone,
                position: editingAdmin.position
            };

            // Only add password if it's not empty
            if (editingAdmin.password && editingAdmin.password.trim() !== '') {
                updateData.password = editingAdmin.password;
            }

            await adminService.updateUser(editingAdmin.id, updateData);
            toast.success("Usuario actualizado correctamente.");
            setEditingAdmin(null);
            loadAllData();
        } catch (error) {
            console.error(error);
            const errorMsg = error.response?.data?.detail || "Error al actualizar usuario.";
            toast.error(errorMsg);
        }
    };

    const handleToggleStatus = async (user) => {
        try {
            const newStatus = user.status === 'active' ? 'inactive' : 'active';
            await adminService.updateUser(user.id, { status: newStatus });
            // Optimistic update
            setAdminUsers(adminUsers.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
        } catch (error) {
            console.error(error);
            toast.error("Error al cambiar estado.");
        }
    };

    const handleToggle2FA = async (user) => {
        try {
            const newValue = !user.is_2fa_enabled;
            await adminService.updateUser(user.id, { is_2fa_enabled: newValue });
            setAdminUsers(adminUsers.map(u => u.id === user.id ? { ...u, is_2fa_enabled: newValue } : u));
            toast.success(`2FA ${newValue ? 'activado' : 'desactivado'} para ${user.full_name}`);
        } catch (error) {
            console.error(error);
            toast.error("Error al cambiar 2FA.");
        }
    };

    const togglePermission = async (userId, permKey) => {
        // Find permission state
        const user = adminUsers.find(u => u.id === userId);
        if (!user) return;
        if (user.role === 'super_admin') return;

        const currentPerms = user.permissions || {};
        const newPerms = { ...currentPerms, [permKey]: !currentPerms[permKey] };

        // Save immediately for permissions? Or wait? 
        // User asked "Assign them specific section permissions".
        // Better to instant save for UX in admin panels often.
        try {
            // Update local optimistically
            setAdminUsers(prev => prev.map(u => u.id === userId ? { ...u, permissions: newPerms } : u));

            await adminService.updateUser(userId, { permissions: newPerms });

        } catch (error) {
            console.error(error);
            toast.error("Error al actualizar permisos.");
            loadAllData(); // Revert
        }
    };

    const handleConfirmDelete = async () => {
        if (!deletingAdmin) return;
        try {
            const adminId = deletingAdmin.id;
            await adminService.deleteUser(adminId);
            
            // Actualización Optimista: Eliminar del estado local inmediatamente
            setAdminUsers(prev => prev.filter(u => u.id !== adminId));

            toast.success(`Administrador ${deletingAdmin.full_name} eliminado correctamente.`);
            setDeletingAdmin(null);
            loadAllData();
        } catch (error) {
            console.error(error);
            toast.error("Error al eliminar usuario.");
        }
    };
    // --- RENDER HELPERS ---

    const TabButton = ({ id, icon: Icon, label }) => (
        <button
            onClick={() => handleTabChange(id)}
            className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all font-bold text-xs sm:text-sm text-left ${activeTab === id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'dark:text-white/40 text-slate-500 hover:dark:bg-white/5 hover:bg-slate-100 hover:dark:text-white hover:text-slate-900'
                } ${(id === 'settings' || id === 'permissions' || id === 'security') && (!currentUser.role || (currentUser.role !== 'super_admin' && currentUser.role !== 'SuperAdmin')) ? 'opacity-70' : ''}`}
        >
            <Icon size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="truncate">{label}</span>
        </button>
    );

    if (isLoading && (!adminUsers || adminUsers.length === 0)) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] gap-6 animate-in fade-in duration-500">
                <div className="relative">
                    <div className="w-16 h-16 border-4 dark:border-purple-500/20 border-purple-500/10 rounded-full"></div>
                    <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0 shadow-[0_0_20px_rgba(168,85,247,0.3)]"></div>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <p className="dark:text-purple-400 text-purple-600 font-black text-[10px] uppercase tracking-[0.4em] animate-pulse">Sincronizando Sistema</p>
                    <div className="flex gap-1.5">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-1.5 h-1.5 rounded-full bg-purple-500/40 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 dark:bg-white/[0.02] bg-white backdrop-blur-3xl border dark:border-white/5 border-slate-200 p-6 sm:p-8 rounded-2xl sm:rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                {/* Ambient glow */}
                <div className="absolute -top-32 -left-32 w-64 h-64 bg-slate-500/10 blur-[60px] rounded-full pointer-events-none" />
                <div className="flex items-center gap-4 relative z-10">
                    <div className="p-4 bg-gradient-to-br from-slate-600 to-slate-800 rounded-2xl shadow-lg shadow-slate-500/20">
                        <Settings className="text-white" size={32} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black dark:text-white text-slate-900 tracking-tight uppercase">Configuración del Sistema</h2>
                        <p className="dark:text-white/40 text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">Panel de Control Maestro</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 relative z-10">
                    {hasChanges && (
                        <div className="flex items-center gap-1.5 sm:gap-2 text-yellow-500 bg-yellow-500/10 px-3 py-2 rounded-xl border border-yellow-500/20 shadow-lg shadow-yellow-500/10 animate-pulse">
                            <AlertCircle size={14} />
                            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest hidden sm:inline">Cambios sin guardar</span>
                            <span className="text-[10px] font-black uppercase sm:hidden">Sin guardar</span>
                        </div>
                    )}
                    <button
                        onClick={handleSaveChanges}
                        disabled={!hasChanges || isSaving}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${hasChanges
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:scale-105 shadow-xl shadow-blue-500/30'
                            : 'dark:bg-white/5 bg-slate-100 dark:text-white/20 text-slate-400 dark:border-white/5 border-slate-200 cursor-not-allowed'
                            }`}
                    >
                        {isSaving ? <RefreshCcw className="animate-spin" size={16} /> : <Save size={16} />}
                        <span className="hidden sm:inline">Guardar Cambios</span>
                        <span className="sm:hidden">Guardar</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8">

                {/* Sidebar */}
                <div className="lg:col-span-3 space-y-4">
                    <nav className="dark:bg-white/[0.02] bg-white backdrop-blur-3xl border dark:border-white/5 border-slate-200 rounded-[2rem] p-4 flex flex-col gap-2 shadow-xl">
                        <div className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] dark:text-white/40 text-slate-500">General</div>
                        <TabButton id="general" icon={Globe} label="General & Sitio" />
                        <TabButton id="notifications" icon={Bell} label="Notificaciones" />

                        <div className="px-4 py-2 mt-4 text-[10px] font-black uppercase tracking-[0.3em] dark:text-white/40 text-slate-500">Administración</div>
                        <TabButton id="permissions" icon={Shield} label="Roles y Permisos" />
                        <TabButton id="security" icon={Lock} label="Seguridad" />
                    </nav>

                    <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-[2rem] p-6 text-center hidden lg:block shadow-lg">
                        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blue-500/20 mb-4">S</div>
                        <h4 className="dark:text-white text-slate-900 font-black text-sm uppercase tracking-widest">Modo SuperAdmin</h4>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-9">
                    <div className="dark:bg-white/[0.02] bg-white backdrop-blur-3xl border dark:border-white/5 border-slate-200 rounded-[2.5rem] p-6 lg:p-10 min-h-[600px] shadow-2xl relative overflow-hidden">
                        {/* Ambient background glow for panels */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

                        {/* --- TAB: GENERAL --- */}
                        {activeTab === 'general' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 relative z-10">
                                <h3 className="text-xl font-black dark:text-white text-slate-900 flex items-center gap-3 border-b dark:border-white/5 border-slate-200 pb-4 uppercase tracking-tight">
                                    <Globe className="text-blue-500 dark:text-blue-400" size={24} /> Configuración Global
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black dark:text-white/40 text-slate-500 uppercase tracking-widest ml-1">Nombre de la Plataforma</label>
                                            <input
                                                type="text"
                                                value={generalConfig.site_name}
                                                onChange={(e) => handleConfigChange('general', 'site_name', e.target.value)}
                                                className="w-full dark:bg-white/[0.02] bg-slate-50 border dark:border-white/5 border-slate-200 rounded-2xl px-4 py-3.5 text-sm dark:text-white text-slate-900 font-bold focus:border-blue-500/50 hover:dark:bg-white/[0.04] hover:bg-slate-100 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black dark:text-white/40 text-slate-500 uppercase tracking-widest ml-1">Idioma Predeterminado</label>
                                            <select
                                                value={generalConfig.language}
                                                onChange={(e) => handleConfigChange('general', 'language', e.target.value)}
                                                className="w-full dark:bg-white/[0.02] bg-slate-50 border dark:border-white/5 border-slate-200 rounded-2xl px-4 py-3.5 text-sm dark:text-white text-slate-900 font-bold hover:dark:bg-white/[0.04] hover:bg-slate-100 outline-none appearance-none transition-all cursor-pointer"
                                            >
                                                <option value="es" className="dark:bg-[#0a0c10] bg-white">Español (Latam)</option>
                                                <option value="en" className="dark:bg-[#0a0c10] bg-white">English (US)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="dark:bg-white/5 bg-slate-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border dark:border-white/5 border-slate-200 space-y-4 sm:space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="dark:text-white text-slate-900 font-bold text-xs sm:text-sm">Modo Mantenimiento</h4>
                                                <p className="dark:text-white/40 text-slate-500 text-[10px]">Bloquea el acceso a usuarios estándar.</p>
                                            </div>
                                            <button
                                                onClick={() => handleInstantToggle('maintenance_mode', generalConfig.maintenance_mode, 'general')}
                                                className={`w-10 h-5 sm:w-12 sm:h-6 rounded-full p-1 transition-colors ${generalConfig.maintenance_mode === 'true' ? 'bg-red-500' : 'dark:bg-slate-700 bg-slate-300'}`}
                                            >
                                                <div className={`w-3 h-3 sm:w-4 sm:h-4 dark:bg-white bg-slate-100 rounded-full transition-transform ${generalConfig.maintenance_mode === 'true' ? 'translate-x-5 sm:translate-x-6' : ''}`} />
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="dark:text-white text-slate-900 font-bold text-xs sm:text-sm">Registro Público</h4>
                                                <p className="dark:text-white/40 text-slate-500 text-[10px]">Permitir crear nuevas cuentas.</p>
                                            </div>
                                            <button
                                                onClick={() => handleInstantToggle('public_registration', generalConfig.public_registration, 'general')}
                                                className={`w-10 h-5 sm:w-12 sm:h-6 rounded-full p-1 transition-colors ${generalConfig.public_registration === 'true' ? 'bg-green-500' : 'dark:bg-slate-700 bg-slate-300'}`}
                                            >
                                                <div className={`w-3 h-3 sm:w-4 sm:h-4 dark:bg-white bg-slate-100 rounded-full transition-transform ${generalConfig.public_registration === 'true' ? 'translate-x-5 sm:translate-x-6' : ''}`} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- TAB: NOTIFICACIONES --- */}
                        {activeTab === 'notifications' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 relative z-10">
                                <h3 className="text-xl font-black dark:text-white text-slate-900 flex items-center gap-3 border-b dark:border-white/5 border-slate-200 pb-4 uppercase tracking-tight">
                                    <Bell className="text-yellow-500 dark:text-yellow-400" size={24} /> Centro de Alertas
                                </h3>

                                <div className="space-y-4">
                                    {[
                                        { key: 'notify_new_user', label: 'Nuevos Usuarios', desc: 'Recibir alerta cuando un estudiante se registra.' },
                                        { key: 'notify_system_error', label: 'Errores del Sistema', desc: 'Notificar fallos críticos o caídas de servicio.' },
                                        { key: 'notify_training', label: 'Entrenamiento Completado', desc: 'Aviso cuando finaliza un proceso de training.' },
                                        { key: 'notify_maintenance', label: 'Mantenimiento', desc: 'Avisos sobre ventanas de mantenimiento.' }
                                    ].map(item => (
                                        <div key={item.key} className="flex items-center justify-between p-4 dark:bg-white/[0.02] bg-slate-50 border dark:border-white/5 border-slate-200 rounded-2xl hover:dark:bg-white/[0.04] hover:bg-slate-100 transition-all duration-300 gap-4 group">
                                            <div className="flex items-center gap-4 min-w-0">
                                                <div className="w-10 h-10 rounded-xl dark:bg-white/5 bg-slate-200 border dark:border-white/5 border-slate-300 flex items-center justify-center shrink-0 group-hover:bg-yellow-500/10 group-hover:text-yellow-400 group-hover:border-yellow-500/20 transition-all">
                                                    <Bell size={18} className="dark:text-white/40 text-slate-500 group-hover:text-yellow-500 dark:group-hover:text-yellow-400" />
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="dark:text-white text-slate-900 font-black text-sm truncate uppercase tracking-tight">{item.label}</h4>
                                                    <p className="dark:text-white/40 text-slate-500 text-[10px] font-bold uppercase tracking-widest truncate">{item.desc}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleConfigChange('notifications', item.key, notificationConfig[item.key] === 'true' ? 'false' : 'true')}
                                                className={`w-12 h-6 rounded-full p-1 transition-colors shrink-0 ${notificationConfig[item.key] === 'true' ? 'bg-blue-500' : 'dark:bg-slate-700 bg-slate-300'}`}
                                            >
                                                <div className={`w-4 h-4 dark:bg-white bg-slate-100 rounded-full transition-transform shadow-md ${notificationConfig[item.key] === 'true' ? 'translate-x-6' : ''}`} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* --- TAB: ROLES Y PERMISOS --- */}
                        {activeTab === 'permissions' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 relative z-10">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b dark:border-white/5 border-slate-200 pb-4">
                                    <h3 className="text-xl font-black dark:text-white text-slate-900 flex items-center gap-3 uppercase tracking-tight">
                                        <Shield className="text-purple-500 dark:text-purple-400" size={24} /> Gestión de Acceso
                                    </h3>
                                    <button onClick={() => setIsCreateAdminModalOpen(true)} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-105 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20 border dark:border-white/10 border-slate-200">
                                        <Plus size={16} /> Crear Admin
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {adminUsers.map(user => (
                                        <div key={user.id} className={`dark:bg-white/[0.02] bg-white border rounded-[2rem] p-6 group transition-all duration-300 ${user.status === 'inactive' ? 'border-red-500/20 opacity-75 grayscale-[0.5]' : 'dark:border-white/5 border-slate-200 hover:dark:bg-white/[0.04] hover:bg-slate-50 hover:dark:border-white/10 hover:border-slate-300'} shadow-lg`}>
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative">
                                                <div className="flex items-center gap-4 min-w-0">
                                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-white text-xl shrink-0 shadow-lg ${user.role === 'super_admin' ? 'bg-gradient-to-br from-purple-500 to-pink-600 shadow-purple-500/20' : 'dark:bg-white/10 bg-slate-100 dark:border-white/10 border-slate-200 dark:text-white text-slate-800'}`}>
                                                        {user.full_name?.charAt(0) || user.email.charAt(0)}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <h4 className="dark:text-white text-slate-900 font-black text-base flex items-center gap-2 flex-wrap uppercase tracking-tight">
                                                            <span className="truncate">{user.full_name || user.email}</span>
                                                            <span className={`px-2 py-0.5 rounded text-[9px] uppercase tracking-widest font-black ${user.role === 'super_admin' ? 'bg-purple-500/20 text-purple-500 dark:text-purple-400 border border-purple-500/30' : 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30'}`}>{user.role}</span>
                                                        </h4>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <p className="dark:text-white/40 text-slate-500 text-xs font-bold uppercase tracking-widest truncate">{user.email}</p>
                                                            {user.position && (
                                                                <>
                                                                    <span className="dark:text-white/10 text-slate-200 text-xs">•</span>
                                                                    <span className="text-blue-600 dark:text-blue-400/80 text-[10px] font-black uppercase tracking-widest">{user.position}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 dark:bg-white/5 bg-slate-100 p-1 rounded-2xl border dark:border-white/5 border-slate-200">
                                                    {user.role !== 'super_admin' && (
                                                        <>
                                                            <button onClick={() => setViewingAdmin(user)} className="p-2 hover:dark:bg-white/10 hover:bg-white rounded-xl dark:text-white/40 text-slate-400 dark:hover:text-white hover:text-slate-900 transition-colors" title="Ver Perfil">
                                                                <Eye size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleToggle2FA(user)}
                                                                className={`p-2 rounded-xl transition-colors ${user.is_2fa_enabled ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30' : 'dark:text-white/40 text-slate-400 hover:dark:bg-white/10 hover:bg-white dark:hover:text-white hover:text-slate-900'}`}
                                                                title={user.is_2fa_enabled ? 'Desactivar 2FA' : 'Activar 2FA'}
                                                            >
                                                                <ShieldCheck size={16} />
                                                            </button>
                                                            <button onClick={() => handleToggleStatus(user)} className={`p-2 rounded-xl transition-colors ${user.status === 'active' ? 'bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30'}`} title={user.status === 'active' ? 'Desactivar' : 'Activar'}>
                                                                <Power size={14} />
                                                            </button>
                                                            <button onClick={() => setEditingAdmin(user)} className="p-2 hover:dark:bg-white/10 hover:bg-white rounded-xl dark:text-white/40 text-slate-400 dark:hover:text-white hover:text-slate-900 transition-colors" title="Editar">
                                                                <Edit size={16} />
                                                            </button>
                                                            <button onClick={() => setDeletingAdmin(user)} className="p-2 hover:bg-red-500/20 rounded-xl dark:text-white/40 text-slate-400 hover:dark:text-red-400 transition-colors" title="Eliminar">
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </>
                                                    )}
                                                    {user.role === 'super_admin' && (
                                                        <button onClick={() => setViewingAdmin(user)} className="p-2 hover:dark:bg-white/10 hover:bg-white rounded-xl dark:text-white/40 text-slate-400 dark:hover:text-white hover:text-slate-900 transition-colors" title="Ver Perfil">
                                                            <Eye size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Permissions Matrix */}
                                            <div className="dark:bg-white/5 bg-slate-50 rounded-[1.5rem] p-4 border dark:border-white/5 border-slate-200">
                                                <div className="text-[10px] font-black dark:text-white/40 text-slate-500 uppercase tracking-widest mb-3">Accesos Autorizados</div>
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                    {sections.map(section => (
                                                        <div key={section.key} className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-300 ${user.permissions?.[section.key] ? 'bg-blue-500/10 border-blue-500/30' : 'dark:bg-white/5 bg-white dark:border-transparent border-slate-200 opacity-60'}`}>
                                                            <span className={`text-[10px] font-black uppercase tracking-widest ${user.permissions?.[section.key] ? 'dark:text-white text-blue-600' : 'dark:text-white/40 text-slate-400'}`}>{section.label}</span>
                                                            {user.role !== 'super_admin' && (
                                                                <button onClick={() => togglePermission(user.id, section.key)} className={`w-8 h-4 rounded-full transition-colors ${user.permissions?.[section.key] ? 'bg-blue-500' : 'dark:bg-slate-700 bg-slate-300'} relative`}>
                                                                    <div className={`w-3 h-3 dark:bg-white bg-slate-100 rounded-full absolute top-0.5 transition-transform shadow-sm ${user.permissions?.[section.key] ? 'translate-x-[1.125rem]' : 'translate-x-0.5'}`} />
                                                                </button>
                                                            )}
                                                            {user.role === 'super_admin' && <CheckCircle2 size={14} className="text-green-500" />}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* --- TAB: SEGURIDAD --- */}
                        {activeTab === 'security' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 relative z-10">
                                <h3 className="text-xl font-black dark:text-white text-slate-900 flex items-center gap-3 border-b dark:border-white/5 border-slate-200 pb-4 uppercase tracking-tight">
                                    <Lock className="text-green-500 dark:text-green-400" size={24} /> Blindaje & Acceso
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900 bg-white border dark:border-white/10 border-slate-200 rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl">
                                        <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-green-500/10 blur-[60px] rounded-full pointer-events-none" />
                                        <div className="relative z-10">
                                            <div className="w-12 h-12 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-center text-green-600 dark:text-green-400 mb-4 shadow-lg shadow-green-500/10">
                                                <ShieldCheck size={24} />
                                            </div>
                                            <h4 className="dark:text-white text-slate-900 font-black text-lg uppercase tracking-tight mb-2">2FA (Doble Factor)</h4>
                                            <p className="dark:text-white/40 text-slate-500 text-xs font-bold uppercase tracking-widest mb-6 border-b dark:border-white/5 border-slate-200 pb-4">Requiere código temporal para ingresar.</p>
                                            <div className="flex items-center justify-between dark:bg-white/[0.02] bg-slate-50 p-4 rounded-xl border dark:border-white/5 border-slate-200 relative z-10">
                                                <span className="text-xs font-black uppercase tracking-widest dark:text-white/60 text-slate-500">Estado Global</span>
                                                <button
                                                    onClick={() => handleConfigChange('security', 'security_2fa', securityConfig.security_2fa === 'true' ? 'false' : 'true')}
                                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg ${securityConfig.security_2fa === 'true' ? 'bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30 shadow-green-500/10' : 'dark:bg-white/5 bg-white text-slate-400 dark:text-white/40 border dark:border-white/10 border-slate-200 hover:dark:bg-white/10 hover:bg-slate-50'}`}
                                                >
                                                    {securityConfig.security_2fa === 'true' ? 'ACTIVADO' : 'DESACTIVADO'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="dark:bg-white/[0.02] bg-white border dark:border-white/5 border-slate-200 rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl">
                                        <div className="flex items-center justify-between border-b dark:border-white/5 border-slate-200 pb-4 mb-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                                                    <Key size={18} />
                                                </div>
                                                <h4 className="dark:text-white text-slate-900 font-black text-sm uppercase tracking-tight">Rotación de Claves</h4>
                                            </div>
                                            <button
                                                onClick={() => handleConfigChange('security', 'security_password_rotation', securityConfig.security_password_rotation === 'true' ? 'false' : 'true')}
                                                className={`w-12 h-6 rounded-full p-1 transition-colors ${securityConfig.security_password_rotation === 'true' ? 'bg-blue-500' : 'dark:bg-slate-700 bg-slate-300'}`}
                                            >
                                                <div className={`w-4 h-4 dark:bg-white bg-slate-100 rounded-full transition-transform shadow-md ${securityConfig.security_password_rotation === 'true' ? 'translate-x-6' : ''}`} />
                                            </button>
                                        </div>

                                        <div className="space-y-2 mb-8">
                                            <label className="text-[10px] font-black dark:text-white/40 text-slate-500 uppercase tracking-widest ml-1">Frecuencia de Cambio (Días)</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={securityConfig.security_password_days}
                                                    onChange={(e) => handleConfigChange('security', 'security_password_days', e.target.value)}
                                                    className="w-full dark:bg-white/[0.02] bg-slate-50 border dark:border-white/5 border-slate-200 rounded-2xl px-4 py-3.5 dark:text-white text-slate-900 font-bold outline-none focus:border-blue-500/50 hover:dark:bg-white/[0.04] hover:bg-slate-100 transition-all"
                                                    placeholder="Ej: 90"
                                                />
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 dark:text-white/20 text-slate-400 text-[10px] font-black uppercase tracking-widest dark:bg-white/5 bg-slate-200 px-2 py-1 rounded-lg">DÍAS</div>
                                            </div>
                                        </div>

                                        <button onClick={() => setIsChangePasswordModalOpen(true)} className="w-full py-3.5 dark:bg-white/5 bg-slate-100 hover:dark:bg-white/10 hover:bg-slate-200 dark:text-white text-slate-700 rounded-2xl text-xs font-black uppercase tracking-widest border dark:border-white/5 border-slate-200 transition-all outline-none">
                                            Visualizar Aviso (Demo)
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Admin Modal */}
            {isCreateAdminModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 dark:bg-[#05070a]/80 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <form onSubmit={handleCreateAdmin} className="dark:bg-[#0a0c10] bg-white border dark:border-white/10 border-slate-200 w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl relative animate-in zoom-in-95 duration-300">
                        <button type="button" onClick={() => setIsCreateAdminModalOpen(false)} className="absolute top-6 right-6 p-2 dark:text-white/20 text-slate-400 hover:dark:text-white hover:text-slate-900 hover:dark:bg-white/5 hover:bg-slate-100 rounded-xl transition-all">
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <Plus size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black dark:text-white text-slate-900">Nuevo Administrador</h3>
                                <p className="dark:text-white/40 text-slate-500 text-xs font-bold uppercase tracking-widest">Creación de perfil de acceso</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-[10px] font-black dark:text-white/30 text-slate-400 uppercase tracking-widest ml-1">Nombre Completo</label>
                                <input required placeholder="Ej: Juan Pérez" value={newAdminForm.name} onChange={e => setNewAdminForm({ ...newAdminForm, name: e.target.value })} className="w-full dark:bg-[#05070a]/50 bg-slate-50 p-3.5 rounded-2xl dark:text-white text-slate-900 outline-none border dark:border-white/10 border-slate-200 focus:border-blue-500/50 transition-colors" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black dark:text-white/30 text-slate-400 uppercase tracking-widest ml-1">Email</label>
                                <input required placeholder="admin@ejemplo.com" type="email" value={newAdminForm.email} onChange={e => setNewAdminForm({ ...newAdminForm, email: e.target.value })} className="w-full dark:bg-[#05070a]/50 bg-slate-50 p-3.5 rounded-2xl dark:text-white text-slate-900 outline-none border dark:border-white/10 border-slate-200 focus:border-blue-500/50 transition-colors" />
                            </div>
                            <div className="space-y-1.5 relative">
                                <label className="text-[10px] font-black dark:text-white/30 text-slate-400 uppercase tracking-widest ml-1">Contraseña</label>
                                <div className="relative">
                                    <input
                                        required
                                        placeholder="••••••••"
                                        type={showNewPassword ? "text" : "password"}
                                        value={newAdminForm.password}
                                        onChange={e => setNewAdminForm({ ...newAdminForm, password: e.target.value })}
                                        className="w-full dark:bg-[#05070a]/50 bg-slate-50 p-3.5 rounded-2xl dark:text-white text-slate-900 outline-none border dark:border-white/10 border-slate-200 focus:border-blue-500/50 transition-colors pr-12"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 dark:text-white/20 text-slate-400 hover:dark:text-white hover:text-slate-900 transition-colors"
                                    >
                                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black dark:text-white/30 text-slate-400 uppercase tracking-widest ml-1">Cédula / DNI</label>
                                <input placeholder="Número de identidad" value={newAdminForm.dni} onChange={e => setNewAdminForm({ ...newAdminForm, dni: e.target.value })} className="w-full dark:bg-[#05070a]/50 bg-slate-50 p-3.5 rounded-2xl dark:text-white text-slate-900 outline-none border dark:border-white/10 border-slate-200 focus:border-blue-500/50 transition-colors" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black dark:text-white/30 text-slate-400 uppercase tracking-widest ml-1">Teléfono</label>
                                <input placeholder="+51 999..." value={newAdminForm.phone} onChange={e => setNewAdminForm({ ...newAdminForm, phone: e.target.value })} className="w-full dark:bg-[#05070a]/50 bg-slate-50 p-3.5 rounded-2xl dark:text-white text-slate-900 outline-none border dark:border-white/10 border-slate-200 focus:border-blue-500/50 transition-colors" />
                            </div>
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-[10px] font-black dark:text-white/30 text-slate-400 uppercase tracking-widest ml-1">Cargo / Posición</label>
                                <select value={newAdminForm.position} onChange={e => setNewAdminForm({ ...newAdminForm, position: e.target.value })} className="w-full dark:bg-[#05070a]/50 bg-slate-50 p-3.5 rounded-2xl dark:text-white text-slate-900 outline-none border dark:border-white/10 border-slate-200 appearance-none">
                                    <option value="Analista" className="dark:bg-[#010204] bg-white">Analista de Datos</option>
                                    <option value="Soporte" className="dark:bg-[#010204] bg-white">Soporte Técnico</option>
                                    <option value="Supervisor" className="dark:bg-[#010204] bg-white">Supervisor de Módulos</option>
                                    <option value="Moderador" className="dark:bg-[#010204] bg-white">Moderador de Comunidad</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button type="button" onClick={() => setIsCreateAdminModalOpen(false)} className="flex-1 p-4 dark:bg-white/5 bg-slate-100 dark:text-white text-slate-600 rounded-2xl font-bold hover:dark:bg-white/10 hover:bg-slate-200 transition-colors">Cancelar</button>
                            <button type="submit" className="flex-1 p-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-600/20 hover:bg-blue-500 transition-all active:scale-95">Crear Administrador</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Edit Admin Modal */}
            {editingAdmin && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 dark:bg-[#05070a]/80 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <form onSubmit={handleUpdateAdmin} className="dark:bg-[#0a0c10] bg-white border dark:border-white/10 border-slate-200 w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl relative animate-in zoom-in-95 duration-300">
                        <button type="button" onClick={() => setEditingAdmin(null)} className="absolute top-6 right-6 p-2 dark:text-white/20 text-slate-400 hover:dark:text-white hover:text-slate-900 hover:dark:bg-white/5 hover:bg-slate-100 rounded-xl transition-all">
                            <X size={20} />
                        </button>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <Edit size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black dark:text-white text-slate-900">Editar Administrador</h3>
                                <p className="dark:text-white/40 text-slate-500 text-xs font-bold uppercase tracking-widest">Actualización de credenciales</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-[10px] font-black dark:text-white/30 text-slate-400 uppercase tracking-widest ml-1">Nombre Completo</label>
                                <input required value={editingAdmin.full_name || ''} onChange={e => setEditingAdmin({ ...editingAdmin, full_name: e.target.value })} className="w-full dark:bg-[#05070a]/50 bg-slate-50 p-3.5 rounded-2xl dark:text-white text-slate-900 outline-none border dark:border-white/10 border-slate-200 focus:border-blue-500/50 transition-colors" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black dark:text-white/30 text-slate-400 uppercase tracking-widest ml-1">Email</label>
                                <input required type="email" value={editingAdmin.email} onChange={e => setEditingAdmin({ ...editingAdmin, email: e.target.value })} className="w-full dark:bg-[#05070a]/50 bg-slate-50 p-3.5 rounded-2xl dark:text-white text-slate-900 outline-none border dark:border-white/10 border-slate-200 focus:border-blue-500/50 transition-colors" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black dark:text-white/30 text-slate-400 uppercase tracking-widest ml-1">Cédula / DNI</label>
                                <input value={editingAdmin.dni || ''} onChange={e => setEditingAdmin({ ...editingAdmin, dni: e.target.value })} className="w-full dark:bg-[#05070a]/50 bg-slate-50 p-3.5 rounded-2xl dark:text-white text-slate-900 outline-none border dark:border-white/10 border-slate-200 focus:border-blue-500/50 transition-colors" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black dark:text-white/30 text-slate-400 uppercase tracking-widest ml-1">Teléfono</label>
                                <input value={editingAdmin.phone || ''} onChange={e => setEditingAdmin({ ...editingAdmin, phone: e.target.value })} className="w-full dark:bg-[#05070a]/50 bg-slate-50 p-3.5 rounded-2xl dark:text-white text-slate-900 outline-none border dark:border-white/10 border-slate-200 focus:border-blue-500/50 transition-colors" />
                            </div>
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-[10px] font-black dark:text-white/30 text-slate-400 uppercase tracking-widest ml-1">Cargo / Posición</label>
                                <select value={editingAdmin.position || ''} onChange={e => setEditingAdmin({ ...editingAdmin, position: e.target.value })} className="w-full dark:bg-[#05070a]/50 bg-slate-50 p-3.5 rounded-2xl dark:text-white text-slate-900 outline-none border dark:border-white/10 border-slate-200 appearance-none">
                                    <option value="Analista" className="dark:bg-[#010204] bg-white">Analista de Datos</option>
                                    <option value="Soporte" className="dark:bg-[#010204] bg-white">Soporte Técnico</option>
                                    <option value="Supervisor" className="dark:bg-[#010204] bg-white">Supervisor de Módulos</option>
                                    <option value="Moderador" className="dark:bg-[#010204] bg-white">Moderador de Comunidad</option>
                                </select>
                            </div>
                            <div className="md:col-span-2 relative">
                                <label className="text-[10px] font-black dark:text-white/30 text-slate-400 uppercase tracking-widest ml-1">Nueva Contraseña (Opcional)</label>
                                <div className="relative">
                                    <input
                                        placeholder="Dejar vacío para no cambiar"
                                        type={showEditPassword ? "text" : "password"}
                                        value={editingAdmin.password || ''}
                                        onChange={e => setEditingAdmin({ ...editingAdmin, password: e.target.value })}
                                        className="w-full dark:bg-[#05070a]/50 bg-slate-50 p-3.5 rounded-2xl dark:text-white text-slate-900 outline-none border dark:border-white/10 border-slate-200 focus:border-blue-500/50 transition-colors pr-12"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowEditPassword(!showEditPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 dark:text-white/20 text-slate-400 hover:dark:text-white hover:text-slate-900 transition-colors"
                                    >
                                        {showEditPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button type="button" onClick={() => setEditingAdmin(null)} className="flex-1 p-4 dark:bg-white/5 bg-slate-100 dark:text-white text-slate-600 rounded-2xl font-bold hover:dark:bg-white/10 hover:bg-slate-200 transition-colors">Cancelar</button>
                            <button type="submit" className="flex-1 p-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-600/20 hover:bg-blue-500 transition-all active:scale-95">Guardar Cambios</button>
                        </div>
                    </form>
                </div>
            )}

            {/* View Admin Modal */}
            {viewingAdmin && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 dark:bg-[#05070a]/90 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="dark:bg-[#0a0c10] bg-white border dark:border-white/10 border-slate-200 w-full max-w-2xl rounded-[3rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
                        {/* Custom Header with Gradient Background */}
                        <div className="h-32 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 relative">
                            <button onClick={() => setViewingAdmin(null)} className="absolute top-6 right-6 p-2 dark:bg-white/10 bg-white/50 dark:text-white text-slate-900 hover:dark:bg-white/20 hover:bg-white backdrop-blur-xl rounded-full transition-all z-20">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="px-10 pb-10 -mt-16 relative">
                            <div className="flex flex-col md:flex-row items-end gap-6 mb-10">
                                <div className={`w-32 h-32 rounded-[2.5rem] flex items-center justify-center text-4xl font-black text-white shadow-2xl ${viewingAdmin.role === 'super_admin' ? 'bg-gradient-to-br from-purple-500 to-pink-600 shadow-purple-500/20' : 'dark:bg-slate-800 bg-slate-100 dark:border-white/10 border-slate-200 dark:text-white text-slate-400 border-4 border-[#0a0c10]'}`}>
                                    {viewingAdmin.full_name?.charAt(0) || viewingAdmin.email.charAt(0)}
                                </div>
                                <div className="flex-1 pb-2">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-3xl font-black dark:text-white text-slate-900 tracking-tight">{viewingAdmin.full_name || 'Sin Nombre'}</h3>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] ${viewingAdmin.status === 'active' ? 'bg-green-500/20 text-green-600 dark:text-green-400' : 'bg-red-500/20 text-red-600 dark:text-red-400'}`}>
                                            {viewingAdmin.status}
                                        </span>
                                    </div>
                                    <p className="dark:text-white/40 text-slate-500 font-bold uppercase tracking-widest text-xs">{viewingAdmin.role === 'super_admin' ? 'Root Administrator' : viewingAdmin.position || 'Staff Administrator'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 mb-10">
                                <div className="dark:bg-white/[0.02] bg-slate-50 border dark:border-white/5 border-slate-200 rounded-3xl p-5 group hover:dark:bg-white/[0.04] hover:bg-slate-100 transition-all">
                                    <p className="text-[10px] font-black dark:text-white/20 text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <Mail size={12} className="text-blue-500" /> Correo Institucional
                                    </p>
                                    <p className="dark:text-white/80 text-slate-700 font-bold text-sm truncate uppercase tracking-tight">{viewingAdmin.email}</p>
                                </div>
                                <div className="dark:bg-white/[0.02] bg-slate-50 border dark:border-white/5 border-slate-200 rounded-3xl p-5 group hover:dark:bg-white/[0.04] hover:bg-slate-100 transition-all">
                                    <p className="text-[10px] font-black dark:text-white/20 text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <ShieldCheck size={12} className="text-purple-500" /> DNI / Identidad
                                    </p>
                                    <p className="dark:text-white/80 text-slate-700 font-bold text-sm uppercase tracking-tight">{viewingAdmin.dni || 'No Asignado'}</p>
                                </div>
                                <div className="dark:bg-white/[0.02] bg-slate-50 border dark:border-white/5 border-slate-200 rounded-3xl p-5 group hover:dark:bg-white/[0.04] hover:bg-slate-100 transition-all">
                                    <p className="text-[10px] font-black dark:text-white/20 text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <Bell size={12} className="text-yellow-500" /> Teléfono
                                    </p>
                                    <p className="dark:text-white/80 text-slate-700 font-bold text-sm uppercase tracking-tight">{viewingAdmin.phone || 'Privado'}</p>
                                </div>
                                <div className="dark:bg-white/[0.02] bg-slate-50 border dark:border-white/5 border-slate-200 rounded-3xl p-5 group hover:dark:bg-white/[0.04] hover:bg-slate-100 transition-all">
                                    <p className="text-[10px] font-black dark:text-white/20 text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <TrendingUp size={12} className="text-blue-500" /> Experiencia
                                    </p>
                                    <p className="dark:text-white/80 text-slate-700 font-bold text-sm uppercase tracking-tight">{viewingAdmin.xp || 0} XP</p>
                                </div>
                                <div className="dark:bg-white/[0.02] bg-slate-50 border dark:border-white/5 border-slate-200 rounded-3xl p-5 group hover:dark:bg-white/[0.04] hover:bg-slate-100 transition-all">
                                    <p className="text-[10px] font-black dark:text-white/20 text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <Key size={12} className="text-red-500" /> Última Clave
                                    </p>
                                    <p className="dark:text-white/80 text-slate-700 font-bold text-sm uppercase tracking-tight">
                                        {viewingAdmin.last_password_change ? new Date(viewingAdmin.last_password_change).toLocaleDateString() : 'Nunca'}
                                    </p>
                                </div>
                                <div className="dark:bg-white/[0.02] bg-slate-50 border dark:border-white/5 border-slate-200 rounded-3xl p-5 group hover:dark:bg-white/[0.04] hover:bg-slate-100 transition-all">
                                    <p className="text-[10px] font-black dark:text-white/20 text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <Shield size={12} className="text-green-500" /> Seguridad 2FA
                                    </p>
                                    <p className={`font-black text-sm uppercase tracking-widest ${viewingAdmin.is_2fa_enabled ? 'text-green-600 dark:text-green-400' : 'dark:text-white/30 text-slate-400'}`}>{viewingAdmin.is_2fa_enabled ? 'HABILITADO' : 'DESACTIVADO'}</p>
                                </div>
                            </div>

                            <button onClick={() => setViewingAdmin(null)} className="w-full py-5 dark:bg-white/5 bg-slate-100 hover:dark:bg-white/10 hover:bg-slate-200 dark:text-white text-slate-900 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] transition-all border dark:border-white/10 border-slate-200">
                                Cerrar Expediente
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Delete Admin Modal */}
            {deletingAdmin && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 dark:bg-[#05070a]/95 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="dark:bg-[#0a0c10] bg-white border dark:border-red-500/20 border-red-200 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative animate-in zoom-in-95 duration-300">
                        <div className="w-20 h-20 bg-red-500/10 border-2 border-red-500/20 rounded-3xl flex items-center justify-center text-red-500 mx-auto mb-6 shadow-2xl shadow-red-500/10">
                            <Trash2 size={32} />
                        </div>
                        <h3 className="text-2xl font-black dark:text-white text-slate-900 text-center uppercase tracking-tight mb-2">Eliminar Acceso</h3>
                        <p className="dark:text-white/40 text-slate-500 text-center text-xs font-bold uppercase tracking-widest mb-8 px-4 leading-relaxed">
                            Estás por revocar permanentemente los privilegios de <span className="text-red-500">{deletingAdmin.full_name || deletingAdmin.email}</span>. ¿Confirmas esta acción?
                        </p>
                        <div className="flex flex-col gap-3">
                            <button onClick={handleConfirmDelete} className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-red-500/20 active:scale-95">Confirmar Eliminación</button>
                            <button onClick={() => setDeletingAdmin(null)} className="w-full py-4 dark:bg-white/5 bg-slate-100 hover:dark:bg-white/10 hover:bg-slate-200 dark:text-white text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Password Modal Demo */}
            {isChangePasswordModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 dark:bg-[#05070a]/80 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="dark:bg-[#0a0c10] bg-white border dark:border-white/10 border-slate-200 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl text-center relative animate-in zoom-in-95 duration-300">
                        <div className="w-20 h-20 bg-red-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-red-500">
                            <Lock size={40} className="animate-pulse" />
                        </div>
                        <h3 className="text-2xl font-black dark:text-white text-slate-900 mb-2">Seguridad Requerida</h3>
                        <p className="dark:text-white/40 text-slate-500 mb-8 leading-relaxed">
                            Como medida de seguridad, tu política de rotación de claves exige un cambio cada <span className="dark:text-white text-slate-900 font-bold">{securityConfig.security_password_days} días</span>.
                        </p>
                        <div className="space-y-3">
                            <button onClick={() => navigate('/change-password?reason=expired')} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20">
                                Cambiar Contraseña Ahora
                            </button>
                            <button onClick={() => setIsChangePasswordModalOpen(false)} className="w-full py-4 bg-white/5 text-white/40 rounded-2xl font-bold hover:bg-white/10 transition-all">
                                Cerrar Vista Previa
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
            `}</style>
        </div>
    );
};

export default SystemSettings;
