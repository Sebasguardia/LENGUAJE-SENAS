import React, { useState } from 'react';
import {
  Users, Search, Filter, Mail, UserCheck, UserX,
  Edit, Trash2, MoreVertical, Shield, Award,
  CheckCircle2, X, AlertCircle, Sparkles, GraduationCap,
  Calendar, Clock, TrendingUp, Eye, BookOpen, Star
} from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'María González',
      email: 'maria@email.com',
      role: 'Estudiante',
      status: 'active',
      progress: 85,
      xp: 1250,
      joinDate: '2024-01-15',
      lastLogin: 'Hace 2 horas',
      courses: [
        { name: 'Vocales', progress: 100, status: 'Completado', score: 98, lastActivity: '24/01/2024' },
        { name: 'Números', progress: 70, status: 'En Progreso', score: 85, lastActivity: '23/01/2024' },
        { name: 'Abecedario', progress: 0, status: 'No Iniciado', score: 0, lastActivity: '-' },
      ]
    },
    {
      id: 2,
      name: 'Carlos Rodríguez',
      email: 'carlos@email.com',
      role: 'Estudiante',
      status: 'active',
      progress: 62,
      xp: 850,
      joinDate: '2024-01-10',
      lastLogin: 'Hace 1 día',
      courses: [
        { name: 'Vocales', progress: 100, status: 'Completado', score: 90, lastActivity: '20/01/2024' },
        { name: 'Números', progress: 24, status: 'En Progreso', score: 60, lastActivity: '22/01/2024' },
      ]
    },
    {
      id: 3,
      name: 'Ana Martínez',
      email: 'ana@email.com',
      role: 'Estudiante',
      status: 'inactive',
      progress: 45,
      xp: 420,
      joinDate: '2024-01-05',
      lastLogin: 'Hace 5 días',
      courses: [
        { name: 'Vocales', progress: 45, status: 'En Progreso', score: 70, lastActivity: '18/01/2024' }
      ]
    },
    {
      id: 4,
      name: 'Pedro López',
      email: 'pedro@email.com',
      role: 'Premium',
      status: 'active',
      progress: 92,
      xp: 2100,
      joinDate: '2024-01-08',
      lastLogin: 'Hace 10 min',
      courses: [
        { name: 'Vocales', progress: 100, status: 'Completado', score: 100, lastActivity: '10/01/2024' },
        { name: 'Números', progress: 100, status: 'Completado', score: 95, lastActivity: '12/01/2024' },
        { name: 'Abecedario', progress: 80, status: 'En Progreso', score: 92, lastActivity: 'Hoje' },
      ]
    },
    {
      id: 5,
      name: 'Laura Sánchez',
      email: 'laura@email.com',
      role: 'Estudiante',
      status: 'active',
      progress: 78,
      xp: 1100,
      joinDate: '2024-01-12',
      lastLogin: 'Hace 3 horas',
      courses: [
        { name: 'Vocales', progress: 100, status: 'Completado', score: 88, lastActivity: '15/01/2024' },
        { name: 'Números', progress: 56, status: 'En Progreso', score: 75, lastActivity: '24/01/2024' },
      ]
    },
    {
      id: 6,
      name: 'Admin Principal',
      email: 'admin@instituto.com',
      role: 'Administrador',
      status: 'active',
      progress: 100,
      xp: 5000,
      joinDate: '2024-01-01',
      lastLogin: 'Ahora',
      courses: []
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'Estudiante', status: 'active' });

  // --- Handlers ---

  const handleOpenView = (user) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    });
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleSaveUser = (e) => {
    e.preventDefault();
    setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...formData } : u));
    setIsEditModalOpen(false);
  };

  const handleDeleteUser = () => {
    setUsers(users.filter(u => u.id !== selectedUser.id));
    setIsDeleteModalOpen(false);
  };

  const toggleStatus = (id) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u));
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || user.status === filter || user.role === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Header Interactivo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/40 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg shadow-purple-500/20">
            <Users className="text-white" size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Gestión de Usuarios</h2>
            <p className="text-white/40 text-sm">Administra estudiantes, roles y permisos</p>
          </div>
        </div>

        {/* Stats Rápidos */}
        <div className="flex items-center gap-6 hidden lg:flex">
          <div className="text-center px-4 border-r border-white/10">
            <div className="text-2xl font-black text-white">{users.length}</div>
            <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Total</div>
          </div>
          <div className="text-center px-4 border-r border-white/10">
            <div className="text-2xl font-black text-green-400">{users.filter(u => u.status === 'active').length}</div>
            <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Activos</div>
          </div>
          <div className="text-center px-4">
            <div className="text-2xl font-black text-yellow-400">{users.filter(u => u.role === 'Premium').length}</div>
            <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Premium</div>
          </div>
        </div>
      </div>

      {/* Barra de Herramientas */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
          <input
            type="text"
            placeholder="Buscar por nombre o correo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/40 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-white/20 focus:outline-none focus:border-purple-500/50 transition-all font-medium"
          />
        </div>

        <div className="relative min-w-[200px]">
          <Filter size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full bg-slate-900/40 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-purple-500/50 transition-all appearance-none cursor-pointer font-bold"
          >
            <option value="all">Todos</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
            <option value="Premium">Premium</option>
            <option value="Administrador">Admins</option>
          </select>
        </div>
      </div>

      {/* Lista de Usuarios */}
      <div className="grid grid-cols-1 gap-4">
        {filteredUsers.map((user) => (
          <div key={user.id} className="group bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 hover:border-white/20 transition-all duration-300 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">

            {/* Avatar & Info Principal */}
            <div className="flex items-center gap-5 w-full md:w-1/3">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg ${user.role === 'Administrador' ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-purple-500/20' :
                  user.role === 'Premium' ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-yellow-500/20' :
                    'bg-white/5 border border-white/10 text-white/60'
                }`}>
                {user.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  {user.name}
                  {user.role === 'Premium' && <Sparkles size={14} className="text-yellow-400" />}
                  {user.role === 'Administrador' && <Shield size={14} className="text-purple-400" />}
                </h3>
                <p className="text-white/40 text-sm font-medium">{user.email}</p>
              </div>
            </div>

            {/* Stats & Progreso */}
            <div className="flex-1 w-full grid grid-cols-2 md:grid-cols-3 gap-4 items-center">
              <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1 flex items-center gap-1">
                  <GraduationCap size={10} /> Progreso
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-green-400 rounded-full" style={{ width: `${user.progress}%` }}></div>
                  </div>
                  <span className="text-xs font-bold text-green-400">{user.progress}%</span>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-3 border border-white/5 hidden md:block">
                <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1 flex items-center gap-1">
                  <Award size={10} /> Experiencia
                </div>
                <div className="text-sm font-black text-white">{user.xp} XP</div>
              </div>

              <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1 flex items-center gap-1">
                  <Clock size={10} /> Activo
                </div>
                <div className="text-xs font-bold text-white/60">{user.lastLogin}</div>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
              <button
                onClick={() => toggleStatus(user.id)}
                className={`p-3 rounded-xl transition-all ${user.status === 'active'
                    ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                    : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                  }`}
                title={user.status === 'active' ? 'Desactivar' : 'Activar'}
              >
                {user.status === 'active' ? <UserCheck size={18} /> : <UserX size={18} />}
              </button>

              <button
                onClick={() => handleOpenView(user)}
                className="p-3 bg-purple-500/10 text-purple-400 hover:bg-purple-500 hover:text-white rounded-xl transition-all"
                title="Ver Progreso Detallado"
              >
                <Eye size={18} />
              </button>

              <button
                onClick={() => handleOpenEdit(user)}
                className="p-3 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-xl transition-all"
              >
                <Edit size={18} />
              </button>

              <button
                onClick={() => handleOpenDelete(user)}
                className="p-3 bg-white/5 text-white/40 hover:bg-red-500 hover:text-white rounded-xl transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* Modal Ver Detalles y Progreso */}
      {isViewModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsViewModalOpen(false)}></div>
          <div className="bg-slate-900 border border-white/10 w-full max-w-2xl max-h-[90vh] rounded-[3rem] relative z-10 overflow-hidden shadow-[0_0_100px_rgba(124,58,237,0.2)] flex flex-col animate-in zoom-in duration-300">

            {/* Header del Modal */}
            <div className="relative bg-gradient-to-r from-purple-900/50 to-blue-900/50 p-8 pt-10 border-b border-white/10">
              <button onClick={() => setIsViewModalOpen(false)} className="absolute top-6 right-6 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-all"><X size={20} /></button>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-3xl bg-slate-950/50 p-1.5 border-2 border-white/10 shadow-2xl">
                  <div className={`w-full h-full rounded-2xl flex items-center justify-center text-3xl font-bold text-white ${selectedUser.role === 'Premium' ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 'bg-gradient-to-br from-blue-500 to-purple-600'
                    }`}>
                    {selectedUser.name.charAt(0)}
                  </div>
                </div>
                <div>
                  <div className="flex gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest ${selectedUser.status === 'active' ? 'bg-green-400/20 text-green-400' : 'bg-red-400/20 text-red-400'}`}>{selectedUser.status}</span>
                    <span className="px-2 py-0.5 rounded-md bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest">{selectedUser.role}</span>
                  </div>
                  <h2 className="text-3xl font-black text-white">{selectedUser.name}</h2>
                  <p className="text-white/60 text-sm flex items-center gap-2"><Mail size={12} /> {selectedUser.email}</p>
                </div>
              </div>
            </div>

            {/* Contenido Scrollable */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">

              {/* Métricas Generales */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 text-center">
                  <div className="text-white/30 text-[10px] font-bold uppercase tracking-widest mb-1">XP Total</div>
                  <div className="text-2xl font-black text-yellow-400 flex items-center justify-center gap-1">
                    <Award size={18} /> {selectedUser.xp}
                  </div>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 text-center">
                  <div className="text-white/30 text-[10px] font-bold uppercase tracking-widest mb-1">Promedio</div>
                  <div className="text-2xl font-black text-blue-400">
                    {selectedUser.progress}%
                  </div>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 text-center">
                  <div className="text-white/30 text-[10px] font-bold uppercase tracking-widest mb-1">Miembro desde</div>
                  <div className="text-lg font-bold text-white mt-1">
                    {new Date(selectedUser.joinDate).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Lista de Cursos Detallada */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <BookOpen className="text-purple-400" size={20} />
                  Progreso Académico
                </h3>
                <div className="space-y-3">
                  {selectedUser.courses && selectedUser.courses.length > 0 ? (
                    selectedUser.courses.map((course, i) => (
                      <div key={i} className="bg-white/5 rounded-2xl p-4 border border-white/5 hover:bg-white/10 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
                              <BookOpen size={16} />
                            </div>
                            <span className="text-white font-bold">{course.name}</span>
                          </div>
                          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg ${course.status === 'Completado' ? 'bg-green-400/10 text-green-400' : 'bg-blue-400/10 text-blue-400'
                            }`}>
                            {course.status}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-white/40 font-medium">
                            <span>Avance: {course.progress}%</span>
                            <span>Nota: {course.score}/100</span>
                          </div>
                          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${course.progress === 100 ? 'bg-green-400' : 'bg-blue-500'
                                }`}
                              style={{ width: `${course.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-white/30 text-sm italic border border-dashed border-white/10 rounded-2xl">
                      El usuario no ha iniciado ningún curso todavía.
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Modal Editar */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setIsEditModalOpen(false)}></div>
          <form onSubmit={handleSaveUser} className="bg-slate-900 border border-white/10 w-full max-w-md rounded-[2.5rem] relative z-10 p-8 shadow-2xl animate-in zoom-in duration-300">
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-lg mb-4">
                {selectedUser.name.charAt(0)}
              </div>
              <h3 className="text-2xl font-bold text-white">Editar Perfil</h3>
              <p className="text-white/40 text-sm">Modifica los datos de acceso</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-1">Nombre Completo</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-blue-500/50" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-1">Correo Electrónico</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-blue-500/50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-1">Rol</label>
                  <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-blue-500/50 appearance-none">
                    <option value="Estudiante">Estudiante</option>
                    <option value="Premium">Premium</option>
                    <option value="Administrador">Admin</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-1">Estado</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-blue-500/50 appearance-none">
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-3 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5">Cancelar</button>
              <button type="submit" className="flex-1 py-3 rounded-xl bg-blue-500 text-white font-bold hover:bg-blue-600 shadow-lg shadow-blue-500/20">Guardar</button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Eliminar */}
      {isDeleteModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setIsDeleteModalOpen(false)}></div>
          <div className="bg-slate-900 border border-red-500/30 w-full max-w-sm rounded-[2.5rem] relative z-10 p-8 text-center shadow-[0_0_50px_rgba(239,68,68,0.2)] animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
              <AlertCircle size={32} className="text-red-500" />
            </div>
            <h3 className="text-xl font-black text-white mb-2">¿Eliminar Usuario?</h3>
            <p className="text-white/60 text-sm mb-8">
              Se eliminará permanentemente a <strong className="text-white">{selectedUser.name}</strong> y todo su progreso de aprendizaje.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5">Cancelar</button>
              <button onClick={handleDeleteUser} className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 shadow-lg shadow-red-500/20">Eliminar</button>
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

export default UserManagement;