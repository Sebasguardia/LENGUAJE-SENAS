import React, { useState } from 'react';
import { Users, Search, Filter, Mail, UserCheck, UserX, Edit, Trash2 } from 'lucide-react';

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  const users = [
    {
      id: 1,
      name: 'María González',
      email: 'maria@email.com',
      role: 'Estudiante',
      status: 'active',
      progress: 85,
      joinDate: '2024-01-15',
      lastLogin: '2024-01-20'
    },
    {
      id: 2,
      name: 'Carlos Rodríguez',
      email: 'carlos@email.com',
      role: 'Estudiante',
      status: 'active',
      progress: 62,
      joinDate: '2024-01-10',
      lastLogin: '2024-01-19'
    },
    {
      id: 3,
      name: 'Ana Martínez',
      email: 'ana@email.com',
      role: 'Estudiante',
      status: 'inactive',
      progress: 45,
      joinDate: '2024-01-05',
      lastLogin: '2024-01-15'
    },
    {
      id: 4,
      name: 'Pedro López',
      email: 'pedro@email.com',
      role: 'Premium',
      status: 'active',
      progress: 92,
      joinDate: '2024-01-08',
      lastLogin: '2024-01-20'
    },
    {
      id: 5,
      name: 'Laura Sánchez',
      email: 'laura@email.com',
      role: 'Estudiante',
      status: 'active',
      progress: 78,
      joinDate: '2024-01-12',
      lastLogin: '2024-01-18'
    },
    {
      id: 6,
      name: 'Admin Principal',
      email: 'admin@instituto.com',
      role: 'Administrador',
      status: 'active',
      progress: 100,
      joinDate: '2024-01-01',
      lastLogin: '2024-01-20'
    }
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || user.status === filter || user.role === filter;
    return matchesSearch && matchesFilter;
  });

  const toggleUserStatus = (userId) => {
    // Lógica para cambiar estado del usuario
    console.log('Cambiar estado del usuario:', userId);
  };

  const sendEmail = (userEmail) => {
    // Lógica para enviar email
    console.log('Enviar email a:', userEmail);
  };

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Users size={24} />
          Gestión de Usuarios
        </h2>
        <div className="flex gap-2">
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 transition-colors">
            <Users size={16} />
            Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" />
          <input
            type="text"
            placeholder="Buscar usuarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/60"
          />
        </div>
        
        <select 
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
        >
          <option value="all">Todos los usuarios</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
          <option value="Premium">Premium</option>
          <option value="Administrador">Administradores</option>
        </select>
      </div>

      {/* Lista de usuarios */}
      <div className="space-y-3">
        {filteredUsers.map((user) => (
          <div key={user.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                user.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                <Users size={20} />
              </div>
              
              <div>
                <h3 className="text-white font-semibold">{user.name}</h3>
                <p className="text-white/60 text-sm">{user.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    user.role === 'Administrador' ? 'bg-purple-500/20 text-purple-400' :
                    user.role === 'Premium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {user.role}
                  </span>
                  <span className="text-white/40 text-xs">
                    Unido: {new Date(user.joinDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Progreso */}
              <div className="text-right">
                <div className="text-white font-semibold">{user.progress}%</div>
                <div className="text-white/60 text-sm">Progreso</div>
                <div className="w-20 bg-white/20 rounded-full h-1 mt-1">
                  <div 
                    className="bg-green-400 h-1 rounded-full"
                    style={{ width: `${user.progress}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Acciones */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => sendEmail(user.email)}
                  className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all"
                  title="Enviar email"
                >
                  <Mail size={16} />
                </button>
                
                <button 
                  onClick={() => toggleUserStatus(user.id)}
                  className={`p-2 rounded-lg transition-all ${
                    user.status === 'active' 
                      ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                      : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                  }`}
                  title={user.status === 'active' ? 'Desactivar usuario' : 'Activar usuario'}
                >
                  {user.status === 'active' ? <UserX size={16} /> : <UserCheck size={16} />}
                </button>
                
                <button className="p-2 rounded-lg bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-all">
                  <Edit size={16} />
                </button>
                
                <button className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Estadísticas de usuarios */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{users.length}</div>
          <div className="text-white/60 text-sm">Total Usuarios</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">
            {users.filter(u => u.status === 'active').length}
          </div>
          <div className="text-white/60 text-sm">Activos</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {users.filter(u => u.role === 'Premium').length}
          </div>
          <div className="text-white/60 text-sm">Premium</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-400">
            {users.filter(u => u.role === 'Administrador').length}
          </div>
          <div className="text-white/60 text-sm">Administradores</div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;