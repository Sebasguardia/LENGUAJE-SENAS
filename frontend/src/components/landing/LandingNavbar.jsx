import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, BrainCircuit, Zap, ChevronRight } from 'lucide-react';
import ThemeToggle from '../common/ThemeToggle';

const LandingNavbar = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeItem, setActiveItem] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      const sections = ['home', 'proceso', 'caracteristicas', 'modulos', 'testimonios'];
      for (const id of [...sections].reverse()) {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 120) {
          setActiveItem(id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Inicio', id: 'home' },
    { label: 'Proceso', id: 'proceso' },
    { label: 'Características', id: 'caracteristicas' },
    { label: 'Módulos', id: 'modulos' },
    { label: 'Testimonios', id: 'testimonios' },
  ];

  const scrollTo = (id) => {
    setIsMenuOpen(false);
    if (id === 'home') window.scrollTo({ top: 0, behavior: 'smooth' });
    else document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-500 ${
          isScrolled || isMenuOpen
            ? 'py-3 dark:bg-[#05070a]/90 bg-white/90 backdrop-blur-2xl dark:border-b dark:border-white/5 border-b border-slate-200/80 dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)] shadow-sm'
            : 'py-5 bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-10 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group/logo shrink-0" onClick={() => scrollTo('home')}>
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/30 blur-xl rounded-xl opacity-0 group-hover/logo:opacity-100 transition-all duration-500" />
              <div className="relative dark:bg-[#0a0c10] bg-white dark:border-blue-500/30 border-blue-400/40 border p-2 sm:p-2.5 rounded-xl shadow-sm dark:shadow-none dark:group-hover/logo:border-blue-400/50 transition-colors">
                <BrainCircuit className="text-blue-500 dark:text-blue-400" size={20} />
              </div>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-lg sm:text-xl font-black dark:text-white text-slate-900 tracking-tighter uppercase">
                Señas<span className="text-blue-500">IA</span>
              </span>
              <span className="text-[7px] sm:text-[8px] font-black dark:text-white/20 text-slate-400 uppercase tracking-[0.3em] mt-0.5">
                Enterprise Intelligence
              </span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`relative px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.18em] transition-all duration-300 rounded-lg ${
                  activeItem === item.id
                    ? 'dark:text-white text-slate-900 dark:bg-white/5 bg-slate-100'
                    : 'dark:text-white/35 text-slate-400 dark:hover:text-white/80 hover:text-slate-700 dark:hover:bg-white/[0.04] hover:bg-slate-100'
                }`}
              >
                {item.label}
                {activeItem === item.id && (
                  <span className="absolute bottom-1.5 left-4 right-4 h-px bg-blue-500 rounded-full shadow-[0_0_6px_rgba(59,130,246,0.8)]" />
                )}
              </button>
            ))}
          </nav>

          {/* Desktop right side */}
          <div className="hidden lg:flex items-center gap-3">
            <ThemeToggle variant="icon" />
            <div className="h-5 w-px dark:bg-white/10 bg-slate-200" />
            <button
              className="text-[11px] font-black uppercase tracking-[0.15em] dark:text-white/40 text-slate-500 hover:text-slate-800 dark:hover:text-white px-4 py-2 transition-colors"
              onClick={() => navigate('/login')}
            >
              Iniciar sesión
            </button>
            <button
              className="group flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white pl-6 pr-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-[0.15em] shadow-lg shadow-blue-600/25 transition-all active:scale-95"
              onClick={() => navigate('/login')}
            >
              <Zap size={13} className="fill-current" />
              Comenzar Gratis
              <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Mobile Toggle & Icon */}
          <div className="flex lg:hidden items-center gap-3">
            <ThemeToggle variant="icon" />
            <button
              className="z-50 w-10 h-10 flex items-center justify-center rounded-xl dark:bg-white/5 bg-slate-50 dark:border dark:border-white/10 border border-slate-200 dark:text-white/80 text-slate-600 hover:text-slate-900 dark:hover:text-white transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 z-40 lg:hidden transition-all duration-500 ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <div className="absolute inset-0 dark:bg-[#05070a]/98 bg-white/98 backdrop-blur-3xl" onClick={() => setIsMenuOpen(false)} />
        <div className={`absolute inset-y-0 right-0 w-full max-w-sm dark:bg-[#0a0c10]/95 bg-white dark:border-l dark:border-white/5 border-l border-slate-200 flex flex-col transition-transform duration-500 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex items-center justify-between p-6 dark:border-b dark:border-white/5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <BrainCircuit className="text-blue-500" size={20} />
              <span className="font-black dark:text-white text-slate-900 uppercase tracking-tight">Señas<span className="text-blue-500">IA</span></span>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle variant="icon" />
              <button onClick={() => setIsMenuOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg dark:text-white/40 text-slate-400 dark:hover:text-white hover:text-slate-700 dark:hover:bg-white/5 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>
          </div>
          <div className="flex-1 p-6 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`w-full text-left flex items-center justify-between px-4 py-3.5 rounded-xl font-black text-sm uppercase tracking-[0.15em] transition-all ${
                  activeItem === item.id
                    ? 'bg-blue-600/15 text-blue-500 border border-blue-500/20'
                    : 'dark:text-white/40 text-slate-500 dark:hover:text-white hover:text-slate-900 dark:hover:bg-white/5 hover:bg-slate-100'
                }`}
              >
                {item.label}
                <ChevronRight size={14} className="opacity-40" />
              </button>
            ))}
          </div>
          <div className="p-6 space-y-3 dark:border-t dark:border-white/5 border-t border-slate-100">
            <button
              className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm uppercase tracking-[0.15em] transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2"
              onClick={() => { setIsMenuOpen(false); navigate('/login'); }}
            >
              <Zap size={16} className="fill-current" /> Comenzar Gratis
            </button>
            <button
              className="w-full py-3.5 rounded-xl dark:bg-white/5 bg-slate-100 dark:hover:bg-white/10 hover:bg-slate-200 dark:text-white/60 text-slate-600 hover:text-slate-900 dark:hover:text-white font-black text-sm uppercase tracking-[0.15em] transition-all dark:border dark:border-white/5 border border-slate-200"
              onClick={() => { setIsMenuOpen(false); navigate('/login'); }}
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default LandingNavbar;