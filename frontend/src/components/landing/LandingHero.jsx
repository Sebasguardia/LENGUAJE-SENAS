import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Target, Library, ShieldCheck, Users, ArrowRight, Wifi, CheckCircle2, Sparkles, Activity, Cpu } from 'lucide-react';

const LandingHero = ({ statsRef }) => {
  const navigate = useNavigate();
  const [scanY, setScanY] = useState(0);
  const [activeNode, setActiveNode] = useState(0);
  const scanRef = useRef(null);

  useEffect(() => {
    let progress = 0;
    const interval = setInterval(() => {
      progress = (progress + 0.6) % 100;
      setScanY(progress);
    }, 16);
    const nodeInterval = setInterval(() => setActiveNode(n => (n + 1) % 21), 400);
    return () => { clearInterval(interval); clearInterval(nodeInterval); };
  }, []);

  const stats = [
    { number: '10K+', label: 'Usuarios Activos', icon: Users },
    { number: '95%', label: 'Precisión IA', icon: Target },
    { number: '50+', label: 'Módulos', icon: Library },
    { number: '24/7', label: 'Soporte', icon: ShieldCheck },
  ];

  const landmarks = [
    { x: 50, y: 85 },
    { x: 35, y: 72 }, { x: 28, y: 62 }, { x: 22, y: 52 }, { x: 16, y: 44 },
    { x: 42, y: 65 }, { x: 38, y: 50 }, { x: 36, y: 38 }, { x: 34, y: 28 },
    { x: 50, y: 63 }, { x: 50, y: 47 }, { x: 50, y: 35 }, { x: 50, y: 24 },
    { x: 58, y: 65 }, { x: 60, y: 50 }, { x: 62, y: 38 }, { x: 63, y: 27 },
    { x: 66, y: 68 }, { x: 70, y: 56 }, { x: 73, y: 47 }, { x: 75, y: 38 },
  ];
  const connections = [
    [0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],
    [0,9],[9,10],[10,11],[11,12],[0,13],[13,14],[14,15],[15,16],
    [0,17],[17,18],[18,19],[19,20],[5,9],[9,13],[13,17],
  ];

  return (
    <section id="home" className="relative min-h-screen flex flex-col justify-center px-6 pt-28 pb-16 z-10">
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_460px] gap-16 xl:gap-28 items-center">

          {/* ── LEFT: Copy ── */}
          <div className="animate-in fade-in slide-in-from-left-8 duration-1000">

            {/* Status badge */}
            <div className="hero-badge inline-flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-5 py-2.5 rounded-full mb-10 backdrop-blur-xl">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em]">Sistema v2.4 — En Línea</span>
              </div>
              <span className="h-3 w-px bg-blue-400/30" />
              <Sparkles size={11} className="text-blue-300/60" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-300/60">Powered by Neural AI</span>
            </div>

            {/* Title */}
            <h1 className="hero-title text-4xl sm:text-7xl xl:text-[6rem] font-black dark:text-white text-slate-900 mb-6 sm:mb-8 leading-[0.9] sm:leading-[0.88] tracking-tighter">
              EL FUTURO<br />
              DE LA{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                COMUNICACIÓN
              </span>
              <br />INCLUSIVA
            </h1>

            <p className="hero-description text-sm sm:text-lg dark:text-white/35 text-slate-500 mb-8 sm:mb-10 leading-relaxed font-medium max-w-lg">
              Domine el lenguaje de señas con la plataforma educativa más avanzada del mundo.
              Motor de visión artificial de alta precisión para un aprendizaje profesional y certificado.
            </p>

            {/* Trust indicators */}
            <div className="flex flex-wrap gap-x-5 gap-y-3 mb-10">
              {['Certificación Oficial', '50+ Módulos', 'Soporte 24/7', 'Sin costo inicial'].map((label) => (
                <div key={label} className="flex items-center gap-2 text-[9px] font-black dark:text-white/30 text-slate-400 uppercase tracking-widest leading-none">
                  <CheckCircle2 size={11} className="text-blue-500 shrink-0" />
                  {label}
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="hero-buttons flex flex-col sm:flex-row gap-4 mb-12 sm:mb-16">
              <button
                className="group w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-8 sm:px-10 py-4 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/30 transition-all active:scale-95 flex items-center justify-center gap-3"
                onClick={() => navigate('/login')}
              >
                <Play size={14} className="fill-current" />
                Comenzar Entrenamiento
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                className="group w-full sm:w-auto px-8 sm:px-10 py-4 dark:bg-white/[0.04] bg-slate-50 hover:dark:bg-white/[0.08] hover:bg-slate-100 dark:text-white text-slate-600 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] dark:border-white/10 border-slate-200 border hover:border-blue-500/30 transition-all flex items-center justify-center gap-2"
                onClick={() => document.getElementById('modulos')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Explorar Módulos
                <ArrowRight size={13} className="opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </button>
            </div>

            {/* Stats row */}
            <div
              ref={statsRef}
              className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-8 pt-10 border-t dark:border-white/5 border-slate-100"
            >
              {stats.map((stat, i) => (
                <div key={i} className="group stat-item">
                  <div className="text-2xl sm:text-3xl font-black dark:text-white text-slate-900 tracking-tighter group-hover:text-blue-500 transition-colors duration-300 leading-none mb-1.5">
                    {stat.number}
                  </div>
                  <div className="text-[8px] sm:text-[9px] font-black dark:text-white/20 text-slate-400 uppercase tracking-[0.2em]">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Live AI Detection card ── */}
          <div className="hidden lg:flex justify-center items-center animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
            <div className="relative w-full max-w-[380px]">

              {/* Ambient glow */}
              <div className="absolute inset-0 bg-blue-600/15 blur-[100px] rounded-3xl" />

              {/* Main card */}
              <div className="relative bg-white/80 dark:bg-[#09111f]/90 border border-slate-200 dark:border-white/10 rounded-[2rem] overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.1)] dark:shadow-[0_30px_80px_rgba(0,0,0,0.5)] backdrop-blur-2xl">

                {/* Scanline overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
                  style={{ backgroundImage: 'repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 5px)' }} />

                {/* Card header */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)] dark:shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                    <span className="text-[9px] font-black text-slate-400 dark:text-white/30 uppercase tracking-[0.25em]">Detección Neural · Live</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/15 px-3 py-1 rounded-full">
                    <Cpu size={9} className="text-blue-500 dark:text-blue-400" />
                    <span className="text-[8px] font-black text-blue-500 dark:text-blue-400 uppercase tracking-[0.2em]">RT-Core v2</span>
                  </div>
                </div>

                {/* Hand visualization */}
                <div className="relative bg-slate-50 dark:bg-black/60 m-5 rounded-[1.5rem] overflow-hidden border border-slate-100 dark:border-white/5" style={{ aspectRatio: '1/1' }}>
                  {/* Dot grid bg */}
                  <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
                    style={{ backgroundImage: 'radial-gradient(rgba(59,130,246,1) 1px, transparent 1px)', backgroundSize: '18px 18px' }} />

                  {/* Corner HUD brackets */}
                  {[
                    'top-3 left-3 border-t-2 border-l-2',
                    'top-3 right-3 border-t-2 border-r-2',
                    'bottom-3 left-3 border-b-2 border-l-2',
                    'bottom-3 right-3 border-b-2 border-r-2',
                  ].map((cls, i) => (
                    <div key={i} className={`absolute w-4 h-4 ${cls} border-blue-500/40 dark:border-blue-500/70 rounded-sm`} />
                  ))}

                  <svg viewBox="0 0 100 100" className="w-full h-full p-3">
                    <defs>
                      <filter id="nodeGlow">
                        <feGaussianBlur stdDeviation="1" result="blur" />
                        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                      </filter>
                      <linearGradient id="scanLine" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(59,130,246,0)" />
                        <stop offset="50%" stopColor="rgba(59,130,246,0.5)" />
                        <stop offset="100%" stopColor="rgba(59,130,246,0)" />
                      </linearGradient>
                    </defs>

                    {/* Skeleton */}
                    {connections.map(([a, b], i) => (
                      <line
                        key={i}
                        x1={landmarks[a].x} y1={landmarks[a].y}
                        x2={landmarks[b].x} y2={landmarks[b].y}
                        stroke="rgba(59,130,246,0.4)"
                        strokeWidth="0.8"
                        strokeLinecap="round"
                      />
                    ))}

                    {/* Nodes */}
                    {landmarks.map((pt, i) => (
                      <g key={i} filter="url(#nodeGlow)">
                        {activeNode === i && <circle cx={pt.x} cy={pt.y} r="4" fill="rgba(59,130,246,0.2)" />}
                        <circle
                          cx={pt.x} cy={pt.y}
                          r={i === 0 ? 2.2 : activeNode === i ? 2.0 : 1.3}
                          fill={activeNode === i ? '#60a5fa' : i === 0 ? '#3b82f6' : 'rgba(147,197,253,0.75)'}
                        />
                      </g>
                    ))}

                    {/* Scan sweep */}
                    <rect x="0" y={scanY - 6} width="100" height="12" fill="url(#scanLine)" opacity="0.5" />
                    <line x1="0" y1={scanY} x2="100" y2={scanY} stroke="rgba(59,130,246,0.6)" strokeWidth="0.5" />
                  </svg>

                  {/* Live badge */}
                  <div className="absolute top-3 left-1/2 -translate-x-1/2">
                    <span className="flex items-center gap-1.5 bg-white/90 dark:bg-black/70 backdrop-blur border border-slate-200 dark:border-white/10 text-[8px] font-black text-slate-400 dark:text-white/50 uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                      <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse" /> R E C
                    </span>
                  </div>

                  {/* Confidence badge */}
                  <div className="absolute bottom-3 right-3">
                    <div className="flex items-center gap-1.5 bg-white/90 dark:bg-black/70 backdrop-blur-md border border-green-500/20 px-2.5 py-1 rounded-lg shadow-sm">
                      <Activity size={9} className="text-green-500 dark:text-green-400" />
                      <span className="text-[8px] font-black text-green-600 dark:text-green-400 font-mono">98.7%</span>
                    </div>
                  </div>
                </div>

                {/* Detection result */}
                <div className="px-6 pb-3 flex items-center justify-between">
                  <div>
                    <div className="text-[8px] font-black text-slate-400 dark:text-white/20 uppercase tracking-[0.25em] mb-0.5">Seña Detectada</div>
                    <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">HOLA</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[8px] font-black text-slate-300 dark:text-white/20 uppercase tracking-[0.25em] mb-1">Estado</div>
                    <div className="inline-flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
                      <CheckCircle2 size={9} /> Verificado
                    </div>
                  </div>
                </div>

                {/* Confidence bars */}
                <div className="px-6 pb-5 space-y-3">
                  {[
                    { label: 'Confianza', value: 98.7, color: 'from-blue-600 to-indigo-500' },
                    { label: 'Estabilidad', value: 94.2, color: 'from-indigo-600 to-purple-500' },
                  ].map(({ label, value, color }) => (
                    <div key={label}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[8px] font-black text-slate-400 dark:text-white/20 uppercase tracking-widest">{label}</span>
                        <span className="text-[8px] font-black text-slate-500 dark:text-white/40 font-mono">{value}%</span>
                      </div>
                      <div className="h-1 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-700`} style={{ width: `${value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Micro metrics */}
                <div className="grid grid-cols-3 gap-0 border-t border-slate-100 dark:border-white/5">
                  {[
                    { label: 'Latencia', value: '12ms' },
                    { label: 'FPS', value: '30' },
                    { label: 'Puntos', value: '21' },
                  ].map((m, i) => (
                    <div key={m.label} className={`py-4 text-center ${i < 2 ? 'border-r border-slate-100 dark:border-white/5' : ''}`}>
                      <div className="text-sm font-black text-slate-900 dark:text-white font-mono">{m.value}</div>
                      <div className="text-[8px] font-black text-slate-300 dark:text-white/15 uppercase tracking-wider mt-0.5">{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating labels */}
              <div className="absolute -top-3 -right-4 bg-blue-600 text-white text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-xl shadow-blue-600/40 border border-blue-500">
                IA en tiempo real
              </div>
              <div className="absolute -bottom-3 -left-4 bg-white dark:bg-[#0a0c10] border border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/30 text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-sm">
                MediaPipe Neural Engine
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;