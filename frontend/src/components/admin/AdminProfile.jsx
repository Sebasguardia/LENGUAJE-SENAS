import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { User, Settings, LogOut, Mail, Shield, Calendar, Camera, Edit2, X, Lock, Eye, EyeOff, Phone, CreditCard, Crown, Award, Briefcase } from 'lucide-react';
import { adminService } from '../../api/adminService';
import { toast } from 'react-hot-toast';

const AdminProfile = ({ user, onLogout }) => {
    const [showMenu, setShowMenu] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Obtener datos reales del usuario desde localStorage o props
    const realUser = user || JSON.parse(localStorage.getItem('userData') || '{}');

    // Estado local para los datos mostrados
    const [profileData, setProfileData] = useState({
        name: realUser?.full_name || realUser?.name || 'Administrador',
        email: realUser?.email || 'admin@sistema.com',
        phone: realUser?.phone || 'N/A',
        dni: realUser?.dni || 'N/A',
        position: realUser?.position || 'N/A',
        avatar: null
    });

    const [editForm, setEditForm] = useState({
        ...profileData,
        password: ''
    });

    const menuRef = useRef(null);
    const fileInputRef = useRef(null);

    // Sincronizar si user prop cambia
    useEffect(() => {
        if (realUser) {
            setProfileData({
                name: realUser.full_name || realUser.name || 'Administrador',
                email: realUser.email || 'admin@sistema.com',
                phone: realUser.phone || 'N/A',
                dni: realUser.dni || 'N/A',
                position: realUser.position || 'N/A',
                avatar: null
            });
        }
    }, [user]); // Use user prop as trigger

    // Cerrar menú al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const role = (realUser?.role === 'superadmin' || realUser?.role === 'super_admin') ? 'Super Admin' : realUser?.role === 'admin' ? 'Administrador' : 'Admin';
    const joinDate = realUser?.created_at ? new Date(realUser.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Recientemente';
    const lastLogin = realUser?.lastLogin ? new Date(realUser.lastLogin).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Hoy';

    const handleEditToggle = () => {
        if (!isEditing) {
            setEditForm({ ...profileData, password: '' });
            setShowPassword(false);
        }
        setIsEditing(!isEditing);
    };

    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        if (!realUser?.id) {
            toast.error("Sesión no válida. Por favor, reingresa.");
            return;
        }

        setIsLoading(true);
        try {
            const updateData = {
                full_name: editForm.name,
                email: editForm.email,
                phone: editForm.phone,
                dni: editForm.dni,
                position: editForm.position
            };

            if (editForm.password && editForm.password.trim() !== '') {
                updateData.password = editForm.password;
            }

            // Guardar en Base de Datos Real
            const updatedUserFromServer = await adminService.updateUser(realUser.id, updateData);

            // Actualizar estado local
            setProfileData({
                ...profileData,
                ...editForm,
                name: updatedUserFromServer.full_name || editForm.name
            });

            // Actualizar localStorage con la respuesta REAL del servidor
            // Esto asegura que IDs, fechas y roles se mantengan consistentes
            localStorage.setItem('userData', JSON.stringify(updatedUserFromServer));

            setIsEditing(false);
            toast.success("¡Perfil guardado en la base de datos!");

            // Notificar a toda la aplicación (Dashboard, Header, etc.)
            window.dispatchEvent(new Event('user-profile-updated'));
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.detail || "Error al conectar con la base de datos";
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageClick = () => {
        fileInputRef.current.click();
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setProfileData(prev => ({ ...prev, avatar: imageUrl }));
        }
    };

    return (
        <div className="relative" ref={menuRef}>
            {/* Trigger Button - Responsive */}
            <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 sm:gap-3 pl-1 sm:pl-2 group cursor-pointer active:scale-95 transition-transform"
            >
                <div className="text-right hidden sm:block">
                    <p className="text-xs sm:text-sm font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{profileData.name}</p>
                    <div className="flex items-center justify-end gap-1.5">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                        <p className="text-[9px] sm:text-[10px] text-white/40 font-bold uppercase tracking-widest">{role}</p>
                    </div>
                </div>
                <div className="relative">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 p-0.5 shadow-lg group-hover:rotate-3 transition-transform duration-300">
                        <div className="w-full h-full rounded-[10px] sm:rounded-[14px] bg-slate-900 flex items-center justify-center overflow-hidden relative">
                            {profileData.avatar ? (
                                <img src={profileData.avatar} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <>
                                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-900 to-slate-900 opacity-50"></div>
                                    <span className="relative z-10 font-black text-base sm:text-lg text-white">
                                        {profileData.name.charAt(0).toUpperCase()}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </button>

            {/* Dropdown Menu - Responsive */}
            {showMenu && (
                <div className="absolute top-14 sm:top-16 right-0 w-56 sm:w-64 bg-slate-900 border border-white/10 rounded-xl sm:rounded-2xl shadow-2xl p-2 animate-in fade-in slide-in-from-top-2 z-50 overflow-hidden">
                    <div className="p-3 sm:p-4 border-b border-white/5 mb-2 bg-white/5 rounded-lg sm:rounded-xl">
                        <p className="text-white text-xs sm:text-sm font-bold truncate">{profileData.name}</p>
                        <p className="text-white/40 text-[10px] sm:text-xs truncate">{profileData.email}</p>
                    </div>
                    <div className="space-y-1">
                        <button
                            onClick={() => { setShowMenu(false); setShowProfileModal(true); }}
                            className="w-full flex items-center gap-3 px-3 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-white/70 hover:text-white hover:bg-white/5 text-xs font-bold transition-all"
                        >
                            <User size={16} className="text-blue-400" /> Ver Perfil
                        </button>
                        <div className="h-px bg-white/5 my-1"></div>
                        <button
                            onClick={onLogout}
                            className="w-full flex items-center gap-3 px-3 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-red-400 hover:text-white hover:bg-red-500 text-xs font-bold transition-all group"
                        >
                            <LogOut size={16} className="group-hover:translate-x-1 transition-transform" /> Cerrar Sesión
                        </button>
                    </div>
                </div>
            )}

            {/* Modal de Perfil Completo - Responsive */}
            {showProfileModal && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => { setShowProfileModal(false); setIsEditing(false); }}></div>

                    <div className="bg-slate-900 border border-white/10 w-full max-w-sm sm:max-w-md lg:max-w-lg rounded-2xl sm:rounded-[2.5rem] relative z-10 overflow-hidden shadow-2xl animate-in zoom-in duration-300 max-h-[95vh] overflow-y-auto">
                        {/* Cover Image */}
                        <div className="h-24 sm:h-32 bg-gradient-to-r from-blue-600 to-purple-600 relative">
                            {realUser?.role === 'superadmin' && (
                                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-yellow-500/20 px-2 sm:px-3 py-1 rounded-full border border-yellow-500/30">
                                    <Crown size={12} className="text-yellow-400" />
                                    <span className="text-yellow-400 text-[9px] sm:text-[10px] font-black uppercase tracking-wider">Super Admin</span>
                                </div>
                            )}
                            <button
                                onClick={() => { setShowProfileModal(false); setIsEditing(false); }}
                                className="absolute top-3 sm:top-4 right-3 sm:right-4 p-1.5 sm:p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-sm transition-all"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Profile Header (Avatar overlap) */}
                        <div className="px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8 relative">
                            <div className="flex justify-between items-end -mt-10 sm:-mt-12 mb-4 sm:mb-6">
                                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-slate-900 p-1 sm:p-1.5 border-4 border-slate-900 shadow-xl relative group">
                                    <div className="w-full h-full rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-2xl sm:text-3xl font-black text-white overflow-hidden">
                                        {profileData.avatar ? (
                                            <img src={profileData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            profileData.name.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                                    <button
                                        onClick={handleImageClick}
                                        className="absolute bottom-[-8px] right-[-8px] p-1.5 sm:p-2 bg-white text-slate-900 rounded-full shadow-lg hover:scale-110 transition-transform cursor-pointer"
                                        title="Cambiar Foto"
                                    >
                                        <Camera size={12} className="sm:w-3.5 sm:h-3.5" />
                                    </button>
                                </div>

                                {isEditing ? (
                                    <div className="flex gap-2">
                                        <button
                                            disabled={isLoading}
                                            onClick={() => setIsEditing(false)}
                                            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-white/5 hover:bg-white/10 text-white text-[10px] sm:text-xs font-bold transition-all disabled:opacity-50"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            disabled={isLoading}
                                            onClick={handleSave}
                                            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[10px] sm:text-xs font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 disabled:bg-blue-800"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    Guardando...
                                                </>
                                            ) : (
                                                'Guardar Cambios'
                                            )}
                                        </button>
                                    </div>
                                ) : (
                                    <button onClick={handleEditToggle} className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-white text-[10px] sm:text-xs font-bold flex items-center gap-2 transition-all">
                                        <Edit2 size={12} className="sm:w-3.5 sm:h-3.5" /> Editar
                                    </button>
                                )}
                            </div>

                            {/* User Info */}
                            <div className="space-y-4 sm:space-y-6">
                                <div>
                                    <div className="mb-2">
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editForm.name}
                                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                className="text-xl sm:text-2xl font-black text-white bg-transparent border-b border-white/20 outline-none w-full focus:border-blue-500 transition-colors"
                                            />
                                        ) : (
                                            <h2 className="text-xl sm:text-2xl font-black text-white">{profileData.name}</h2>
                                        )}
                                        <p className="text-blue-400 font-bold text-xs sm:text-sm uppercase tracking-wider mt-1">{role}</p>
                                    </div>

                                    <p className="text-white/60 text-xs sm:text-sm leading-relaxed">
                                        {profileData.position && profileData.position !== 'N/A'
                                            ? `Cumpliendo funciones de ${profileData.position} en la plataforma técnica del Instituto de Lenguaje de Señas IA.`
                                            : (role === 'Super Admin'
                                                ? 'Administrador principal con acceso total al sistema, incluyendo gestión de configuración y permisos.'
                                                : 'Gestionando la plataforma de aprendizaje y coordinando las actividades educativas del sistema.')}
                                    </p>
                                </div>

                                {/* Info Grid - Responsive */}
                                <div className="grid grid-cols-1 gap-2 sm:gap-3">
                                    <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-white/5 border border-white/5">
                                        <div className="p-1.5 sm:p-2 bg-blue-500/10 text-blue-400 rounded-lg shrink-0"><Mail size={14} className="sm:w-4 sm:h-4" /></div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[9px] sm:text-[10px] text-white/40 font-bold uppercase tracking-widest">Email</p>
                                            {isEditing ? (
                                                <input
                                                    type="email"
                                                    value={editForm.email}
                                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                                    className="text-white text-xs sm:text-sm font-medium bg-transparent border-b border-white/20 outline-none w-full focus:border-blue-500 transition-colors"
                                                />
                                            ) : (
                                                <p className="text-white text-xs sm:text-sm font-medium truncate">{profileData.email}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-white/5 border border-white/5">
                                        <div className="p-1.5 sm:p-2 bg-blue-500/10 text-blue-400 rounded-lg shrink-0"><Briefcase size={14} className="sm:w-4 sm:h-4" /></div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[9px] sm:text-[10px] text-white/40 font-bold uppercase tracking-widest">Cargo / Posición</p>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={editForm.position}
                                                    onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                                                    className="text-white text-xs sm:text-sm font-medium bg-transparent border-b border-white/20 outline-none w-full focus:border-blue-500 transition-colors"
                                                />
                                            ) : (
                                                <p className="text-white text-xs sm:text-sm font-medium truncate">{profileData.position}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-white/5 border border-white/5">
                                        <div className="p-1.5 sm:p-2 bg-green-500/10 text-green-400 rounded-lg shrink-0"><Phone size={14} className="sm:w-4 sm:h-4" /></div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[9px] sm:text-[10px] text-white/40 font-bold uppercase tracking-widest">Teléfono</p>
                                            {isEditing ? (
                                                <input
                                                    type="tel"
                                                    value={editForm.phone}
                                                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                                    className="text-white text-xs sm:text-sm font-medium bg-transparent border-b border-white/20 outline-none w-full focus:border-blue-500 transition-colors"
                                                />
                                            ) : (
                                                <p className="text-white text-xs sm:text-sm font-medium">{profileData.phone}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-white/5 border border-white/5">
                                        <div className="p-1.5 sm:p-2 bg-purple-500/10 text-purple-400 rounded-lg shrink-0"><CreditCard size={14} className="sm:w-4 sm:h-4" /></div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[9px] sm:text-[10px] text-white/40 font-bold uppercase tracking-widest">DNI</p>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={editForm.dni}
                                                    onChange={(e) => setEditForm({ ...editForm, dni: e.target.value })}
                                                    className="text-white text-xs sm:text-sm font-medium bg-transparent border-b border-white/20 outline-none w-full focus:border-blue-500 transition-colors"
                                                />
                                            ) : (
                                                <p className="text-white text-xs sm:text-sm font-medium">{profileData.dni}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-white/5 border border-white/5">
                                        <div className="p-1.5 sm:p-2 bg-yellow-500/10 text-yellow-400 rounded-lg shrink-0"><Lock size={14} className="sm:w-4 sm:h-4" /></div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[9px] sm:text-[10px] text-white/40 font-bold uppercase tracking-widest">Contraseña</p>
                                            {isEditing ? (
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type={showPassword ? "text" : "password"}
                                                        value={editForm.password}
                                                        onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                                                        placeholder="Nueva contraseña..."
                                                        className="text-white text-xs sm:text-sm font-medium bg-transparent border-b border-white/20 outline-none w-full focus:border-blue-500 transition-colors"
                                                    />
                                                    <button onClick={() => setShowPassword(!showPassword)} className="text-white/40 hover:text-white shrink-0">
                                                        {showPassword ? <EyeOff size={12} className="sm:w-3.5 sm:h-3.5" /> : <Eye size={12} className="sm:w-3.5 sm:h-3.5" />}
                                                    </button>
                                                </div>
                                            ) : (
                                                <p className="text-white text-xs sm:text-sm font-bold tracking-widest">••••••••</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-white/5 border border-white/5">
                                        <div className="p-1.5 sm:p-2 bg-indigo-500/10 text-indigo-400 rounded-lg shrink-0"><Shield size={14} className="sm:w-4 sm:h-4" /></div>
                                        <div>
                                            <p className="text-[9px] sm:text-[10px] text-white/40 font-bold uppercase tracking-widest">Permisos</p>
                                            <p className="text-white text-xs sm:text-sm font-medium">
                                                {realUser?.role === 'superadmin' ? 'Acceso Total + Configuración' : 'Gestión de Contenidos'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-white/5 border border-white/5">
                                        <div className="p-1.5 sm:p-2 bg-cyan-500/10 text-cyan-400 rounded-lg shrink-0"><Calendar size={14} className="sm:w-4 sm:h-4" /></div>
                                        <div>
                                            <p className="text-[9px] sm:text-[10px] text-white/40 font-bold uppercase tracking-widest">Miembro Desde</p>
                                            <p className="text-white text-xs sm:text-sm font-medium">{joinDate}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="pt-3 sm:pt-4 border-t border-white/5 grid grid-cols-2 gap-3 sm:gap-4">
                                    <div className="text-center p-2 sm:p-3 rounded-lg bg-white/5">
                                        <span className="block text-lg sm:text-xl font-black text-white">{realUser?.id || '—'}</span>
                                        <span className="text-[9px] sm:text-[10px] text-white/40 uppercase tracking-widest">ID Usuario</span>
                                    </div>
                                    <div className="text-center p-2 sm:p-3 rounded-lg bg-white/5">
                                        <span className="block text-lg sm:text-xl font-black text-green-400">Activo</span>
                                        <span className="text-[9px] sm:text-[10px] text-white/40 uppercase tracking-widest">Estado</span>
                                    </div>
                                </div>

                                {/* Last Login */}
                                <div className="text-center text-[10px] sm:text-xs text-white/30">
                                    Último acceso: <span className="text-white/50 font-medium">{lastLogin}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default AdminProfile;
