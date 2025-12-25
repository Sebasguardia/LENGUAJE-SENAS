import React, { useState } from 'react';
import { Plus, Edit, Trash2, Play, Pause, BookOpen } from 'lucide-react';

const ModuleManager = () => {
  const [modules, setModules] = useState([
    {
      id: 1,
      name: 'Vocales',
      type: 'Aprendizaje',
      status: 'active',
      users: 1247,
      accuracy: 92.5,
      lastUpdate: '2024-01-15'
    },
    {
      id: 2,
      name: 'Números',
      type: 'Aprendizaje',
      status: 'active',
      users: 987,
      accuracy: 89.3,
      lastUpdate: '2024-01-14'
    },
    {
      id: 3,
      name: 'Abecedario',
      type: 'Aprendizaje',
      status: 'active',
      users: 856,
      accuracy: 94.1,
      lastUpdate: '2024-01-13'
    },
    {
      id: 4,
      name: 'Signos Matemáticos',
      type: 'Aprendizaje',
      status: 'inactive',
      users: 432,
      accuracy: 87.6,
      lastUpdate: '2024-01-12'
    },
    {
      id: 5,
      name: 'Palabras Básicas',
      type: 'Aprendizaje',
      status: 'active',
      users: 654,
      accuracy: 91.2,
      lastUpdate: '2024-01-11'
    },
    {
      id: 6,
      name: 'Operaciones',
      type: 'Práctica',
      status: 'active',
      users: 321,
      accuracy: 88.7,
      lastUpdate: '2024-01-10'
    }
  ]);

  const toggleModuleStatus = (moduleId) => {
    setModules(modules.map(module => 
      module.id === moduleId 
        ? { ...module, status: module.status === 'active' ? 'inactive' : 'active' }
        : module
    ));
  };

  const deleteModule = (moduleId) => {
    setModules(modules.filter(module => module.id !== moduleId));
  };

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <BookOpen size={24} />
          Gestión de Módulos
        </h2>
        <button className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600 transition-colors">
          <Plus size={20} />
          Nuevo Módulo
        </button>
      </div>

      <div className="space-y-4">
        {modules.map((module) => (
          <div key={module.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${
                module.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                <BookOpen size={20} />
              </div>
              <div>
                <h3 className="text-white font-semibold">{module.name}</h3>
                <p className="text-white/60 text-sm">{module.type} • {module.users} usuarios</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-white font-semibold">{module.accuracy}%</div>
                <div className="text-white/60 text-sm">Precisión</div>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => toggleModuleStatus(module.id)}
                  className={`p-2 rounded-lg transition-all ${
                    module.status === 'active' 
                      ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                      : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                  }`}
                >
                  {module.status === 'active' ? <Pause size={16} /> : <Play size={16} />}
                </button>
                
                <button className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all">
                  <Edit size={16} />
                </button>
                
                <button 
                  onClick={() => deleteModule(module.id)}
                  className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModuleManager;