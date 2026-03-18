import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut } from 'lucide-react';
import { authStorage } from '../../utils/authStorage';

const AdminProfile = ({ user, onLogout, onSectionChange }) => {
    const [showMenu, setShowMenu] = useState(false);
    const realUser = user || authStorage.getUser() || {};
    
    const [profileData, setProfileData] = useState({
        name: realUser?.full_name || realUser?.name || 'Administrador',
        email: realUser?.email || 'admin@sistema.com',
        avatar: null
    });

    const menuRef = useRef(null);

    useEffect(() => {
        if (realUser) {
            setProfileData({
                name: realUser.full_name || realUser.name || 'Administrador',
                email: realUser.email || 'admin@sistema.com',
                avatar: null
            });
        }
    }, [user]);

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

    const handleViewProfile = () => {
        setShowMenu(false);
        if (onSectionChange) {
            onSectionChange('profile');
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
                    <p className="text-xs sm:text-sm font-bold dark:text-white text-slate-900 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors uppercase tracking-tight">{profileData.name}</p>
                    <div className="flex items-center justify-end gap-1.5">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                        <p className="text-[9px] sm:text-[10px] dark:text-white/40 text-slate-500 font-bold uppercase tracking-widest">{role}</p>
                    </div>
                </div>
                <div className="relative">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 p-0.5 shadow-lg group-hover:rotate-3 transition-transform duration-300">
                        <div className="w-full h-full rounded-[10px] sm:rounded-[14px] dark:bg-[#0a0c10] bg-white flex items-center justify-center overflow-hidden relative">
                            {profileData.avatar ? (
                                <img src={profileData.avatar} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <>
                                    <div className="absolute inset-0 bg-gradient-to-tr dark:from-blue-900 from-blue-100 dark:to-[#0a0c10] to-white opacity-50"></div>
                                    <span className="relative z-10 font-black text-base sm:text-lg dark:text-white text-blue-600">
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
                <div className="absolute top-14 sm:top-16 right-0 w-56 sm:w-64 dark:bg-[#0a0c10] bg-white dark:border dark:border-white/10 border border-slate-200 rounded-xl sm:rounded-2xl shadow-2xl p-2 animate-in fade-in slide-in-from-top-2 z-50 overflow-hidden">
                    <div className="p-3 sm:p-4 dark:border-b dark:border-white/5 border-b border-slate-200 mb-2 dark:bg-white/5 bg-slate-50 rounded-lg sm:rounded-xl">
                        <p className="dark:text-white text-slate-900 text-xs sm:text-sm font-bold truncate">{profileData.name}</p>
                        <p className="dark:text-white/40 text-slate-500 text-[10px] sm:text-xs truncate">{profileData.email}</p>
                    </div>
                    <div className="space-y-1">
                        <button
                            onClick={handleViewProfile}
                            className="w-full flex items-center gap-3 px-3 py-2 sm:py-2.5 rounded-lg sm:rounded-xl dark:text-white/70 text-slate-600 hover:text-blue-600 dark:hover:text-white dark:hover:bg-white/5 hover:bg-slate-100 text-xs font-bold transition-all"
                        >
                            <User size={16} className="text-blue-500" /> Ver Perfil
                        </button>
                        <div className="h-px dark:bg-white/5 bg-slate-100 my-1"></div>
                        <button
                            onClick={onLogout}
                            className="w-full flex items-center gap-3 px-3 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-red-500 dark:text-red-400 hover:text-white hover:bg-red-500 text-xs font-bold transition-all group"
                        >
                            <LogOut size={16} className="group-hover:translate-x-1 transition-transform" /> Cerrar Sesión
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProfile;
