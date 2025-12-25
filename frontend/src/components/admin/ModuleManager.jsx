import React, { useState } from 'react';
import {
  Plus, Edit, Trash2, Play, Pause, BookOpen,
  Search, X, Check, AlertTriangle, BookMarked,
  Sparkles, Tag, Layout, Eye, Clock, BarChart,
  AlertCircle
} from 'lucide-react';

const ModuleManager = () => {
  const [modules, setModules] = useState([
    {
      id: 1,
      name: 'Vocales',
      type: 'Aprendizaje',
      difficulty: 'Básico',
      duration: '2h 15m',
      tags: ['Fundamentos', 'Letras'],
      status: 'active',
      elements: ['A', 'E', 'I', 'O', 'U'],
      accuracy: 92.5,
      description: 'Fundamentos básicos del lenguaje de señas.',
      lastUpdate: '2024-01-15'
    },
    {
      id: 2,
      name: 'Números',
      type: 'Aprendizaje',
      difficulty: 'Intermedio',
      duration: '3h 30m',
      tags: ['Matemáticas', 'Conteo'],
      status: 'active',
      elements: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
      accuracy: 89.3,
      description: 'Representación numérica del 0 al 9.',
      lastUpdate: '2024-01-14'
    },
    {
      id: 3,
      name: 'Abecedario',
      type: 'Aprendizaje',
      difficulty: 'Avanzado',
      duration: '5h 00m',
      tags: ['Alfabeto', 'Completo'],
      status: 'active',
      elements: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'Ñ', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
      accuracy: 94.1,
      description: 'Alfabeto manual completo.',
      lastUpdate: '2024-01-13'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [editingModule, setEditingModule] = useState(null);
  const [moduleToDelete, setModuleToDelete] = useState(null);
  const [viewingModule, setViewingModule] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    type: 'Aprendizaje',
    difficulty: 'Básico',
    duration: '',
    description: '',
    tags: [],
    elements: []
  });
  const [newElementName, setNewElementName] = useState('');
  const [newTag, setNewTag] = useState('');

  // --- Handlers para CRUD ---

  const handleOpenModal = (module = null) => {
    if (module) {
      setEditingModule(module);
      setFormData({
        name: module.name,
        type: module.type,
        difficulty: module.difficulty || 'Básico',
        duration: module.duration || '',
        description: module.description || '',
        tags: module.tags ? [...module.tags] : [],
        elements: [...module.elements]
      });
    } else {
      setEditingModule(null);
      setFormData({
        name: '',
        type: 'Aprendizaje',
        difficulty: 'Básico',
        duration: '',
        description: '',
        tags: [],
        elements: []
      });
    }
    setIsModalOpen(true);
  };

  const handleOpenViewModal = (module) => {
    setViewingModule(module);
    setIsViewModalOpen(true);
  };

  const handleOpenDeleteModal = (module) => {
    setModuleToDelete(module);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (moduleToDelete) {
      setModules(modules.filter(m => m.id !== moduleToDelete.id));
      setIsDeleteModalOpen(false);
      setModuleToDelete(null);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    const moduleDataToSave = {
      ...formData,
      lastUpdate: new Date().toISOString().split('T')[0]
    };

    if (editingModule) {
      setModules(modules.map(m => m.id === editingModule.id ? { ...m, ...moduleDataToSave } : m));
    } else {
      const newModule = {
        id: Date.now(),
        ...moduleDataToSave,
        status: 'active',
        accuracy: 0,
      };
      setModules([...modules, newModule]);
    }
    setIsModalOpen(false);
  };

  // --- Handlers para Elementos y Tags ---

  const handleAddElement = (e) => {
    e.preventDefault();
    if (newElementName.trim() && !formData.elements.includes(newElementName.trim())) {
      setFormData({
        ...formData,
        elements: [...formData.elements, newElementName.trim()]
      });
      setNewElementName('');
    }
  };

  const handleRemoveElement = (index) => {
    const updatedElements = formData.elements.filter((_, i) => i !== index);
    setFormData({ ...formData, elements: updatedElements });
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (index) => {
    const updatedTags = formData.tags.filter((_, i) => i !== index);
    setFormData({ ...formData, tags: updatedTags });
  };

  const toggleStatus = (id) => {
    setModules(modules.map(m => m.id === id ? { ...m, status: m.status === 'active' ? 'inactive' : 'active' } : m));
  };


  const filteredModules = modules.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Interactivo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/40 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/20">
            <Layout className="text-white" size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Arquitectura de Módulos</h2>
            <p className="text-white/40 text-sm">Gestiona la estructura de datos y elementos de la IA</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
            <input
              type="text"
              placeholder="Filtrar módulos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-all w-full md:w-64"
            />
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-blue-500/20 active:scale-95"
          >
            <Plus size={18} />
            Configurar Nuevo
          </button>
        </div>
      </div>

      {/* Grid de Módulos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
        {filteredModules.map((module) => (
          <div
            key={module.id}
            className="group bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 hover:border-white/20 transition-all duration-300 relative flex flex-col h-full"
          >
            {/* Badges de Estado y Nivel */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex gap-2">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${module.difficulty === 'Básico' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                    module.difficulty === 'Intermedio' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
                      'bg-red-500/10 border-red-500/20 text-red-400'
                  }`}>
                  {module.difficulty}
                </span>
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/5 border border-white/10 text-white/50 flex items-center gap-1">
                  <Clock size={10} />
                  {module.duration}
                </span>
              </div>
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/5 ${module.status === 'active' ? 'text-green-400' : 'text-slate-500'
                }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${module.status === 'active' ? 'bg-green-400 animate-pulse' : 'bg-slate-500'}`} />
                {module.status}
              </div>
            </div>

            <div className="flex items-start gap-5 mb-6">
              <div className="p-4 rounded-3xl bg-blue-500/10 text-blue-400 border border-blue-500/10 shadow-inner group-hover:scale-105 transition-transform duration-300">
                <BookOpen size={28} />
              </div>
              <div className="flex-1 pr-4">
                <h3 className="text-2xl font-black text-white group-hover:text-blue-400 transition-colors tracking-tighter">
                  {module.name}
                </h3>
                <p className="text-white/30 text-[10px] uppercase font-bold tracking-[0.2em]">{module.type}</p>
              </div>
            </div>

            <p className="text-white/60 text-sm mb-6 line-clamp-2 italic min-h-[40px]">
              "{module.description || 'Sin descripción técnica disponible.'}"
            </p>

            {/* Elementos Preview - Estilo Mejorado */}
            <div className="flex flex-wrap gap-2 mb-8 flex-1 content-start">
              {module.elements.slice(0, 7).map((el, i) => (
                <span key={i} className="min-w-[40px] h-10 px-3 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white/70 shadow-sm hover:bg-white/10 hover:border-white/20 transition-all cursor-default">
                  {el}
                </span>
              ))}
              {module.elements.length > 7 && (
                <span className="h-10 px-3 flex items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-black">
                  +{module.elements.length - 7}
                </span>
              )}
            </div>

            {/* Métricas */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                <span className="text-white/20 text-[10px] uppercase font-black block mb-1 tracking-widest">Total Señas</span>
                <span className="text-2xl font-black text-white">{module.elements.length}</span>
              </div>
              <div className={`bg-white/5 rounded-2xl p-4 border border-white/5 ${module.accuracy >= 90 ? 'text-green-400' : 'text-blue-400'}`}>
                <span className="text-white/20 text-[10px] uppercase font-black block mb-1 tracking-widest">Accuracy</span>
                <span className="text-2xl font-black">{module.accuracy}%</span>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center gap-2 pt-6 border-t border-white/5">
              <button
                onClick={() => toggleStatus(module.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${module.status === 'active'
                    ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 shadow-lg shadow-amber-500/5'
                    : 'bg-green-500/10 text-green-500 hover:bg-green-500/20 shadow-lg shadow-green-500/5'
                  }`}
              >
                {module.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
                {module.status === 'active' ? 'Suspender' : 'Publicar'}
              </button>

              <button
                onClick={() => handleOpenViewModal(module)}
                className="p-3 bg-white/5 text-white/60 hover:bg-purple-500 hover:text-white rounded-2xl transition-all shadow-lg"
                title="Ver detalles"
              >
                <Eye size={18} />
              </button>

              <button
                onClick={() => handleOpenModal(module)}
                className="p-3 bg-white/5 text-white/60 hover:bg-blue-500 hover:text-white rounded-2xl transition-all shadow-lg"
                title="Editar"
              >
                <Edit size={18} />
              </button>

              <button
                onClick={() => handleOpenDeleteModal(module)}
                className="p-3 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-2xl transition-all shadow-lg"
                title="Eliminar"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Ver Detalles */}
      {isViewModalOpen && viewingModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsViewModalOpen(false)}></div>
          <div className="bg-slate-900 border border-white/10 w-full max-w-2xl rounded-[3rem] relative z-10 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="relative h-40 bg-gradient-to-br from-blue-600 to-purple-700 flex items-end p-8">
              <button onClick={() => setIsViewModalOpen(false)} className="absolute top-6 right-6 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-all"><X size={20} /></button>
              <div className="flex items-end gap-6 translate-y-8">
                <div className="w-24 h-24 bg-slate-900 rounded-3xl p-1 shadow-2xl border-4 border-slate-900">
                  <div className="w-full h-full bg-slate-800 rounded-2xl flex items-center justify-center text-white">
                    <BookOpen size={40} className="text-blue-400" />
                  </div>
                </div>
                <div className="mb-2">
                  <div className="flex gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-md bg-white/20 text-white text-[10px] font-bold uppercase">{viewingModule.type}</span>
                    <span className="px-2 py-0.5 rounded-md bg-black/20 text-white text-[10px] font-bold uppercase">{viewingModule.difficulty}</span>
                  </div>
                  <h2 className="text-3xl font-black text-white leading-none">{viewingModule.name}</h2>
                </div>
              </div>
            </div>

            <div className="p-8 pt-12 space-y-6 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Precisión IA</h4>
                  <p className="text-2xl font-black text-green-400">{viewingModule.accuracy}%</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Duración Est.</h4>
                  <p className="text-2xl font-black text-white">{viewingModule.duration}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white mb-2">Descripción General</h4>
                <p className="text-white/60 text-sm leading-relaxed">{viewingModule.description}</p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white mb-2">Etiquetas</h4>
                <div className="flex flex-wrap gap-2">
                  {viewingModule.tags && viewingModule.tags.map((tag, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/10">#{tag}</span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white mb-3">Elementos Curriculares ({viewingModule.elements.length})</h4>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                  {viewingModule.elements.map((el, i) => (
                    <div key={i} className="aspect-square bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-white font-bold hover:bg-white/10 transition-colors">
                      {el}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Eliminar */}
      {isDeleteModalOpen && moduleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsDeleteModalOpen(false)}></div>
          <div className="bg-slate-900 border border-red-500/30 w-full max-w-md rounded-[2.5rem] relative z-10 overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.2)] animate-in zoom-in duration-300 p-8 text-center">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-slate-900 shadow-xl">
              <AlertCircle size={40} className="text-red-500" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2">¿Eliminar Módulo?</h3>
            <p className="text-white/60 text-sm mb-8 leading-relaxed">
              Estás a punto de eliminar <span className="text-white font-bold">"{moduleToDelete.name}"</span>.
              <br />Esta acción borrará permanentemente todas las configuraciones y los <span className="text-red-400 font-bold">{moduleToDelete.elements.length} elementos</span> de datos asociados. No se puede deshacer.
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-4 rounded-xl border border-white/10 text-white font-bold text-sm hover:bg-white/5 transition-all text-center uppercase tracking-widest"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-4 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-all text-center uppercase tracking-widest shadow-lg shadow-red-500/20 active:scale-95"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Creación / Edición Completo */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300"
            onClick={() => setIsModalOpen(false)}
          ></div>
          <form
            onSubmit={handleSave}
            className="bg-slate-900 border border-white/10 w-full max-w-5xl max-h-[90vh] rounded-[3rem] relative z-10 overflow-hidden shadow-[0_0_100px_rgba(30,58,138,0.3)] animate-in zoom-in duration-300 flex flex-col"
          >
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-blue-600/10 to-transparent">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-blue-500 rounded-3xl shadow-xl shadow-blue-500/30 text-white">
                  {editingModule ? <Edit size={32} /> : <Plus size={32} />}
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white tracking-tighter">
                    {editingModule ? 'Configurar Estructura' : 'Arquitectura Técnica'}
                  </h3>
                  <p className="text-white/40 text-sm italic">Define las señas y metadatos del módulo</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-3 hover:bg-white/10 rounded-2xl text-white/40 hover:text-white transition-all outline-none"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Columna Izquierda: Datos Generales */}
                <div className="space-y-6">

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] pl-1">Identificador del Módulo</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Módulo de Saludos Comunes"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-white/20 focus:outline-none focus:border-blue-500/40 transition-all font-bold text-lg"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] pl-1">Nivel</label>
                      <div className="relative">
                        <BarChart className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                        <select
                          value={formData.difficulty}
                          onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                          className="w-full bg-slate-950/50 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-blue-500/40 transition-all font-bold appearance-none cursor-pointer"
                        >
                          <option value="Básico">Básico</option>
                          <option value="Intermedio">Intermedio</option>
                          <option value="Avanzado">Avanzado</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] pl-1">Duración Est.</label>
                      <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                        <input
                          type="text"
                          placeholder="Ej: 2h 30m"
                          value={formData.duration}
                          onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                          className="w-full bg-slate-950/50 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-white/20 focus:outline-none focus:border-blue-500/40 transition-all font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] pl-1">Documentación / Descripción</label>
                    <textarea
                      rows="3"
                      placeholder="Describe el propósito académico de este módulo..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-white/20 focus:outline-none focus:border-blue-500/40 transition-all text-sm leading-relaxed"
                    />
                  </div>

                  {/* Tags Input */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] pl-1">Etiquetas (Tags)</label>
                    <div className="bg-slate-950/50 border border-white/10 rounded-2xl p-4">
                      <div className="flex gap-2 mb-3">
                        <input
                          type="text"
                          placeholder="Añadir tag..."
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleAddTag(e)}
                          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs focus:outline-none focus:border-blue-500/40 transition-all"
                        />
                        <button onClick={handleAddTag} className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-xl transition-all"><Plus size={16} /></button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.tags && formData.tags.map((tag, i) => (
                          <span key={i} className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold border border-blue-500/10 flex items-center gap-1 group">
                            #{tag}
                            <button onClick={() => handleRemoveTag(i)} className="hover:text-white"><X size={10} /></button>
                          </span>
                        ))}
                        {(!formData.tags || formData.tags.length === 0) && <span className="text-white/20 text-[10px] italic">Sin etiquetas</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Columna Derecha: Elementos */}
                <div className="flex flex-col space-y-6 h-full">
                  <div className="space-y-3 flex-1 flex flex-col">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] pl-1">Directorio de Señas (Elementos)</label>

                    <div className="bg-slate-950/50 border border-white/10 rounded-[2rem] p-6 flex-1 flex flex-col">
                      <div className="flex gap-2 mb-4">
                        <input
                          type="text"
                          placeholder="Nombre de la seña (EJ: Hola)"
                          value={newElementName}
                          onChange={(e) => setNewElementName(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleAddElement(e)}
                          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-green-500/40 transition-all font-bold"
                        />
                        <button
                          onClick={handleAddElement}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl transition-all shadow-lg shadow-green-500/20"
                        >
                          <Plus size={20} />
                        </button>
                      </div>

                      <div className="flex-1 overflow-y-auto max-h-[300px] pr-2 space-y-2 custom-scrollbar">
                        {formData.elements.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center opacity-20 py-8">
                            <Tag size={40} className="mb-2" />
                            <p className="text-[10px] font-bold uppercase tracking-widest">Sin elementos configurados</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 gap-3">
                            {formData.elements.map((el, i) => (
                              <div key={i} className="flex items-center justify-between bg-white/5 px-3 py-3 rounded-xl border border-white/5 animate-in slide-in-from-right-2 duration-300 group hover:border-white/20">
                                <span className="text-white font-bold text-xs truncate">{el}</span>
                                <button
                                  onClick={() => handleRemoveElement(i)}
                                  className="text-white/20 hover:text-red-400 transition-colors"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Total configurado:</span>
                        <span className="text-xl font-black text-blue-400">{formData.elements.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-4">
                <AlertTriangle className="text-blue-400 shrink-0 mt-1" size={20} />
                <div className="space-y-1">
                  <p className="text-blue-200 font-bold text-sm">Validación Técnica del Dataset</p>
                  <p className="text-blue-200/60 text-xs leading-relaxed">
                    Al guardar este módulo, el sistema preparará automáticamente los contenedores de entrenamiento para cada uno de los <strong>{formData.elements.length} elementos</strong> añadidos. Recuerda que la IA requerirá 50 muestras por elemento.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-10 pt-0 flex gap-6">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-5 rounded-[1.5rem] border border-white/10 text-white/40 font-bold text-sm hover:bg-white/5 hover:text-white transition-all text-center uppercase tracking-[0.2em]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-[2] py-5 rounded-[1.5rem] bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black text-sm hover:from-blue-500 hover:to-indigo-600 transition-all text-center uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/30 active:scale-95 flex items-center justify-center gap-3"
              >
                {editingModule ? <div className="flex items-center gap-3"><Check size={20} /><span>Actualizar Arquitectura</span></div> : 'Generar Configuración'}
              </button>
            </div>
          </form>
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

export default ModuleManager;