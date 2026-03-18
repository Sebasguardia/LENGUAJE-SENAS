import React, { useState, useRef, useEffect } from 'react';
import { 
    User, Mail, Phone, CreditCard, Briefcase, 
    Shield, Calendar, Lock, Camera, Edit2, 
    Check, Activity, TrendingUp, AlertCircle, Eye, EyeOff, Crown
} from 'lucide-react';
import { adminService } from '../../api/adminService';
import { authStorage } from '../../utils/authStorage';
import { toast } from 'react-hot-toast';

const ProfileSection = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const fileInputRef = useRef(null);

    // Get current user from storage
    const storedUser = authStorage.getUser() || {};
    
    const [profileData, setProfileData] = useState({
        id: storedUser.id,
        name: storedUser.full_name || storedUser.name || 'Administrador',
        email: storedUser.email || 'admin@sistema.com',
        phone: storedUser.phone || 'N/A',
        dni: storedUser.dni || 'N/A',
        position: storedUser.position || 'N/A',
        avatar: null,
        role: storedUser.role || 'admin',
        created_at: storedUser.created_at,
        lastLogin: storedUser.lastLogin
    });

    const [editForm, setEditForm] = useState({
        ...profileData,
        password: ''
    });

    const roleLabel = (profileData.role === 'superadmin' || profileData.role === 'super_admin') 
        ? 'Super Admin' 
        : profileData.role === 'admin' ? 'Administrador' : 'Admin';
        
    const joinDate = profileData.created_at 
        ? new Date(profileData.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) 
        : 'Recientemente';

    const handleEditToggle = () => {
        if (!isEditing) {
            setEditForm({ ...profileData, password: '' });
            setShowPassword(false);
        }
        setIsEditing(!isEditing);
    };

    const handleSave = async () => {
        if (!profileData.id) {
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

            const updatedUser = await adminService.updateUser(profileData.id, updateData);

            setProfileData({
                ...profileData,
                ...editForm,
                name: updatedUser.full_name || editForm.name
            });

            authStorage.updateUser(updatedUser);
            setIsEditing(false);
            toast.success("¡Perfil actualizado de forma exitosa!");
            
            // Notify other components
            window.dispatchEvent(new Event('user-profile-updated'));
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.detail || "Error al conectar con la base de datos";
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setProfileData(prev => ({ ...prev, avatar: imageUrl }));
            toast.success("Imagen de perfil actualizada localmente");
        }
    };

    return (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-12">
            
            {/* Header / Cover */}
            <div className="relative rounded-[2.5rem] overflow-hidden dark:bg-white/[0.02] bg-white border dark:border-white/5 border-slate-200 shadow-2xl">
                {/* Abstract Background */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 right-[-10%] w-[50%] h-[200%] bg-gradient-to-l from-blue-600/20 to-transparent rotate-12 blur-[100px] pointer-events-none" />
                    <div className="absolute bottom-[-50%] left-[-10%] w-[60%] h-[150%] bg-gradient-to-r from-purple-600/20 to-transparent -rotate-12 blur-[100px] pointer-events-none" />
                    <div className="absolute inset-0 dark:bg-grid-white/[0.02] bg-grid-slate-900/[0.02] bg-[length:30px_30px]" />
                </div>

                <div className="relative z-10 p-8 sm:p-12">
                    <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                        {/* Avatar */}                        <div className="relative group shrink-0">
                            <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full p-1.5 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 relative z-10">
                                <div className="w-full h-full dark:bg-[#0a0c10] bg-white flex items-center justify-center overflow-hidden border-4 dark:border-[#0a0c10] border-white">
                                    {profileData.avatar ? (
                                        <img src={profileData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-5xl sm:text-7xl font-black dark:text-white text-slate-900 bg-clip-text dark:bg-gradient-to-br dark:from-white dark:to-white/50 bg-none">
                                            {profileData.name.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-2 right-2 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:scale-110 hover:bg-blue-500 transition-all border-4 dark:border-[#0a0c10] border-white"
                                >
                                    <Camera size={18} />
                                </button>
                            </div>
                            
                            {profileData.role === 'superadmin' && (
                                <div className="absolute -top-3 -right-3 bg-yellow-500 dark:text-[#0a0c10] text-slate-950 px-3 py-1 rounded-full font-black text-xs flex items-center gap-1.5 border-4 dark:border-[#0a0c10] border-white z-20 shadow-xl">
                                    <Crown size={14} /> Super
                                </div>
                            )}
                        </div>

                        {/* Title Info */}
                        <div className="flex-1 min-w-0">
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    className="text-3xl sm:text-5xl font-black dark:text-white text-slate-900 bg-transparent border-b-2 dark:border-white/20 border-slate-200 outline-none focus:border-blue-500 transition-colors w-full mb-2 pb-2"
                                />
                            ) : (
                                <h1 className="text-3xl sm:text-5xl font-black dark:text-white text-slate-900 tracking-tighter mb-2 truncate">
                                    {profileData.name}
                                </h1>
                            )}
                            
                            <div className="flex items-center gap-3 mb-4">
                                <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 dark:text-blue-400 font-bold text-xs uppercase tracking-widest border border-blue-500/20">
                                    {roleLabel}
                                </span>
                                <span className="flex items-center gap-1.5 dark:text-white/40 text-slate-500 text-xs font-bold uppercase tracking-widest">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_100px_rgba(34,197,94,0.5)]" />
                                    Online
                                </span>
                            </div>

                            <p className="dark:text-white/60 text-slate-600 text-sm max-w-2xl leading-relaxed">
                                {profileData.position && profileData.position !== 'N/A'
                                    ? `Cumple funciones de ${profileData.position} en la plataforma técnica del Instituto de Lenguaje de Señas IA, garantizando el óptimo rendimiento del sistema.`
                                    : (profileData.role === 'superadmin'
                                        ? 'Administrador principal con acceso total a nivel de sistema. Gestiona infraestructura, configuraciones maestras y políticas de seguridad.'
                                        : 'Responsable de la gestión diaria de plataforma, contenido educativo y coordinación del sistema de entrenamiento visual.')}
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
                            {isEditing ? (
                                <>
                                    <button
                                        disabled={isLoading}
                                        onClick={() => setIsEditing(false)}
                                        className="flex-1 md:flex-none px-6 py-3 rounded-xl dark:bg-white/5 bg-slate-100 hover:dark:bg-white/10 hover:bg-slate-200 dark:text-white text-slate-700 font-bold transition-all disabled:opacity-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        disabled={isLoading}
                                        onClick={handleSave}
                                        className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] flex items-center justify-center gap-2 disabled:bg-blue-800"
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Procesando
                                            </>
                                        ) : (
                                            <>
                                                <Check size={18} /> Guardar Cambios
                                            </>
                                        )}
                                    </button>
                                </>
                            ) : (
                                <button 
                                    onClick={handleEditToggle} 
                                    className="flex-1 md:flex-none px-6 py-3 rounded-xl dark:bg-white/10 bg-white hover:dark:bg-white/20 hover:bg-slate-50 border dark:border-white/5 border-slate-200 dark:text-white text-slate-900 font-bold flex items-center justify-center gap-2 transition-all backdrop-blur-md shadow-lg"
                                >
                                    <Edit2 size={18} /> Editar Perfil
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                {/* Left Column - Details */}
                <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                    {/* Information Grid */}
                    <div className="dark:bg-white/[0.02] bg-white border dark:border-white/5 border-slate-200 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 blur-[80px] rounded-full pointer-events-none group-hover:bg-purple-500/10 transition-colors duration-700" />
                        
                        <h3 className="text-xl font-black dark:text-white text-slate-900 mb-6 flex items-center gap-3">
                            <User className="text-purple-500 dark:text-purple-400" /> 
                            Información Profesional
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Email */}
                            <div className="p-4 rounded-2xl dark:bg-white/5 bg-slate-50 border dark:border-white/5 border-slate-100 flex gap-4">
                                <div className="p-3 bg-blue-500/10 text-blue-500 dark:text-blue-400 rounded-xl h-fit"><Mail size={20} /></div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] dark:text-white/40 text-slate-400 font-bold uppercase tracking-widest mb-1">Correo Electrónico</p>
                                    {isEditing ? (
                                        <input
                                            type="email"
                                            value={editForm.email}
                                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                            className="w-full bg-transparent border-b dark:border-white/20 border-slate-200 dark:text-white text-slate-900 font-bold outline-none focus:border-blue-500 py-1"
                                        />
                                    ) : (
                                        <p className="dark:text-white text-slate-900 font-bold truncate">{profileData.email}</p>
                                    )}
                                </div>
                            </div>

                            {/* Cargo */}
                            <div className="p-4 rounded-2xl dark:bg-white/5 bg-slate-50 border dark:border-white/5 border-slate-100 flex gap-4">
                                <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl h-fit"><Briefcase size={20} /></div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] dark:text-white/40 text-slate-400 font-bold uppercase tracking-widest mb-1">Cargo / Posición</p>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editForm.position}
                                            onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                                            className="w-full bg-transparent border-b dark:border-white/20 border-slate-200 dark:text-white text-slate-900 font-bold outline-none focus:border-emerald-500 py-1"
                                        />
                                    ) : (
                                        <p className="dark:text-white text-slate-900 font-bold truncate">{profileData.position}</p>
                                    )}
                                </div>
                            </div>

                            {/* Teléfono */}
                            <div className="p-4 rounded-2xl dark:bg-white/5 bg-slate-50 border dark:border-white/5 border-slate-100 flex gap-4">
                                <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl h-fit"><Phone size={20} /></div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] dark:text-white/40 text-slate-400 font-bold uppercase tracking-widest mb-1">Teléfono</p>
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            value={editForm.phone}
                                            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                            className="w-full bg-transparent border-b dark:border-white/20 border-slate-200 dark:text-white text-slate-900 font-bold outline-none focus:border-indigo-500 py-1"
                                        />
                                    ) : (
                                        <p className="dark:text-white text-slate-900 font-bold truncate">{profileData.phone}</p>
                                    )}
                                </div>
                            </div>

                            {/* DNI */}
                            <div className="p-4 rounded-2xl dark:bg-white/5 bg-slate-50 border dark:border-white/5 border-slate-100 flex gap-4">
                                <div className="p-3 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-xl h-fit"><CreditCard size={20} /></div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] dark:text-white/40 text-slate-400 font-bold uppercase tracking-widest mb-1">Documento Identidad (DNI)</p>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editForm.dni}
                                            onChange={(e) => setEditForm({ ...editForm, dni: e.target.value })}
                                            className="w-full bg-transparent border-b dark:border-white/20 border-slate-200 dark:text-white text-slate-900 font-bold outline-none focus:border-orange-500 py-1"
                                        />
                                    ) : (
                                        <p className="dark:text-white text-slate-900 font-bold truncate">{profileData.dni}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security Sub-section */}
                    <div className="dark:bg-white/[0.02] bg-white border dark:border-white/5 border-slate-200 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                        <h3 className="text-xl font-black dark:text-white text-slate-900 mb-6 flex items-center gap-3">
                            <Shield className="text-red-500 dark:text-red-400" /> 
                            Seguridad de la Cuenta
                        </h3>

                        <div className="p-6 rounded-2xl dark:bg-white/5 bg-slate-50 border dark:border-white/5 border-slate-100">
                            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
                                <div className="flex gap-4 items-center">
                                    <div className="p-4 dark:bg-white/10 bg-white dark:text-white text-slate-900 rounded-2xl border dark:border-transparent border-slate-200 shadow-sm">
                                        <Lock size={24} />
                                    </div>
                                    <div>
                                        <h4 className="dark:text-white text-slate-900 font-bold mb-1">Contraseña de Acceso</h4>
                                        <p className="dark:text-white/40 text-slate-500 text-xs shadow-black">Para mantener la seguridad, cambia tu contraseña periódicamente.</p>
                                    </div>
                                </div>

                                {isEditing ? (
                                    <div className="w-full sm:w-auto relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={editForm.password}
                                            onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                                            placeholder="Nueva contraseña..."
                                            className="w-full sm:w-64 dark:bg-[#0a0c10] bg-white border dark:border-white/10 border-slate-200 rounded-xl px-4 py-3 dark:text-white text-slate-900 focus:outline-none focus:border-blue-500 transition-colors pr-12"
                                        />
                                        <button 
                                            onClick={() => setShowPassword(!showPassword)} 
                                            className="absolute right-4 top-1/2 -translate-y-1/2 dark:text-white/40 text-slate-400 hover:dark:text-white hover:text-slate-900 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={handleEditToggle}
                                        className="px-6 py-3 dark:bg-white/10 bg-white hover:dark:bg-white/20 hover:bg-slate-50 dark:text-white text-slate-800 font-bold rounded-xl transition-colors border dark:border-white/5 border-slate-200 w-full sm:w-auto text-sm shadow-sm"
                                    >
                                        Cambiar Contraseña
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Stats & Status */}
                <div className="space-y-6 sm:space-y-8">
                    {/* Status Card */}
                    <div className="bg-gradient-to-br dark:from-[#0a0c10] dark:to-[#05070a] from-white to-slate-50 border dark:border-white/5 border-slate-200 p-6 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-[10px] dark:text-white/40 text-slate-500 font-black uppercase tracking-[0.2em]">Registro N°</span>
                            <span className="text-xs font-mono dark:text-white/60 text-slate-500 dark:bg-white/5 bg-slate-100 px-2 py-1 rounded">{profileData.id || 'N/A'}</span>
                        </div>

                        <div className="text-center mb-8">
                            <div className="w-16 h-16 mx-auto bg-green-500/10 border border-green-500/20 text-green-500 dark:text-green-400 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(34,197,94,0.1)]">
                                <Activity size={32} />
                            </div>
                            <h3 className="text-3xl font-black dark:text-white text-slate-900">Activo</h3>
                            <p className="dark:text-white/40 text-slate-500 text-[10px] uppercase tracking-widest font-bold mt-1">Estado del Perfil</p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-xl dark:bg-white/5 bg-slate-50 border dark:border-white/5 border-slate-100">
                                <div className="flex items-center gap-2 dark:text-white/60 text-slate-500 text-xs">
                                    <Calendar size={14} /> Fecha Ingreso
                                </div>
                                <span className="dark:text-white text-slate-900 font-bold text-xs">{joinDate}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl dark:bg-white/5 bg-slate-50 border dark:border-white/5 border-slate-100">
                                <div className="flex items-center gap-2 dark:text-white/60 text-slate-500 text-xs">
                                    <TrendingUp size={14} /> Nivel Acceso
                                </div>
                                <span className="text-blue-600 dark:text-blue-400 font-bold text-xs uppercase">{profileData.role}</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Infos */}
                    <div className="dark:bg-white/[0.02] bg-white border dark:border-white/5 border-slate-200 p-6 rounded-[2.5rem] shadow-xl">
                        <h4 className="text-xs font-black dark:text-white/40 text-slate-500 uppercase tracking-widest mb-4">Información del Sistema</h4>
                        
                        <div className="space-y-4">
                            <div className="flex gap-4 p-3 rounded-xl dark:bg-blue-500/5 bg-blue-50 border dark:border-blue-500/10 border-blue-200">
                                <AlertCircle size={18} className="dark:text-blue-400 text-blue-600 shrink-0" />
                                <div>
                                    <p className="dark:text-white text-slate-900 text-xs font-bold leading-tight mb-1">Auditoría Habilitada</p>
                                    <p className="dark:text-white/40 text-slate-500 text-[10px] leading-relaxed">Todas las acciones de este perfil están siendo registradas por seguridad.</p>
                                </div>
                            </div>
                            
                            {profileData.role !== 'superadmin' && (
                                <div className="flex gap-4 p-3 rounded-xl dark:bg-orange-500/5 bg-orange-50 border dark:border-orange-500/10 border-orange-200">
                                    <Lock size={18} className="dark:text-orange-400 text-orange-600 shrink-0" />
                                    <div>
                                        <p className="dark:text-white text-slate-900 text-xs font-bold leading-tight mb-1">Acceso Restringido</p>
                                        <p className="dark:text-white/40 text-slate-500 text-[10px] leading-relaxed">Solo los Super Admin pueden modificar roles o configuraciones maestras.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ProfileSection;
