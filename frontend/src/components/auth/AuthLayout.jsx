import React, { useState, useEffect } from 'react';
import { BrainCircuit, ShieldCheck, Zap, Cpu, Globe, ArrowLeft } from 'lucide-react';
import ThemeToggle from '../common/ThemeToggle';

const FEATURES = [
  { icon: ShieldCheck, label: 'Cifrado E2E de Grado Bancario' },
  { icon: Zap, label: 'Análisis Neural en Tiempo Real' },
  { icon: Cpu, label: 'Motor IA Adaptativo' },
  { icon: Globe, label: 'Soporte Multi-Dialecto Global' },
];

const AuthLayout = ({ children, title, subtitle, sideContent, showBack = true, onBack }) => {
  const [dots, setDots] = useState([]);

  useEffect(() => {
    setDots(Array.from({ length: 16 }, (_, i) => ({
      id: i, x: Math.random() * 100, y: Math.random() * 100,
      dur: 12 + Math.random() * 8, del: Math.random() * 5,
    })));
  }, []);

  return (
    <div className="h-screen w-screen dark:bg-[#020408] bg-slate-50 flex overflow-hidden selection:bg-blue-500/30 dark:text-white text-slate-900 relative">

      {/* ── Background ── */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] dark:bg-blue-600/10 bg-blue-200/25 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-[20%] -right-[5%] w-[45%] h-[45%] dark:bg-indigo-600/8 bg-indigo-100/30 rounded-full blur-[100px] animate-pulse-slow" />
        <div className="absolute -bottom-[10%] left-[15%] w-[50%] h-[50%] dark:bg-blue-900/5 bg-blue-100/20 rounded-full blur-[140px]" />
        {/* Dot grid */}
        <div className="absolute inset-0 dark:opacity-[0.015] opacity-[0.06]"
          style={{ backgroundImage: 'radial-gradient(rgba(100,116,139,1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        {/* Particles */}
        {dots.map(d => (
          <div key={d.id} className="absolute w-0.5 h-0.5 dark:bg-blue-400/30 bg-blue-400/20 rounded-full blur-[0.5px]"
            style={{ left: `${d.x}%`, top: `${d.y}%`, animation: `afloat ${d.dur}s ease-in-out ${d.del}s infinite` }} />
        ))}
      </div>

      {/* ── LEFT PANEL ── */}
      <aside className="hidden lg:flex w-[48%] xl:w-[50%] relative z-10 flex-col justify-between p-12 xl:p-20 dark:border-r dark:border-white/[0.05] border-r border-slate-200 dark:bg-gradient-to-b dark:from-white/[0.01] dark:to-transparent dark:bg-transparent bg-white/40">
        {/* Brand */}
        <div className="flex items-center gap-4">
          <div className="relative group/logo">
            <div className="absolute inset-0 bg-blue-600/20 blur-2xl rounded-2xl" />
            <div className="relative w-12 h-12 dark:bg-[#080c14] bg-white dark:border dark:border-white/10 border border-blue-200 rounded-2xl flex items-center justify-center shadow-sm dark:shadow-none">
              <BrainCircuit size={24} className="text-blue-500" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-[22px] font-black dark:text-white text-slate-900 tracking-tighter uppercase leading-none">
              Señas<span className="text-blue-500">IA</span>
            </div>
            <div className="text-[8px] font-black dark:text-white/25 text-slate-400 uppercase tracking-[0.5em]">Enterprise Intelligence</div>
          </div>
        </div>

        {/* Messaging */}
        <div className="max-w-xl space-y-10 group/content">
          <div className="space-y-6">
            <div className="w-12 h-1 bg-blue-600 rounded-full" />
            <h2 className="text-5xl xl:text-7xl font-black dark:text-white text-slate-900 leading-[0.9] tracking-tighter">
              {sideContent?.title || 'Protocolo de Inclusión Global'}
            </h2>
            <p className="text-lg xl:text-xl dark:text-white/35 text-slate-500 font-medium leading-relaxed max-w-md">
              {sideContent?.description || 'Implementando soluciones de IA soberana para la democratización del Lenguaje de Señas.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-12 gap-y-6 max-w-lg">
            {FEATURES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3.5 group/feat">
                <div className="w-9 h-9 rounded-xl dark:bg-white/[0.04] bg-white dark:border dark:border-white/[0.07] border border-blue-100 flex items-center justify-center text-blue-500 group-hover/feat:bg-blue-600 group-hover/feat:text-white transition-all duration-300 dark:shadow-none shadow-sm">
                  <Icon size={14} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest dark:text-white/30 text-slate-400 group-hover/feat:dark:text-white/60 group-hover/feat:text-slate-900 transition-colors">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between dark:border-t dark:border-white/[0.03] border-t border-slate-200 pt-10">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.4)] animate-pulse" />
            <span className="text-[9px] font-black dark:text-white/20 text-slate-400 uppercase tracking-[0.3em]">Status: Core Operational</span>
          </div>
          <p className="text-[9px] font-bold dark:text-white/10 text-slate-500 uppercase tracking-[0.2em]">© 2024 SEÑASIA CORE</p>
        </div>
      </aside>

      {/* ── RIGHT PANEL ── */}
      <main className="flex-1 relative z-10 flex flex-col items-center p-4 sm:p-8 lg:p-12 xl:p-24 overflow-y-auto overflow-x-hidden min-h-screen sm:min-h-0">
        {/* Theme toggle — top right */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
          <ThemeToggle variant="badge" />
        </div>

        {/* Mobile Header */}
        <div className="mt-8 mb-8 lg:hidden flex flex-col items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-600/20 blur-xl rounded-xl" />
            <div className="relative w-10 h-10 dark:bg-[#080c14] bg-white dark:border dark:border-white/10 border border-blue-200 rounded-xl flex items-center justify-center">
              <BrainCircuit size={20} className="text-blue-500" />
            </div>
          </div>
          <span className="text-xl font-black tracking-tighter uppercase dark:text-white text-slate-900">Señas<span className="text-blue-500">IA</span></span>
        </div>

        <div className="w-full max-w-[420px] relative my-auto sm:py-10">
          {/* Back button */}
          {showBack && (
            <button onClick={onBack}
              className="mb-8 p-3 rounded-2xl dark:bg-white/[0.03] bg-slate-100 dark:border dark:border-white/[0.06] border border-slate-200 dark:text-white/20 text-slate-400 hover:text-blue-500 dark:hover:text-white dark:hover:bg-white/[0.08] hover:bg-slate-200 hover:border-slate-300 transition-all group flex items-center gap-2 lg:absolute lg:-left-24 lg:top-0 lg:mb-0">
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="lg:hidden text-[10px] font-black uppercase tracking-widest">Volver</span>
            </button>
          )}

          {/* Header */}
          <div className="mb-8 sm:mb-10 space-y-3 sm:space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-0.5 w-6 bg-blue-600 rounded-full" />
              <span className="text-[8px] sm:text-[9px] font-black text-blue-500 uppercase tracking-[0.4em]">{subtitle}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl xl:text-5xl font-black dark:text-white text-slate-900 tracking-tighter leading-none uppercase">{title}</h1>
            <div className="h-px w-full dark:bg-gradient-to-r dark:from-white/[0.08] dark:to-transparent bg-gradient-to-r from-slate-200 to-transparent" />
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </div>

          <div className="mt-8 sm:mt-12 pt-8 dark:border-t dark:border-white/[0.03] border-t border-slate-100 text-center">
            <p className="text-[8px] font-black dark:text-white/10 text-slate-400 uppercase tracking-[0.5em] leading-relaxed">
              Security Protocol Active — Node Secured by AES-256
            </p>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes afloat {
          0%, 100% { transform: translateY(0); opacity: 0.15; }
          50% { transform: translateY(-25px); opacity: 0.45; }
        }
        .animate-pulse-slow { animation: pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      `}</style>
    </div>
  );
};

export default AuthLayout;