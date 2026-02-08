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
    const [activeTab, setActiveTab] = useState('general');
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
        loadAllData();
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
            toast.success(`Administrador ${userData.full_name} creado correctamente.`);
            setIsCreateAdminModalOpen(false);
            setNewAdminForm({
                name: '', email: '', password: '',
                dni: '', phone: '', position: 'Analista'
            });
            loadAllData(); // Reload users

        } catch (error) {
            console.error(error);
            const errorMsg = error.response?.data?.detail || "Error al crear administrador.";
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
            await adminService.deleteUser(deletingAdmin.id);
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
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all font-bold text-xs sm:text-sm text-left ${activeTab === id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'text-white/40 hover:bg-white/5 hover:text-white'
                } ${(id === 'settings' || id === 'permissions' || id === 'security') && (!currentUser.role || (currentUser.role !== 'super_admin' && currentUser.role !== 'SuperAdmin')) ? 'opacity-70' : ''}`}
        >
            <Icon size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="truncate">{label}</span>
        </button>
    );

    if (isLoading) {
        return <div className="p-8 text-center text-white/50 animate-pulse">Cargando configuración...</div>;
    }

    return (
        <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 bg-slate-900/40 backdrop-blur-xl border border-white/10 p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-[2.5rem] shadow-2xl">
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-3 sm:p-4 bg-gradient-to-br from-slate-600 to-slate-800 rounded-xl sm:rounded-2xl shadow-lg shadow-slate-500/20">
                        <Settings className="text-white" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Configuración del Sistema</h2>
                        <p className="text-white/40 text-xs sm:text-sm">Panel de Control Maestro</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    {hasChanges && (
                        <div className="flex items-center gap-1.5 sm:gap-2 text-yellow-500 bg-yellow-500/10 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl animate-pulse">
                            <AlertCircle size={12} />
                            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest hidden sm:inline">Cambios sin guardar</span>
                            <span className="text-[10px] font-bold sm:hidden">Sin guardar</span>
                        </div>
                    )}
                    <button
                        onClick={handleSaveChanges}
                        disabled={!hasChanges || isSaving}
                        className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-sm uppercase tracking-widest transition-all ${hasChanges
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:scale-105 shadow-lg shadow-blue-500/30'
                            : 'bg-white/5 text-white/20 cursor-not-allowed'
                            }`}
                    >
                        {isSaving ? <RefreshCcw className="animate-spin" size={14} /> : <Save size={14} />}
                        <span className="hidden sm:inline">Guardar Cambios</span>
                        <span className="sm:hidden">Guardar</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8">

                {/* Sidebar */}
                <div className="lg:col-span-3 space-y-3 sm:space-y-4">
                    <nav className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-[2rem] p-2 sm:p-4 flex flex-col gap-1.5 sm:gap-2">
                        <div className="px-2 sm:px-4 py-1 sm:py-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white/20">General</div>
                        <TabButton id="general" icon={Globe} label="General & Sitio" />
                        <TabButton id="notifications" icon={Bell} label="Notificaciones" />

                        <div className="px-2 sm:px-4 py-1 sm:py-2 mt-2 sm:mt-4 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white/20">Administración</div>
                        <TabButton id="permissions" icon={Shield} label="Roles y Permisos" />
                        <TabButton id="security" icon={Lock} label="Seguridad" />
                    </nav>

                    <div className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border border-blue-500/20 rounded-xl sm:rounded-[2rem] p-4 sm:p-6 text-center hidden lg:block">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-blue-500 rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-bold text-xl sm:text-2xl shadow-lg mb-3 sm:mb-4">S</div>
                        <h4 className="text-white font-bold text-sm sm:text-base">Modo SuperAdmin</h4>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-9">
                    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-[2.5rem] p-4 sm:p-6 lg:p-8 min-h-[400px] sm:min-h-[600px] shadow-2xl">

                        {/* --- TAB: GENERAL --- */}
                        {activeTab === 'general' && (
                            <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3 sm:pb-4">
                                    <Globe className="text-blue-400" size={20} /> Configuración Global
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                                    <div className="space-y-3 sm:space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-white/60">Nombre de la Plataforma</label>
                                            <input
                                                type="text"
                                                value={generalConfig.site_name}
                                                onChange={(e) => handleConfigChange('general', 'site_name', e.target.value)}
                                                className="w-full bg-slate-950/50 border border-white/10 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white font-bold focus:border-blue-500/50 outline-none transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-white/60">Idioma Predeterminado</label>
                                            <select
                                                value={generalConfig.language}
                                                onChange={(e) => handleConfigChange('general', 'language', e.target.value)}
                                                className="w-full bg-slate-950/50 border border-white/10 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white font-bold outline-none appearance-none"
                                            >
                                                <option value="es">Español (Latam)</option>
                                                <option value="en">English (US)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="bg-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/5 space-y-4 sm:space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="text-white font-bold text-xs sm:text-sm">Modo Mantenimiento</h4>
                                                <p className="text-white/40 text-[10px]">Bloquea el acceso a usuarios estándar.</p>
                                            </div>
                                            <button
                                                onClick={() => handleConfigChange('general', 'maintenance_mode', generalConfig.maintenance_mode === 'true' ? 'false' : 'true')}
                                                className={`w-10 h-5 sm:w-12 sm:h-6 rounded-full p-1 transition-colors ${generalConfig.maintenance_mode === 'true' ? 'bg-red-500' : 'bg-slate-700'}`}
                                            >
                                                <div className={`w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full transition-transform ${generalConfig.maintenance_mode === 'true' ? 'translate-x-5 sm:translate-x-6' : ''}`} />
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="text-white font-bold text-xs sm:text-sm">Registro Público</h4>
                                                <p className="text-white/40 text-[10px]">Permitir crear nuevas cuentas.</p>
                                            </div>
                                            <button
                                                onClick={() => handleConfigChange('general', 'public_registration', generalConfig.public_registration === 'true' ? 'false' : 'true')}
                                                className={`w-10 h-5 sm:w-12 sm:h-6 rounded-full p-1 transition-colors ${generalConfig.public_registration === 'true' ? 'bg-green-500' : 'bg-slate-700'}`}
                                            >
                                                <div className={`w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full transition-transform ${generalConfig.public_registration === 'true' ? 'translate-x-5 sm:translate-x-6' : ''}`} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- TAB: NOTIFICACIONES --- */}
                        {activeTab === 'notifications' && (
                            <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3 sm:pb-4">
                                    <Bell className="text-yellow-400" size={20} /> Centro de Alertas
                                </h3>

                                <div className="space-y-3 sm:space-y-4">
                                    {[
                                        { key: 'notify_new_user', label: 'Nuevos Usuarios', desc: 'Recibir alerta cuando un estudiante se registra.' },
                                        { key: 'notify_system_error', label: 'Errores del Sistema', desc: 'Notificar fallos críticos o caídas de servicio.' },
                                        { key: 'notify_training', label: 'Entrenamiento Completado', desc: 'Aviso cuando finaliza un proceso de training.' },
                                        { key: 'notify_maintenance', label: 'Mantenimiento', desc: 'Avisos sobre ventanas de mantenimiento.' }
                                    ].map(item => (
                                        <div key={item.key} className="flex items-center justify-between p-3 sm:p-4 bg-white/5 border border-white/5 rounded-xl sm:rounded-2xl hover:bg-white/10 transition-colors gap-3">
                                            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                                                    <Bell size={14} className="text-white/40" />
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="text-white font-bold text-xs sm:text-sm truncate">{item.label}</h4>
                                                    <p className="text-white/40 text-[10px] sm:text-xs truncate">{item.desc}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleConfigChange('notifications', item.key, notificationConfig[item.key] === 'true' ? 'false' : 'true')}
                                                className={`w-10 h-5 sm:w-12 sm:h-6 rounded-full p-1 transition-colors shrink-0 ${notificationConfig[item.key] === 'true' ? 'bg-blue-500' : 'bg-slate-700'}`}
                                            >
                                                <div className={`w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full transition-transform ${notificationConfig[item.key] === 'true' ? 'translate-x-5 sm:translate-x-6' : ''}`} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* --- TAB: ROLES Y PERMISOS --- */}
                        {activeTab === 'permissions' && (
                            <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 border-b border-white/10 pb-3 sm:pb-4">
                                    <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                                        <Shield className="text-purple-400" size={20} /> Gestión de Acceso
                                    </h3>
                                    <button onClick={() => setIsCreateAdminModalOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition-all shadow-lg shadow-blue-600/20">
                                        <Plus size={14} /> Crear Admin
                                    </button>
                                </div>

                                <div className="space-y-3 sm:space-y-4">
                                    {adminUsers.map(user => (
                                        <div key={user.id} className={`bg-black/20 border rounded-xl sm:rounded-2xl p-4 sm:p-6 group transition-all ${user.status === 'inactive' ? 'border-red-500/20 opacity-75' : 'border-white/5 hover:border-white/10'}`}>
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                                                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center font-bold text-white text-base sm:text-lg shrink-0 ${user.role === 'super_admin' ? 'bg-purple-600' : 'bg-slate-700'}`}>
                                                        {user.full_name?.charAt(0) || user.email.charAt(0)}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <h4 className="text-white font-bold text-sm sm:text-base flex items-center gap-2 flex-wrap">
                                                            <span className="truncate">{user.full_name || user.email}</span>
                                                            <span className={`px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] uppercase tracking-wider font-black ${user.role === 'super_admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>{user.role}</span>
                                                        </h4>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <p className="text-white/40 text-[10px] sm:text-xs truncate">{user.email}</p>
                                                            {user.position && (
                                                                <>
                                                                    <span className="text-white/10 text-[10px]">•</span>
                                                                    <span className="text-blue-400/60 text-[10px] font-bold uppercase tracking-tight">{user.position}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {user.role !== 'super_admin' && (
                                                        <>
                                                            <button onClick={() => setViewingAdmin(user)} className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white" title="Ver Perfil">
                                                                <Eye size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleToggle2FA(user)}
                                                                className={`p-2 rounded-lg ${user.is_2fa_enabled ? 'bg-blue-500/10 text-blue-400' : 'bg-white/5 text-white/20'}`}
                                                                title={user.is_2fa_enabled ? 'Desactivar 2FA' : 'Activar 2FA'}
                                                            >
                                                                <ShieldCheck size={14} />
                                                            </button>
                                                            <button onClick={() => handleToggleStatus(user)} className={`p-2 rounded-lg ${user.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`} title={user.status === 'active' ? 'Desactivar' : 'Activar'}>
                                                                <Power size={12} />
                                                            </button>
                                                            <button onClick={() => setEditingAdmin(user)} className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white" title="Editar">
                                                                <Edit size={14} />
                                                            </button>
                                                            <button onClick={() => setDeletingAdmin(user)} className="p-2 hover:bg-red-500/20 rounded-lg text-white/40 hover:text-red-400" title="Eliminar">
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </>
                                                    )}
                                                    {user.role === 'super_admin' && (
                                                        <button onClick={() => setViewingAdmin(user)} className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white" title="Ver Perfil">
                                                            <Eye size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Permissions Matrix */}
                                            <div className="bg-white/5 rounded-lg sm:rounded-xl p-3 sm:p-4">
                                                <div className="text-[9px] sm:text-[10px] font-bold text-white/20 uppercase tracking-widest mb-2">Accesos</div>
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                    {sections.map(section => (
                                                        <div key={section.key} className={`flex items-center justify-between p-2 rounded-lg border ${user.permissions?.[section.key] ? 'bg-blue-500/10 border-blue-500/30' : 'border-transparent opacity-50'}`}>
                                                            <span className={`text-[10px] font-bold ${user.permissions?.[section.key] ? 'text-white' : 'text-white/40'}`}>{section.label}</span>
                                                            {user.role !== 'super_admin' && (
                                                                <button onClick={() => togglePermission(user.id, section.key)} className={`w-6 h-3 rounded-full ${user.permissions?.[section.key] ? 'bg-blue-500' : 'bg-slate-600'} relative`}>
                                                                    <div className={`w-2 h-2 bg-white rounded-full absolute top-0.5 ${user.permissions?.[section.key] ? 'right-0.5' : 'left-0.5'}`} />
                                                                </button>
                                                            )}
                                                            {user.role === 'super_admin' && <CheckCircle2 size={12} className="text-green-500" />}
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
                            <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3 sm:pb-4">
                                    <Lock className="text-green-400" size={20} /> Blindaje & Acceso
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 relative overflow-hidden">
                                        <div className="relative z-10">
                                            <h4 className="text-white font-bold text-base sm:text-lg mb-2">2FA (Doble Factor)</h4>
                                            <p className="text-white/60 text-xs mb-4">Requiere código temporal para ingresar.</p>
                                            <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5">
                                                <span className="text-sm font-bold text-white">Estado Global</span>
                                                <button
                                                    onClick={() => handleConfigChange('security', 'security_2fa', securityConfig.security_2fa === 'true' ? 'false' : 'true')}
                                                    className={`px-3 py-1 rounded-lg text-xs font-black uppercase ${securityConfig.security_2fa === 'true' ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/40'}`}
                                                >
                                                    {securityConfig.security_2fa === 'true' ? 'ACTIVADO' : 'DESACTIVADO'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <h4 className="text-white font-bold text-sm">Rotación de Claves</h4>
                                            <button
                                                onClick={() => handleConfigChange('security', 'security_password_rotation', securityConfig.security_password_rotation === 'true' ? 'false' : 'true')}
                                                className={`w-10 h-5 rounded-full p-1 ${securityConfig.security_password_rotation === 'true' ? 'bg-blue-500' : 'bg-slate-600'}`}
                                            >
                                                <div className={`w-3 h-3 bg-white rounded-full transition-transform ${securityConfig.security_password_rotation === 'true' ? 'translate-x-5' : ''}`} />
                                            </button>
                                        </div>

                                        <div className="space-y-2 mb-6">
                                            <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Frecuencia de Cambio (Días)</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={securityConfig.security_password_days}
                                                    onChange={(e) => handleConfigChange('security', 'security_password_days', e.target.value)}
                                                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-white font-bold outline-none focus:border-blue-500/50 transition-colors"
                                                    placeholder="Ej: 90"
                                                />
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 text-[10px] font-bold">DÍAS</div>
                                            </div>
                                        </div>

                                        <button onClick={() => setIsChangePasswordModalOpen(true)} className="w-full py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-bold border border-white/5">
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <form onSubmit={handleCreateAdmin} className="bg-slate-900 border border-white/10 w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl relative animate-in zoom-in-95 duration-300">
                        <button type="button" onClick={() => setIsCreateAdminModalOpen(false)} className="absolute top-6 right-6 p-2 text-white/20 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-400">
                                <Plus size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-white">Nuevo Administrador</h3>
                                <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Creación de perfil de acceso</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Nombre Completo</label>
                                <input required placeholder="Ej: Juan Pérez" value={newAdminForm.name} onChange={e => setNewAdminForm({ ...newAdminForm, name: e.target.value })} className="w-full bg-slate-950/50 p-3.5 rounded-2xl text-white outline-none border border-white/10 focus:border-blue-500/50 transition-colors" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Email</label>
                                <input required placeholder="admin@ejemplo.com" type="email" value={newAdminForm.email} onChange={e => setNewAdminForm({ ...newAdminForm, email: e.target.value })} className="w-full bg-slate-950/50 p-3.5 rounded-2xl text-white outline-none border border-white/10 focus:border-blue-500/50 transition-colors" />
                            </div>
                            <div className="space-y-1.5 relative">
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Contraseña</label>
                                <div className="relative">
                                    <input
                                        required
                                        placeholder="••••••••"
                                        type={showNewPassword ? "text" : "password"}
                                        value={newAdminForm.password}
                                        onChange={e => setNewAdminForm({ ...newAdminForm, password: e.target.value })}
                                        className="w-full bg-slate-950/50 p-3.5 rounded-2xl text-white outline-none border border-white/10 focus:border-blue-500/50 transition-colors pr-12"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                                    >
                                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Cédula / DNI</label>
                                <input placeholder="Número de identidad" value={newAdminForm.dni} onChange={e => setNewAdminForm({ ...newAdminForm, dni: e.target.value })} className="w-full bg-slate-950/50 p-3.5 rounded-2xl text-white outline-none border border-white/10 focus:border-blue-500/50 transition-colors" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Teléfono</label>
                                <input placeholder="+51 999..." value={newAdminForm.phone} onChange={e => setNewAdminForm({ ...newAdminForm, phone: e.target.value })} className="w-full bg-slate-950/50 p-3.5 rounded-2xl text-white outline-none border border-white/10 focus:border-blue-500/50 transition-colors" />
                            </div>
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Cargo / Posición</label>
                                <select value={newAdminForm.position} onChange={e => setNewAdminForm({ ...newAdminForm, position: e.target.value })} className="w-full bg-slate-950/50 p-3.5 rounded-2xl text-white outline-none border border-white/10 appearance-none">
                                    <option value="Analista">Analista de Datos</option>
                                    <option value="Soporte">Soporte Técnico</option>
                                    <option value="Supervisor">Supervisor de Módulos</option>
                                    <option value="Moderador">Moderador de Comunidad</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button type="button" onClick={() => setIsCreateAdminModalOpen(false)} className="flex-1 p-4 bg-white/5 text-white rounded-2xl font-bold hover:bg-white/10 transition-colors">Cancelar</button>
                            <button type="submit" className="flex-1 p-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-600/20 hover:bg-blue-500 transition-all active:scale-95">Crear Administrador</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Editing Modal */}
            {editingAdmin && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <form onSubmit={handleUpdateAdmin} className="bg-slate-900 border border-white/10 w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl relative animate-in zoom-in-95 duration-300">
                        <button type="button" onClick={() => setEditingAdmin(null)} className="absolute top-6 right-6 p-2 text-white/20 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                            <X size={20} />
                        </button>
                        <h3 className="text-2xl font-bold text-white mb-6">Editar Perfil</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="md:col-span-2">
                                <label className="text-[10px] font-black text-white/30 uppercase ml-1">Nombre</label>
                                <input required value={editingAdmin.full_name || ''} onChange={e => setEditingAdmin({ ...editingAdmin, full_name: e.target.value })} className="w-full bg-slate-950/50 p-3.5 rounded-2xl text-white outline-none border border-white/10" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-[10px] font-black text-white/30 uppercase ml-1">Email</label>
                                <input required value={editingAdmin.email || ''} onChange={e => setEditingAdmin({ ...editingAdmin, email: e.target.value })} className="w-full bg-slate-950/50 p-3.5 rounded-2xl text-white outline-none border border-white/10" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-white/30 uppercase ml-1">DNI</label>
                                <input value={editingAdmin.dni || ''} onChange={e => setEditingAdmin({ ...editingAdmin, dni: e.target.value })} className="w-full bg-slate-950/50 p-3.5 rounded-2xl text-white outline-none border border-white/10" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-white/30 uppercase ml-1">Teléfono</label>
                                <input value={editingAdmin.phone || ''} onChange={e => setEditingAdmin({ ...editingAdmin, phone: e.target.value })} className="w-full bg-slate-950/50 p-3.5 rounded-2xl text-white outline-none border border-white/10" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-[10px] font-black text-white/30 uppercase ml-1">Cargo</label>
                                <input value={editingAdmin.position || ''} onChange={e => setEditingAdmin({ ...editingAdmin, position: e.target.value })} className="w-full bg-slate-950/50 p-3.5 rounded-2xl text-white outline-none border border-white/10" />
                            </div>
                            <div className="md:col-span-2 relative">
                                <label className="text-[10px] font-black text-white/30 uppercase ml-1">Nueva Contraseña (Opcional)</label>
                                <div className="relative">
                                    <input
                                        placeholder="Dejar vacío para no cambiar"
                                        type={showEditPassword ? "text" : "password"}
                                        value={editingAdmin.password || ''}
                                        onChange={e => setEditingAdmin({ ...editingAdmin, password: e.target.value })}
                                        className="w-full bg-slate-950/50 p-3.5 rounded-2xl text-white outline-none border border-white/10 pr-12"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowEditPassword(!showEditPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                                    >
                                        {showEditPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button type="button" onClick={() => setEditingAdmin(null)} className="flex-1 p-3.5 bg-white/5 text-white rounded-2xl">Cancelar</button>
                            <button type="submit" className="flex-1 p-3.5 bg-blue-600 text-white rounded-2xl font-bold">Guardar Cambios</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Viewing Modal */}
            {viewingAdmin && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="bg-slate-900 border border-white/10 w-full max-w-md rounded-[2.5rem] p-8 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] relative animate-in zoom-in-95 duration-300">
                        <button onClick={() => setViewingAdmin(null)} className="absolute top-6 right-6 p-2 text-white/20 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                            <X size={20} />
                        </button>

                        <div className="text-center mb-8">
                            <div className={`w-24 h-24 mx-auto rounded-3xl flex items-center justify-center text-4xl font-black text-white shadow-2xl mb-4 ${viewingAdmin.role === 'super_admin' ? 'bg-purple-600' : 'bg-blue-600'}`}>
                                {viewingAdmin.full_name?.charAt(0)}
                            </div>
                            <h3 className="text-2xl font-black text-white">{viewingAdmin.full_name}</h3>
                            <p className="text-blue-400 font-bold text-xs uppercase tracking-[0.2em] mt-1">{viewingAdmin.position || 'Administrador'}</p>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                                <Mail className="text-white/20" size={18} />
                                <div className="min-w-0">
                                    <p className="text-[9px] font-black text-white/20 uppercase">Email Corporativo</p>
                                    <p className="text-white text-sm font-bold truncate">{viewingAdmin.email}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <ShieldCheck className="text-white/20 mb-2" size={18} />
                                    <p className="text-[9px] font-black text-white/20 uppercase">DNI / Identidad</p>
                                    <p className="text-white text-sm font-bold">{viewingAdmin.dni || '--'}</p>
                                </div>
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <Smartphone className="text-white/20 mb-2" size={18} />
                                    <p className="text-[9px] font-black text-white/20 uppercase">Teléfono</p>
                                    <p className="text-white text-sm font-bold">{viewingAdmin.phone || '--'}</p>
                                </div>
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 col-span-2 flex items-center justify-between">
                                    <div>
                                        <p className="text-[9px] font-black text-white/20 uppercase mb-1">Experiencia Acumulada</p>
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="text-blue-400" size={14} />
                                            <p className="text-white text-base font-black italic">{viewingAdmin.xp || 0} XP</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-white/20 uppercase mb-1">Última Clave</p>
                                        <p className="text-white/60 text-[10px] font-bold">
                                            {viewingAdmin.last_password_change ? new Date(viewingAdmin.last_password_change).toLocaleDateString() : 'Nunca'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button onClick={() => setViewingAdmin(null)} className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold transition-all border border-white/10 uppercase tracking-widest text-xs">Cerrar Perfil</button>
                    </div>
                </div>
            )}
            {/* Delete Confirmation Modal */}
            {deletingAdmin && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-slate-900 border border-white/10 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl text-center animate-in zoom-in-95 duration-300">
                        <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Trash2 size={32} />
                        </div>
                        <h3 className="text-xl font-black text-white mb-2">¿Eliminar Administrador?</h3>
                        <p className="text-white/40 text-sm mb-8 leading-relaxed">
                            Esta acción eliminará permanentemente el acceso de <span className="text-white font-bold">{deletingAdmin.full_name}</span>. Esta acción no se puede deshacer.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeletingAdmin(null)} className="flex-1 py-3 bg-white/5 text-white rounded-xl font-bold hover:bg-white/10 transition-colors">
                                Cancelar
                            </button>
                            <button onClick={handleConfirmDelete} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-500 transition-all active:scale-95 shadow-lg shadow-red-600/20">
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Password Modal Demo */}
            {isChangePasswordModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-slate-900 border border-white/10 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl text-center relative animate-in zoom-in-95 duration-300">
                        <div className="w-20 h-20 bg-red-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-red-500">
                            <Lock size={40} className="animate-pulse" />
                        </div>
                        <h3 className="text-2xl font-black text-white mb-2">Seguridad Requerida</h3>
                        <p className="text-white/40 mb-8 leading-relaxed">
                            Como medida de seguridad, tu política de rotación de claves exige un cambio cada <span className="text-white font-bold">{securityConfig.security_password_days} días</span>.
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
