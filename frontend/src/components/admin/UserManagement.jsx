import React, { useState, useEffect } from 'react';
import {
  Users, Search, Filter, Mail, UserCheck, UserX,
  Edit, Trash2, Shield, Award,
  X, AlertCircle, Sparkles, GraduationCap,
  Clock, Eye, BookOpen, Phone, CreditCard, Calendar,
  Activity, Zap
} from 'lucide-react';

import { adminService } from '../../api/adminService';

// Helper para mapeo consistente de datos
const mapUserData = (data) => {
  if (!Array.isArray(data)) return [];
  return data
    .filter(u => u.role === 'user')
    .map(u => ({
      ...u,
      name: u.full_name || 'Sin nombre',
      progress: 0, // Se llenará con stats detallados on-demand
      courses: [],
      lastLoginFormatted: u.last_login ? new Date(u.last_login).toLocaleString() : 'N/A',
      joinDateFormatted: u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'
    }));
};

const UserManagement = () => {
  // Inicialización optimista desde Cache
  const [users, setUsers] = useState(() => {
    try {
      const cached = localStorage.getItem('api_cache_/users/');
      return cached ? mapUserData(JSON.parse(cached).data) : [];
    } catch (e) { return []; }
  });

  const [isLoading, setIsLoading] = useState(users.length === 0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user',
    status: 'active',
    password: '',
    dni: '',
    phone: ''
  });

  const loadUsers = async () => {
    try {
      if (users.length === 0) setIsLoading(true);
      const data = await adminService.getUsers();
      setUsers(mapUserData(data));
    } catch (err) {
      console.error("Error loading users:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers().catch(() => {});
  }, []);

  // Listener para actualizaciones en background (SWR)
  useEffect(() => {
    const handleCacheUpdate = (event) => {
      if (event.detail.url && event.detail.url.includes('/users/')) {
        setUsers(mapUserData(event.detail.data));
      }
    };
    window.addEventListener('api-cache-updated', handleCacheUpdate);
    return () => window.removeEventListener('api-cache-updated', handleCacheUpdate);
  }, []);

  // --- Handlers ---

  const handleOpenView = async (user) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);

    // Cargar estadísticas detalladas del usuario
    try {
      const stats = await adminService.getUserStats(user.id);
      setSelectedUser(prev => ({
        ...prev,
        xp: stats.total_xp,
        progress: stats.global_progress,
        precision: stats.global_accuracy,
        module_count: stats.completed_modules_count,
        courses: stats.module_progress,
        recent_sessions: stats.recent_sessions // New live activity data
      }));
    } catch (err) {
      console.error("Error loading user stats:", err);
    }
  };

  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      password: '',
      dni: user.dni || '',
      phone: user.phone || ''
    });
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        full_name: formData.name,
        email: formData.email,
        role: formData.role,
        status: formData.status,
        dni: formData.dni,
        phone: formData.phone
      };
      if (formData.password) payload.password = formData.password;

      await adminService.updateUser(selectedUser.id, payload);
      await loadUsers();
      setIsEditModalOpen(false);
    } catch (err) {
      console.error("Error updating user:", err);
      alert("Error al actualizar usuario");
    }
  };

  const handleDeleteUser = async () => {
    try {
      await adminService.deleteUser(selectedUser.id);
      setUsers(users.filter(u => u.id !== selectedUser.id));
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Error al eliminar usuario");
    }
  };

  const toggleStatus = async (id) => {
    const user = users.find(u => u.id === id);
    if (!user) return;

    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      await adminService.updateUser(id, { status: newStatus });
      setUsers(users.map(u => u.id === id ? { ...u, status: newStatus } : u));
    } catch (err) {
      console.error("Error toggling status:", err);
    }
  };

  const filteredUsers = users.filter(user => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      user.name.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      (user.dni && user.dni.includes(term));

    let matchesFilter = true;
    if (filter !== 'all') {
      matchesFilter = user.status === filter;
    }

    return matchesSearch && matchesFilter;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const dateA = new Date(a.created_at || 0);
    const dateB = new Date(b.created_at || 0);
    return dateA - dateB; // Más antiguos primero
  });

  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
  const paginatedUsers = sortedUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const isInactiveVisual = (user) => {
    if (!user.last_active_at) return false;
    const diffTime = new Date() - new Date(user.last_active_at);
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays > 15;
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Header - Responsive */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 dark:bg-white/[0.02] bg-white backdrop-blur-3xl border dark:border-white/5 border-slate-200 p-6 sm:p-8 rounded-2xl sm:rounded-[2.5rem] dark:shadow-2xl shadow-sm relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-purple-500/10 blur-[60px] rounded-full pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg shadow-purple-500/20">
            <Users className="text-white" size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-black dark:text-white text-slate-900 tracking-tight uppercase">Gestión de Usuarios</h2>
            <p className="dark:text-white/40 text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">Administración completa de perfiles</p>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <div className="text-center px-3 sm:px-4 border-r dark:border-white/10 border-slate-200">
            <div className="text-xl sm:text-2xl font-black dark:text-white text-slate-900">{users.length}</div>
            <div className="text-[9px] sm:text-[10px] font-bold dark:text-white/40 text-slate-500 uppercase tracking-widest">Total</div>
          </div>
          <div className="text-center px-3 sm:px-4">
            <div className="text-xl sm:text-2xl   font-black text-green-500 dark:text-green-400">{users.filter(u => u.status === 'active').length}</div>
            <div className="text-[9px] sm:text-[10px] font-bold dark:text-white/40 text-slate-500 uppercase tracking-widest">Activos</div>
          </div>
        </div>
      </div>

      {/* Toolbar - Responsive */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 dark:text-white/20 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o DNI..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full dark:bg-white/[0.02] bg-white border dark:border-white/5 border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm dark:text-white text-slate-900 dark:placeholder-white/20 placeholder-slate-400 focus:outline-none focus:border-purple-500/50 transition-all font-bold hover:bg-white/[0.04]"
          />
        </div>

        <div className="relative min-w-[160px] sm:min-w-[200px]">
          <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 dark:text-white/20 text-slate-400" />
          <select
            value={filter}
            onChange={(e) => { setFilter(e.target.value); setCurrentPage(1); }}
            className="w-full dark:bg-white/[0.02] bg-white border dark:border-white/5 border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm dark:text-white text-slate-900 focus:outline-none focus:border-purple-500/50 transition-all appearance-none cursor-pointer font-bold dark:hover:bg-white/[0.04] hover:bg-slate-50"
          >
            <option value="all" className="dark:bg-[#0a0c10] bg-white">Todos</option>
            <option value="active" className="dark:bg-[#0a0c10] bg-white">Activos</option>
            <option value="inactive" className="dark:bg-[#0a0c10] bg-white">Inactivos</option>
          </select>
        </div>
      </div>

      {/* Loading State - Theme Aware */}
      {isLoading && (!users || users.length === 0) && (
        <div className="flex flex-col items-center justify-center py-20 gap-6 animate-in fade-in duration-500">
          <div className="relative">
            <div className="w-16 h-16 border-4 dark:border-purple-500/20 border-purple-500/10 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0 shadow-[0_0_20px_rgba(168,85,247,0.3)]"></div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="dark:text-purple-400 text-purple-600 font-black text-[10px] uppercase tracking-[0.4em] animate-pulse">Sincronizando Base de Datos</p>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-purple-500/40 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Lista de Usuarios - Responsive */}
      <div className="grid grid-cols-1 gap-4">
        {paginatedUsers.map((user) => (
          <div key={user.id} className="group dark:bg-white/[0.02] bg-white backdrop-blur-3xl border dark:border-white/5 border-slate-200 rounded-[2rem] p-6 dark:hover:bg-white/[0.04] hover:bg-slate-50 dark:hover:border-white/10 hover:border-slate-300 transition-all duration-300 flex flex-col lg:flex-row items-start lg:items-center gap-6 relative overflow-hidden shadow-sm dark:shadow-none">

            {/* Perfil Básico - Responsive */}
            <div className="flex items-center gap-3 sm:gap-5 w-full lg:w-1/3 min-w-0">
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center text-lg sm:text-xl font-bold shadow-lg shrink-0 ${user.role === 'admin' ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-purple-500/20' :
                'dark:bg-white/5 bg-slate-100 border dark:border-white/10 border-slate-200 dark:text-white/60 text-slate-600'
                }`}>
                {user.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg font-bold dark:text-white text-slate-900 flex items-center gap-2 truncate">
                  <span className="truncate">{user.name}</span>
                  {user.role === 'admin' && <Shield size={14} className="text-purple-500 dark:text-purple-400 shrink-0" />}
                </h3>
                <div className="flex flex-col text-xs sm:text-sm dark:text-white/40 text-slate-500 font-medium">
                  <span className="truncate" title={user.email}>{user.email}</span>
                  <div className="flex items-center gap-2 mt-1">
                    {user.dni && <span className="text-[10px] dark:text-white/20 text-slate-400">DNI: {user.dni}</span>}
                    {isInactiveVisual(user) && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-orange-500/10 text-orange-500 border border-orange-500/20">
                        Inactivo 15+ días
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Resumidas - Responsive */}
            <div className="flex-1 w-full grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 items-center">
              <div className="dark:bg-white/5 bg-slate-50 rounded-lg sm:rounded-xl p-2 sm:p-3 border dark:border-white/5 border-slate-200 hidden sm:block">
                <div className="text-[9px] sm:text-[10px] font-bold dark:text-white/30 text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                  <Award size={10} /> Nivel
                </div>
                <div className="text-xs sm:text-sm font-black dark:text-white text-slate-900 truncate">{Math.floor((user.xp || 0) / 100) + 1}</div>
              </div>

              <div className="dark:bg-white/5 bg-slate-50 rounded-lg sm:rounded-xl p-2 sm:p-3 border dark:border-white/5 border-slate-200 min-w-[140px]">
                <div className="flex justify-between items-center mb-1">
                  <div className="text-[9px] font-black dark:text-white/30 text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <BookOpen size={10} /> PROGRESO
                  </div>
                  <div className="text-[10px] font-bold text-green-500 dark:text-green-400">{Math.round(user.progress_summary?.global_progress || 0)}%</div>
                </div>
                <div className="h-1.5 w-full dark:bg-white/10 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                    style={{ width: `${user.progress_summary?.global_progress || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Botonera - Responsive */}
            <div className="flex items-center gap-2 w-full lg:w-auto justify-end border-t lg:border-t-0 border-white/5 pt-3 lg:pt-0">
              <button onClick={() => handleOpenView(user)} className="p-2 sm:p-3 bg-purple-500/10 text-purple-400 hover:bg-purple-500 hover:text-white rounded-lg sm:rounded-xl transition-all" title="Ver Detalles Completos"><Eye size={16} /></button>
              <button onClick={() => handleOpenEdit(user)} className="p-2 sm:p-3 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg sm:rounded-xl transition-all"><Edit size={16} /></button>
              <button onClick={() => toggleStatus(user.id)} className={`p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all ${user.status === 'active' ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'}`} title={user.status === 'active' ? 'Desactivar' : 'Activar'}>
                {user.status === 'active' ? <UserCheck size={16} /> : <UserX size={16} />}
              </button>
              <button onClick={() => handleOpenDelete(user)} className="p-2 sm:p-3 bg-white/5 text-white/40 hover:bg-red-500 hover:text-white rounded-lg sm:rounded-xl transition-all"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>

      {/* Controles de Paginación */}
      {totalPages > 1 && (
        <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4 mt-8 pb-4">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl dark:bg-white/5 bg-slate-100 text-xs sm:text-sm font-black dark:text-white/60 text-slate-600 disabled:opacity-30 dark:hover:bg-white/10 hover:bg-slate-200 transition-all border dark:border-white/10 border-slate-200 active:scale-95"
          >
            Anterior
          </button>
          
          <div className="flex items-center gap-1 sm:gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl text-xs sm:text-sm font-black transition-all active:scale-95 flex items-center justify-center ${
                  currentPage === i + 1 
                    ? 'bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/20' 
                    : 'dark:bg-white/5 bg-slate-100 dark:text-white/60 text-slate-600 dark:hover:bg-white/10 hover:bg-slate-200 dark:border-white/10 border-slate-200 border'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl dark:bg-white/5 bg-slate-100 text-xs sm:text-sm font-black dark:text-white/60 text-slate-600 disabled:opacity-30 dark:hover:bg-white/10 hover:bg-slate-200 transition-all border dark:border-white/10 border-slate-200 active:scale-95"
          >
            Siguiente
          </button>
        </div>
      )}

      {/* Modal Ver Detalles Completos - Responsive */}
      {isViewModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="absolute inset-0 dark:bg-[#05070a]/60 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsViewModalOpen(false)}></div>

          <div className="dark:bg-[#0a0c10] bg-white ring-1 dark:ring-white/10 ring-slate-200 w-full max-w-4xl max-h-[90vh] sm:max-h-[85vh] rounded-2xl sm:rounded-[2.5rem] relative z-10 flex flex-col dark:shadow-[0_0_100px_-20px_rgba(0,0,0,0.5)] shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">

            {/* Botón Cerrar Flotante */}
            <button
              onClick={() => setIsViewModalOpen(false)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-50 p-1.5 sm:p-2 dark:bg-black/20 bg-slate-100/50 hover:bg-slate-200 dark:hover:bg-white/10 dark:text-white/50 text-slate-500 dark:hover:text-white hover:text-slate-900 rounded-full transition-all backdrop-blur-sm"
            >
              <X size={20} />
            </button>

            {/* ContenedorScrollableCompleto */}
            <div className="flex flex-col md:flex-row overflow-hidden flex-1 dark:bg-[#0a0c10] bg-white">
              {/* Columna Izquierda: Perfil - Responsive */}
              <div className="w-full md:w-1/3 dark:bg-[#05070a]/40 bg-slate-50 p-4 sm:p-6 lg:p-10 flex flex-col overflow-y-auto custom-scrollbar relative">
                {/* Decoración de fondo */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none" />

                <div className="text-center mb-8 relative z-10">
                  <div className="relative inline-block group">
                    <div className={`w-28 h-28 sm:w-36 sm:h-36 mx-auto rounded-[2.5rem] flex items-center justify-center text-4xl sm:text-6xl font-black text-white shadow-2xl mb-6 ring-4 dark:ring-white/10 ring-slate-200 ${selectedUser.role === 'admin' ? 'bg-gradient-to-br from-purple-500 to-indigo-600 shadow-purple-500/20' : 'bg-gradient-to-br from-blue-500 to-emerald-500 shadow-blue-500/20'} transition-transform duration-500 group-hover:scale-105`}>
                      {selectedUser.name.charAt(0)}
                    </div>
                    <div className={`absolute -bottom-2 -right-2 p-2 rounded-2xl border-2 dark:border-slate-950 border-white shadow-xl ${selectedUser.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}>
                      <Activity size={16} className="text-white" />
                    </div>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black dark:text-white text-slate-900 leading-tight mb-2 truncate px-2">{selectedUser.name}</h2>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-500 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest leading-none">Nivel {Math.floor((selectedUser.xp || 0) / 100) + 1}</span>
                    <span className={`px-3 py-1 border rounded-full text-[10px] font-black uppercase tracking-widest leading-none ${selectedUser.role === 'admin' ? 'bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400' : 'dark:bg-white/5 bg-slate-200 dark:border-white/10 border-slate-300 dark:text-white/40 text-slate-500'}`}>
                      {selectedUser.role === 'admin' ? 'Administrador' : 'Estudiante'}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 flex-1">
                  <h4 className="text-[10px] font-black dark:text-white/20 text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <UserCheck size={14} /> Información de Perfil
                  </h4>

                  <div className="dark:bg-[#0a0c10]/60 bg-white p-4 rounded-2xl border dark:border-white/5 border-slate-200 group dark:hover:border-white/10 hover:border-slate-300 transition-all dark:hover:bg-[#0a0c10] hover:bg-slate-50">
                    <div className="flex items-center gap-3 dark:text-white/30 text-slate-400 mb-2 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                      <Mail size={12} />
                      <span className="text-[9px] uppercase font-black tracking-widest">Email Corporativo / Personal</span>
                    </div>
                    <div className="dark:text-white text-slate-900 font-bold text-sm truncate" title={selectedUser.email}>{selectedUser.email}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="dark:bg-[#0a0c10]/60 bg-white p-4 rounded-2xl border dark:border-white/5 border-slate-200 group">
                      <div className="flex items-center gap-2 dark:text-white/30 text-slate-400 mb-1 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">
                        <CreditCard size={12} /> <span className="text-[9px] uppercase font-black tracking-widest">DNI</span>
                      </div>
                      <div className="dark:text-white text-slate-900 font-bold text-sm">{selectedUser.dni || '---'}</div>
                    </div>
                    <div className="dark:bg-[#0a0c10]/60 bg-white p-4 rounded-2xl border dark:border-white/5 border-slate-200 group">
                      <div className="flex items-center gap-2 dark:text-white/30 text-slate-400 mb-1 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors">
                        <Phone size={12} /> <span className="text-[9px] uppercase font-black tracking-widest">Tel</span>
                      </div>
                      <div className="dark:text-white text-slate-900 font-bold text-sm">{selectedUser.phone || '---'}</div>
                    </div>
                  </div>

                  <div className="dark:bg-[#0a0c10]/60 bg-white p-4 rounded-2xl border dark:border-white/5 border-slate-200 group">
                    <div className="flex items-center gap-3 dark:text-white/30 text-slate-400 mb-2 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors">
                      <Calendar size={12} /> <span className="text-[9px] uppercase font-black tracking-widest">Fecha de Registro</span>
                    </div>
                    <div className="dark:text-white/60 text-slate-600 font-bold text-sm tracking-tight">{selectedUser.joinDateFormatted}</div>
                  </div>
                </div>
              </div>

              {/* Columna Derecha: Métricas y Cursos - Responsive */}
              <div className="w-full md:w-2/3 p-4 sm:p-6 lg:p-10 flex flex-col dark:bg-[#0a0c10] bg-white relative overflow-y-auto custom-scrollbar border-l dark:border-white/5 border-slate-200">
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-1">
                    <GraduationCap className="text-purple-500 dark:text-purple-400" size={24} />
                    <h3 className="text-xl sm:text-3xl font-black dark:text-white text-slate-900 tracking-tight">Rendimiento Académico</h3>
                  </div>
                  <p className="dark:text-white/30 text-slate-500 text-xs sm:text-sm font-medium">Estadísticas de aprendizaje sincronizadas con el servidor</p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-10">
                  <div className="dark:bg-white/[0.03] bg-slate-50 border dark:border-white/5 border-slate-200 p-4 sm:p-6 rounded-3xl text-center group hover:border-yellow-500/30 transition-all">
                    <div className="text-xl sm:text-2xl font-black dark:text-white text-slate-900 mb-1 group-hover:text-yellow-500 transition-colors">{selectedUser.xp || 0}</div>
                    <div className="text-[9px] font-black dark:text-white/20 text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1">XP ACUMULADO</div>
                  </div>
                  <div className="dark:bg-white/[0.03] bg-slate-50 border dark:border-white/5 border-slate-200 p-4 sm:p-6 rounded-3xl text-center group hover:border-blue-500/30 transition-all">
                    <div className="text-xl sm:text-2xl font-black dark:text-white text-slate-900 mb-1 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">{selectedUser.progress || 0}%</div>
                    <div className="text-[9px] font-black dark:text-white/20 text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1">PROGRESO REAL</div>
                  </div>
                  <div className="dark:bg-white/[0.03] bg-slate-50 border dark:border-white/5 border-slate-200 p-4 sm:p-6 rounded-3xl text-center group hover:border-green-500/30 transition-all">
                    <div className="text-xl sm:text-2xl font-black dark:text-white text-slate-900 mb-1 group-hover:text-green-500 dark:group-hover:text-green-400 transition-colors">{selectedUser.precision || 0}%</div>
                    <div className="text-[9px] font-black dark:text-white/20 text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1">PRECISIÓN MEDIA</div>
                  </div>
                  <div className="dark:bg-white/[0.03] bg-slate-50 border dark:border-white/5 border-slate-200 p-4 sm:p-6 rounded-3xl text-center group hover:border-purple-500/30 transition-all">
                    <div className="text-xl sm:text-2xl font-black dark:text-white text-slate-900 mb-1 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors">{selectedUser.module_count || 0}</div>
                    <div className="text-[9px] font-black dark:text-white/20 text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1">MÓDULOS CERRADOS</div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2 space-y-12">

                  {/* Desglose de Módulos */}
                  <div>
                    <h4 className="text-[10px] sm:text-[11px] font-black dark:text-white/20 text-slate-400 mb-6 uppercase tracking-[0.25em] sticky top-0 dark:bg-[#0a0c10] bg-white py-4 z-20 border-b dark:border-white/5 border-slate-200 flex items-center justify-between">
                      <span>Maestría por Contenido</span>
                      <span className="text-blue-500/60 dark:text-blue-400/40">{selectedUser.courses?.length || 0} módulos</span>
                    </h4>
                    <div className="grid grid-cols-1 gap-4">
                      {selectedUser.courses?.map((course, i) => (
                        <div key={i} className="group flex items-center justify-between dark:bg-[#05070a]/40 bg-slate-50 p-5 rounded-3xl border dark:border-white/5 border-slate-200 hover:border-blue-500/30 transition-all duration-500 shadow-xl overflow-hidden relative">
                          <div className={`absolute top-0 left-0 w-1 h-full ${course.progress >= 95 ? 'bg-green-500' : 'bg-blue-600'} opacity-50`} />

                          <div className="flex items-center gap-5 flex-1 min-w-0">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-inner group-hover:scale-110 transition-all duration-500 ${course.progress >= 95 ? 'bg-green-500/10' : 'bg-blue-600/10'}`}>
                              {course.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0 pr-4">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="font-black dark:text-white text-slate-800 text-lg tracking-tight truncate">{course.name}</span>
                                <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${course.status === 'Completado' ? 'bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/20' : 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20'}`}>
                                  {course.status}
                                </span>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="flex-1 h-2 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/5">
                                  <div
                                    className={`h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(37,99,235,0.3)] ${course.progress >= 95 ? 'bg-green-500' : 'bg-blue-600'}`}
                                    style={{ width: `${course.progress}%` }}
                                  />
                                </div>
                                <span className="text-[11px] font-black text-white tracking-widest min-w-[35px]">{course.progress}%</span>
                              </div>
                            </div>
                          </div>
                          <div className="pl-6 border-l border-white/5 text-right min-w-[90px] group-hover:bg-white/[0.02] transition-colors py-1">
                            <p className="text-[9px] font-black dark:text-white/20 text-slate-400 uppercase tracking-widest mb-1">RÉCORD</p>
                            <p className={`text-2xl font-black ${course.precision >= 90 ? 'text-green-400' : 'text-blue-400'}`}>{course.precision}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Últimas Sesiones (NUEVO) */}
                  <div className="pb-10">
                    <h4 className="text-[10px] sm:text-[11px] font-black dark:text-white/20 text-slate-400 mb-6 uppercase tracking-[0.25em] sticky top-0 dark:bg-[#0a0c10] bg-white py-4 z-20 border-b dark:border-white/5 border-slate-200 flex items-center justify-between">
                      <span>Historial Reciente</span>
                      <Sparkles size={14} className="text-yellow-500/40" />
                    </h4>

                    <div className="space-y-3">
                      {selectedUser.recent_sessions?.map((session, i) => (
                        <div key={i} className="flex items-center justify-between p-4 dark:bg-white/[0.02] bg-slate-50 rounded-2xl border dark:border-white/5 border-slate-200 group hover:dark:bg-white/[0.04] hover:bg-slate-100 transition-all">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500 dark:text-blue-400 group-hover:scale-110 transition-transform">
                              <Zap size={16} />
                            </div>
                            <div>
                              <p className="text-xs font-black dark:text-white text-slate-800 tracking-tight">{session.module}</p>
                              <div className="flex items-center gap-3 text-[10px] dark:text-white/30 text-slate-500 font-bold uppercase tracking-widest">
                                <span>{session.date}</span>
                                <span className="dark:text-white/10 text-slate-300">•</span>
                                <span className="text-yellow-600 dark:text-yellow-500/60">+{session.xp} XP</span>
                              </div>
                            </div>
                          </div>
                           <div className="text-right">
                            <div className="text-lg font-black dark:text-white text-slate-900 leading-none">{session.accuracy}%</div>
                            <p className="text-[8px] font-black dark:text-white/20 text-slate-400 uppercase tracking-[0.2em] mt-1">Precisión</p>
                          </div>
                        </div>
                      ))}
                      {(!selectedUser.recent_sessions || selectedUser.recent_sessions.length === 0) && (
                        <div className="py-12 border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center opacity-30">
                          <Clock size={32} className="mb-3" />
                          <p className="text-[10px] font-black uppercase tracking-widest">Sin actividad reciente</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar - Responsive */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="absolute inset-0 dark:bg-[#05070a]/80 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsEditModalOpen(false)}></div>
          <form onSubmit={handleSaveUser} className="dark:bg-[#0a0c10] bg-white border dark:border-white/10 border-slate-200 w-full max-w-2xl rounded-2xl sm:rounded-[3rem] relative z-10 p-6 sm:p-8 lg:p-10 shadow-2xl animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar">

            <div className="flex items-center gap-4 sm:gap-6 mb-6 sm:mb-8 border-b dark:border-white/10 border-slate-200 pb-4 sm:pb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-bold text-white shadow-lg">
                <Edit size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-2xl font-bold dark:text-white text-slate-900 truncate">Editar Perfil de Usuario</h3>
                <p className="dark:text-white/40 text-slate-500 text-xs sm:text-sm">Actualiza la información personal y permisos</p>
              </div>
              <button type="button" onClick={() => setIsEditModalOpen(false)} className="p-1.5 sm:p-2 dark:bg-white/5 bg-slate-100 rounded-full dark:text-white/50 text-slate-500 dark:hover:text-white hover:text-slate-900 shrink-0"><X size={20} /></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="space-y-2">
                <label className="text-[9px] sm:text-[10px] font-black dark:text-white/40 text-slate-500 uppercase tracking-widest pl-1">Nombre Completo</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full dark:bg-[#05070a] bg-slate-50 border dark:border-white/10 border-slate-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base dark:text-white text-slate-900 font-bold focus:outline-none focus:border-blue-500/50" />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] sm:text-[10px] font-black dark:text-white/40 text-slate-500 uppercase tracking-widest pl-1">Correo Electrónico</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full dark:bg-[#05070a] bg-slate-50 border dark:border-white/10 border-slate-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base dark:text-white text-slate-900 font-bold focus:outline-none focus:border-blue-500/50" />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] sm:text-[10px] font-black dark:text-white/40 text-slate-500 uppercase tracking-widest pl-1">DNI (Documento Identidad)</label>
                <input type="text" value={formData.dni} onChange={(e) => setFormData({ ...formData, dni: e.target.value })} className="w-full dark:bg-[#05070a] bg-slate-50 border dark:border-white/10 border-slate-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base dark:text-white text-slate-900 font-bold focus:outline-none focus:border-blue-500/50" placeholder="00000000" />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] sm:text-[10px] font-black dark:text-white/40 text-slate-500 uppercase tracking-widest pl-1">Teléfono</label>
                <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full dark:bg-[#05070a] bg-slate-50 border dark:border-white/10 border-slate-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base dark:text-white text-slate-900 font-bold focus:outline-none focus:border-blue-500/50" placeholder="+51 ..." />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] sm:text-[10px] font-black dark:text-white/40 text-slate-500 uppercase tracking-widest pl-1">Rol de Sistema</label>
                <div className="w-full dark:bg-[#05070a]/50 bg-slate-100 border dark:border-white/5 border-slate-200 rounded-xl px-4 py-3 dark:text-white/40 text-slate-500 font-bold text-sm">
                  Estudiante (user)
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] sm:text-[10px] font-black dark:text-white/40 text-slate-500 uppercase tracking-widest pl-1">Estado de Cuenta</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full dark:bg-[#05070a] bg-slate-50 border dark:border-white/10 border-slate-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base dark:text-white text-slate-900 font-bold focus:outline-none focus:border-blue-500/50 appearance-none cursor-pointer">
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                  <option value="suspended">Suspendido</option>
                </select>
              </div>

              <div className="col-span-1 md:col-span-2 space-y-2 pt-2">
                <label className="text-[9px] sm:text-[10px] font-black dark:text-white/40 text-slate-500 uppercase tracking-widest pl-1">Cambiar Contraseña (Opcional)</label>
                <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full dark:bg-[#05070a] bg-slate-50 border dark:border-white/10 border-slate-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base dark:text-white text-slate-900 font-bold focus:outline-none focus:border-blue-500/50" placeholder="Dejar en blanco para mantener la actual" />
              </div>
            </div>

            <div className="flex gap-3 sm:gap-4 border-t dark:border-white/5 border-slate-200 pt-4 sm:pt-6">
              <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-3 sm:py-4 rounded-xl border dark:border-white/10 border-slate-300 text-sm sm:text-base dark:text-white text-slate-600 font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition-all">Cancelar</button>
              <button type="submit" className="flex-1 py-3 sm:py-4 rounded-xl bg-blue-600 text-sm sm:text-base text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all">Guardar Cambios</button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Eliminar - Responsive */}
      {isDeleteModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="absolute inset-0 dark:bg-[#05070a]/80 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsDeleteModalOpen(false)}></div>
          <div className="dark:bg-[#0a0c10] bg-white border border-red-500/30 w-full max-w-sm rounded-2xl sm:rounded-[2.5rem] relative z-10 p-6 sm:p-8 text-center shadow-[0_0_50px_rgba(239,68,68,0.2)] animate-in zoom-in duration-300">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 border border-red-500/20">
              <AlertCircle size={28} className="text-red-500" />
            </div>
            <h3 className="text-lg sm:text-xl font-black dark:text-white text-slate-900 mb-2">¿Eliminar Usuario?</h3>
            <p className="dark:text-white/60 text-slate-600 text-xs sm:text-sm mb-6 sm:mb-8">
              Se eliminará a <strong className="dark:text-white text-slate-900">{selectedUser.name}</strong> y todo su historial.
            </p>
            <div className="flex gap-2 sm:gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-2.5 sm:py-3 rounded-xl border dark:border-white/10 border-slate-300 text-sm sm:text-base dark:text-white text-slate-600 font-bold hover:bg-slate-50 dark:hover:bg-white/5">Cancelar</button>
              <button onClick={handleDeleteUser} className="flex-1 py-2.5 sm:py-3 rounded-xl bg-red-500 text-sm sm:text-base text-white font-bold hover:bg-red-600 shadow-lg shadow-red-500/20">Eliminar</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.05); border-radius: 10px; }
        :global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(59, 130, 246, 0.2); }
      `}</style>
    </div>
  );
};

export default UserManagement;