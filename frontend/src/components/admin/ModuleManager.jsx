import React, { useState, useEffect } from 'react';
import {
  Plus, Edit, Trash2, Play, Pause, BookOpen,
  Search, X, Check, AlertTriangle, BookMarked,
  Sparkles, Tag, Layout, Eye, Clock, BarChart,
  AlertCircle, Hash
} from 'lucide-react';

import { moduleService } from '../../api/moduleService';
import { adminService } from '../../api/adminService';

const ModuleManager = () => {
  const [modules, setModules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
    orderIndex: 0,
    tags: [],
    elements: []
  });
  const [newElementName, setNewElementName] = useState('');
  const [newTag, setNewTag] = useState('');

  // --- Cargar Datos Reales ---
  const loadModules = async () => {
    try {
      setIsLoading(true);
      const data = await moduleService.getModules();
      // Mapear datos del backend al formato esperado por el frontend (style legacy)
      const mapped = data.map(m => ({
        id: m.id,
        name: m.title,
        type: 'Aprendizaje',
        difficulty: m.difficulty || 'Básico',
        duration: m.duration || '0h',
        tags: m.tags ? m.tags.split(',').filter(t => t.trim() !== '') : [],
        elementsCount: m.elements_count || 0,
        elements: m.elements ? m.elements.map(e => e.name) : [],
        slug: m.slug,
        description: m.description,
        orderIndex: m.order_index || 0,
        status: m.is_active ? 'active' : 'inactive',
        lastUpdate: new Date().toISOString().split('T')[0]
      }));
      setModules(mapped);
    } catch (err) {
      console.error("Error loading modules:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadModules();
  }, []);

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
        elements: [...module.elements],
        orderIndex: module.orderIndex || 0
      });
    } else {
      // Calcular el siguiente índice de orden por defecto
      const maxIndex = modules.length > 0 ? Math.max(...modules.map(m => m.orderIndex || 0)) : 0;

      setEditingModule(null);
      setFormData({
        name: '',
        type: 'Aprendizaje',
        difficulty: 'Básico',
        duration: '',
        description: '',
        orderIndex: maxIndex + 1,
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

  const handleConfirmDelete = async () => {
    if (moduleToDelete) {
      try {
        await adminService.deleteModule(moduleToDelete.id);
        setModules(modules.filter(m => m.id !== moduleToDelete.id));
        setIsDeleteModalOpen(false);
        setModuleToDelete(null);
      } catch (err) {
        console.error("Error deleting module:", err);
        alert("Error al eliminar el módulo");
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    // Generar slug básico
    const slug = formData.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

    const modulePayload = {
      title: formData.name,
      slug: slug,
      description: formData.description,
      difficulty: formData.difficulty,
      icon_name: "BookOpen",
      order_index: formData.orderIndex,
      duration: formData.duration,
      tags: formData.tags.join(',')
    };

    try {
      if (editingModule) {
        const updated = await adminService.updateModule(editingModule.id, modulePayload);
        // Actualizar lista local
        setModules(modules.map(m => m.id === editingModule.id ? {
          ...m,
          name: updated.title,
          description: updated.description,
          difficulty: updated.difficulty,
          duration: updated.duration,
          orderIndex: updated.order_index,
          tags: updated.tags ? updated.tags.split(',') : []
        } : m));
      } else {
        const created = await adminService.createModule(modulePayload);

        // Si hay elementos, crearlos uno por uno (cascada manual por ahora)
        for (const elName of formData.elements) {
          await adminService.createElement(created.id, {
            name: elName,
            description: `Seña para ${elName}`,
            is_command: false
          });
        }

        // Recargar todo para asegurar sincronía
        await loadModules();
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error saving module:", err);
      alert("Error al guardar el módulo. El slug podría ya existir.");
    }
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

  const toggleStatus = async (id) => {
    const module = modules.find(m => m.id === id);
    if (!module) return;

    const newStatus = module.status === 'active' ? 'inactive' : 'active';
    const isActive = newStatus === 'active';

    try {
      await adminService.updateModule(id, { is_active: isActive });
      setModules(modules.map(m => m.id === id ? { ...m, status: newStatus } : m));
    } catch (err) {
      console.error("Error toggling status:", err);
      alert("Error al cambiar el estado del módulo");
    }
  };


  const filteredModules = modules
    .filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

  if (isLoading && modules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-white/40 animate-pulse">Sincronizando arquitectura de módulos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Interactivo */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-slate-900/40 backdrop-blur-xl border border-white/10 p-6 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="p-3 lg:p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/20">
            <Layout className="text-white w-6 h-6 lg:w-8 lg:h-8" />
          </div>
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-white tracking-tight leading-none mb-1 lg:mb-2">Arquitectura de Módulos</h2>
            <p className="text-white/40 text-[10px] lg:text-sm">Gestiona la estructura de datos y elementos de la IA</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 sm:flex-none">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
            <input
              type="text"
              placeholder="Filtrar módulos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl lg:rounded-2xl pl-12 pr-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-all w-full sm:w-64"
            />
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl lg:rounded-2xl font-bold text-sm transition-all shadow-lg shadow-blue-500/20 active:scale-95"
          >
            <Plus size={18} />
            <span className="whitespace-nowrap">Configurar Nuevo</span>
          </button>
        </div>
      </div>

      {/* Grid de Módulos */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredModules.map((module) => (
          <div
            key={module.id}
            className="group bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2rem] lg:rounded-[2.5rem] p-6 lg:p-8 hover:border-white/20 transition-all duration-300 relative flex flex-col h-full shadow-xl"
          >
            {/* Badges de Estado y Nivel */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div className="flex flex-wrap gap-2">
                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${module.difficulty === 'Básico' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                  module.difficulty === 'Intermedio' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
                    'bg-red-500/10 border-red-500/20 text-red-400'
                  }`}>
                  {module.difficulty}
                </span>
                <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-white/5 border border-white/10 text-white/50 flex items-center gap-1">
                  <Clock size={10} />
                  {module.duration}
                </span>
              </div>
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-white/5 ${module.status === 'active' ? 'text-green-400' : 'text-slate-500'
                }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${module.status === 'active' ? 'bg-green-400 animate-pulse' : 'bg-slate-500'}`} />
                {module.status}
              </div>
            </div>

            <div className="flex items-start gap-4 lg:gap-5 mb-6">
              <div className="p-3 lg:p-4 shrink-0 rounded-2xl lg:rounded-3xl bg-blue-500/10 text-blue-400 border border-blue-500/10 shadow-inner group-hover:scale-105 transition-transform duration-300">
                <BookOpen className="w-6 h-6 lg:w-7 lg:h-7" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl lg:text-2xl font-black text-white group-hover:text-blue-400 transition-colors tracking-tighter truncate">
                  {module.name}
                </h3>
                <p className="text-white/30 text-[9px] lg:text-[10px] uppercase font-bold tracking-[0.2em]">{module.type}</p>
              </div>
            </div>

            <p className="text-white/60 text-xs lg:text-sm mb-6 line-clamp-2 italic min-h-[40px]">
              "{module.description || 'Sin descripción técnica disponible.'}"
            </p>

            {/* Elementos Preview - Estilo Mejorado */}
            <div className="flex flex-wrap gap-2 mb-8 flex-1 content-start">
              {module.elements.slice(0, 7).map((el, i) => (
                <span key={i} className="min-w-[36px] lg:min-w-[40px] h-9 lg:h-10 px-2 lg:px-3 flex items-center justify-center rounded-lg lg:rounded-xl bg-white/5 border border-white/10 text-[10px] lg:text-xs font-bold text-white/70 shadow-sm hover:bg-white/10 hover:border-white/20 transition-all cursor-default">
                  {el}
                </span>
              ))}
              {module.elements.length > 7 && (
                <span className="h-9 lg:h-10 px-3 flex items-center justify-center rounded-lg lg:rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] lg:text-xs font-black">
                  +{module.elements.length - 7}
                </span>
              )}
            </div>

            {/* Métricas */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/5 rounded-xl lg:rounded-2xl p-3 lg:p-4 border border-white/5">
                <span className="text-white/20 text-[8px] lg:text-[10px] uppercase font-black block mb-1 tracking-widest">Dataset Size</span>
                <span className="text-xl lg:text-2xl font-black text-white">{module.elementsCount || module.elements.length} items</span>
              </div>
              <div className="bg-white/5 rounded-xl lg:rounded-2xl p-3 lg:p-4 border border-white/5 text-blue-400">
                <span className="text-white/20 text-[8px] lg:text-[10px] uppercase font-black block mb-1 tracking-widest">Router Index</span>
                <span className="text-xl lg:text-2xl font-black text-white">#{module.orderIndex}</span>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center gap-2 pt-6 border-t border-white/5">
              <button
                onClick={() => toggleStatus(module.id)}
                className={`flex-1 flex items-center justify-center gap-2 h-11 rounded-xl lg:rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${module.status === 'active'
                  ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white shadow-lg shadow-amber-500/5'
                  : 'bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white shadow-lg shadow-green-500/5'
                  }`}
              >
                {module.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
                <span className="hidden sm:inline">{module.status === 'active' ? 'Suspender' : 'Publicar'}</span>
              </button>

              <button
                onClick={() => handleOpenViewModal(module)}
                className="w-11 h-11 flex items-center justify-center bg-white/5 text-white/60 hover:bg-purple-500 hover:text-white rounded-xl lg:rounded-2xl transition-all shadow-lg shrink-0"
                title="Ver detalles"
              >
                <Eye size={18} />
              </button>

              <button
                onClick={() => handleOpenModal(module)}
                className="w-11 h-11 flex items-center justify-center bg-white/5 text-white/60 hover:bg-blue-500 hover:text-white rounded-xl lg:rounded-2xl transition-all shadow-lg shrink-0"
                title="Editar"
              >
                <Edit size={18} />
              </button>

              <button
                onClick={() => handleOpenDeleteModal(module)}
                className="w-11 h-11 flex items-center justify-center bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl lg:rounded-2xl transition-all shadow-lg shrink-0"
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
          <div className="bg-slate-900 border border-white/10 w-full max-w-2xl rounded-[2rem] lg:rounded-[3rem] relative z-10 overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in duration-300">
            <div className="relative h-32 lg:h-40 bg-gradient-to-br from-blue-600 to-purple-700 flex items-end p-6 lg:p-8">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="absolute top-4 right-4 lg:top-6 lg:right-6 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-all z-20"
              >
                <X size={20} />
              </button>
              <div className="flex items-end gap-4 lg:gap-6 translate-y-6 lg:translate-y-8 w-full">
                <div className="w-20 h-20 lg:w-24 lg:h-24 bg-slate-900 rounded-2xl lg:rounded-3xl p-1 shadow-2xl border-4 border-slate-900 shrink-0">
                  <div className="w-full h-full bg-slate-800 rounded-xl lg:rounded-2xl flex items-center justify-center text-white">
                    <BookOpen size={32} className="text-blue-400 lg:w-10 lg:h-10" />
                  </div>
                </div>
                <div className="mb-2 min-w-0">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-md bg-white/20 text-white text-[8px] lg:text-[10px] font-bold uppercase">{viewingModule.type}</span>
                    <span className="px-2 py-0.5 rounded-md bg-black/20 text-white text-[8px] lg:text-[10px] font-bold uppercase">{viewingModule.difficulty}</span>
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-black text-white leading-none truncate">{viewingModule.name}</h2>
                </div>
              </div>
            </div>

            <div className="p-6 lg:p-8 pt-10 lg:pt-12 space-y-6 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 lg:p-4 bg-white/5 rounded-2xl border border-white/5">
                  <h4 className="text-[8px] lg:text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">DATASET QUALITY</h4>
                  <p className="text-xl lg:text-2xl font-black text-green-400">{viewingModule.elementsCount * 50 || viewingModule.elements.length * 50}
                    <span className="text-xs text-white/20 ml-2 font-bold uppercase">Samples</span>
                  </p>
                </div>
                <div className="p-3 lg:p-4 bg-white/5 rounded-2xl border border-white/5">
                  <h4 className="text-[8px] lg:text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">LEARNING TIME</h4>
                  <p className="text-xl lg:text-2xl font-black text-white">{viewingModule.duration}</p>
                </div>
              </div>

              <div>
                <h4 className="text-xs lg:text-sm font-bold text-white mb-2 uppercase tracking-wide opacity-40">Descripción General</h4>
                <p className="text-white/60 text-xs lg:text-sm leading-relaxed italic">"{viewingModule.description || 'Sin descripción técnica registrada.'}"</p>
              </div>

              <div>
                <h4 className="text-xs lg:text-sm font-bold text-white mb-2 uppercase tracking-wide opacity-40">Categorización</h4>
                <div className="flex flex-wrap gap-2">
                  {viewingModule.tags && viewingModule.tags.map((tag, i) => (
                    <span key={i} className="px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/10">#{tag}</span>
                  ))}
                  {(!viewingModule.tags || viewingModule.tags.length === 0) && <span className="text-white/20 text-xs italic">Sin etiquetas</span>}
                </div>
              </div>

              <div>
                <h4 className="text-xs lg:text-sm font-bold text-white mb-3 uppercase tracking-wide opacity-40">Elementos Curriculares ({viewingModule.elements.length})</h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {viewingModule.elements.map((el, i) => (
                    <div key={i} className="aspect-square bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-white text-xs lg:text-sm font-bold hover:bg-white/10 hover:border-blue-500/30 transition-all cursor-default text-center p-2">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
          <div
            className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300"
            onClick={() => setIsModalOpen(false)}
          ></div>
          <form
            onSubmit={handleSave}
            className="bg-slate-900 border border-white/10 w-full max-w-5xl max-h-[95vh] lg:max-h-[90vh] rounded-[2rem] lg:rounded-[3rem] relative z-10 overflow-hidden shadow-[0_0_100px_rgba(30,58,138,0.3)] animate-in zoom-in duration-300 flex flex-col"
          >
            <div className="p-6 lg:p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-blue-600/10 to-transparent">
              <div className="flex items-center gap-4 lg:gap-6">
                <div className="p-3 lg:p-4 bg-blue-500 rounded-2xl lg:rounded-3xl shadow-xl shadow-blue-500/30 text-white">
                  {editingModule ? <Edit className="w-6 h-6 lg:w-8 lg:h-8" /> : <Plus className="w-6 h-6 lg:w-8 lg:h-8" />}
                </div>
                <div>
                  <h3 className="text-xl lg:text-3xl font-black text-white tracking-tighter leading-none mb-1 lg:mb-2">
                    {editingModule ? 'Configurar Estructura' : 'Arquitectura Técnica'}
                  </h3>
                  <p className="text-white/40 text-[10px] lg:text-sm italic">Define las señas y metadatos del módulo</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 lg:p-3 hover:bg-white/10 rounded-xl lg:rounded-2xl text-white/40 hover:text-white transition-all outline-none shrink-0"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-8 custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
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
                      className="w-full bg-slate-950/50 border border-white/10 rounded-xl lg:rounded-2xl px-5 lg:px-6 py-3 lg:py-4 text-white placeholder-white/20 focus:outline-none focus:border-blue-500/40 transition-all font-bold text-base lg:text-lg"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] pl-1">Número de Ruta (Posición)</label>
                    <div className="relative">
                      <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                      <input
                        type="number"
                        placeholder="Ej: 1, 2, 3..."
                        value={formData.orderIndex}
                        onChange={(e) => setFormData({ ...formData, orderIndex: parseInt(e.target.value) || 0 })}
                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl lg:rounded-2xl pl-12 pr-6 py-3 lg:py-4 text-white focus:outline-none focus:border-blue-500/40 transition-all font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] pl-1">Nivel</label>
                      <div className="relative">
                        <BarChart className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                        <select
                          value={formData.difficulty}
                          onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                          className="w-full bg-slate-950/50 border border-white/10 rounded-xl lg:rounded-2xl pl-12 pr-4 py-3 lg:py-4 text-white focus:outline-none focus:border-blue-500/40 transition-all font-bold appearance-none cursor-pointer"
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
                          className="w-full bg-slate-950/50 border border-white/10 rounded-xl lg:rounded-2xl pl-12 pr-4 py-3 lg:py-4 text-white placeholder-white/20 focus:outline-none focus:border-blue-500/40 transition-all font-bold"
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
                      className="w-full bg-slate-950/50 border border-white/10 rounded-xl lg:rounded-2xl px-6 py-4 text-white placeholder-white/20 focus:outline-none focus:border-blue-500/40 transition-all text-xs lg:text-sm leading-relaxed min-h-[100px]"
                    />
                  </div>

                  {/* Tags Input */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] pl-1">Etiquetas (Tags)</label>
                    <div className="bg-slate-950/50 border border-white/10 rounded-xl lg:rounded-2xl p-4">
                      <div className="flex gap-2 mb-3">
                        <input
                          type="text"
                          placeholder="Añadir tag..."
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleAddTag(e)}
                          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-[10px] lg:text-xs focus:outline-none focus:border-blue-500/40 transition-all font-bold"
                        />
                        <button onClick={handleAddTag} className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-all"><Plus size={16} /></button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.tags && formData.tags.map((tag, i) => (
                          <span key={i} className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-[9px] lg:text-[10px] font-bold border border-blue-500/10 flex items-center gap-1 group">
                            #{tag}
                            <button onClick={() => handleRemoveTag(i)} className="hover:text-white transition-colors"><X size={10} /></button>
                          </span>
                        ))}
                        {(!formData.tags || formData.tags.length === 0) && <span className="text-white/20 text-[10px] italic">Sin etiquetas</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Columna Derecha: Elementos */}
                <div className="flex flex-col space-y-6">
                  <div className="space-y-3 flex-1 flex flex-col">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] pl-1">Directorio de Señas (Elementos)</label>

                    <div className="bg-slate-950/50 border border-white/10 rounded-[1.5rem] lg:rounded-[2rem] p-5 lg:p-6 flex-1 flex flex-col min-h-[300px] lg:min-h-0">
                      <div className="flex gap-2 mb-4 shrink-0">
                        <input
                          type="text"
                          placeholder="Nombre de la seña (EJ: Hola)"
                          value={newElementName}
                          onChange={(e) => setNewElementName(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleAddElement(e)}
                          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs lg:text-sm focus:outline-none focus:border-green-500/40 transition-all font-bold"
                        />
                        <button
                          onClick={handleAddElement}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl transition-all shadow-lg shadow-green-500/20 shrink-0"
                        >
                          <Plus size={20} />
                        </button>
                      </div>

                      <div className="flex-1 overflow-y-auto max-h-[300px] lg:max-h-none pr-2 space-y-2 custom-scrollbar">
                        {formData.elements.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center opacity-20 py-8 lg:py-20">
                            <Tag size={40} className="mb-2" />
                            <p className="text-[9px] lg:text-[10px] font-bold uppercase tracking-widest">Sin elementos configurados</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 lg:gap-3">
                            {formData.elements.map((el, i) => (
                              <div key={i} className="flex items-center justify-between bg-white/5 px-2.5 lg:px-3 py-2.5 lg:py-3 rounded-lg lg:rounded-xl border border-white/5 animate-in slide-in-from-right-2 duration-300 group hover:border-white/20 min-w-0">
                                <span className="text-white font-bold text-[10px] lg:text-xs truncate mr-1">{el}</span>
                                <button
                                  onClick={() => handleRemoveElement(i)}
                                  className="text-white/20 hover:text-red-400 transition-colors shrink-0"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between shrink-0">
                        <span className="text-[9px] lg:text-[10px] font-black text-white/30 uppercase tracking-widest">Total configurado:</span>
                        <span className="text-lg lg:text-xl font-black text-blue-400">{formData.elements.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 lg:p-6 rounded-2xl lg:rounded-3xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-4">
                <AlertTriangle className="text-blue-400 shrink-0 mt-1" size={20} />
                <div className="space-y-1">
                  <p className="text-blue-200 font-bold text-xs lg:text-sm">Validación Técnica del Dataset</p>
                  <p className="text-blue-200/60 text-[10px] lg:text-xs leading-relaxed">
                    Al guardar este módulo, el sistema preparará automáticamente los contenedores de entrenamiento para cada uno de los <strong>{formData.elements.length} elementos</strong> añadidos. Recuerda que la IA requerirá 50 muestras por elemento.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 lg:p-10 pt-0 flex flex-col sm:flex-row gap-4 lg:gap-6 shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-4 lg:py-5 rounded-xl lg:rounded-[1.5rem] border border-white/10 text-white/40 font-bold text-xs lg:text-sm hover:bg-white/5 hover:text-white transition-all text-center uppercase tracking-[0.2em] order-2 sm:order-1"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-[2] py-4 lg:py-5 rounded-xl lg:rounded-[1.5rem] bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black text-xs lg:text-sm hover:from-blue-500 hover:to-indigo-600 transition-all text-center uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/30 active:scale-95 flex items-center justify-center gap-3 order-1 sm:order-2"
              >
                {editingModule ? <div className="flex items-center gap-2 lg:gap-3"><Check size={20} /><span>Actualizar Arquitectura</span></div> : 'Generar Configuración'}
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