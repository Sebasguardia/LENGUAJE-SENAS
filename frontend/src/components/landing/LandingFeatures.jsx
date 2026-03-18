import React from 'react';
import { Zap, Target, Award, Cpu, Globe, ShieldCheck, ArrowUpRight } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Tiempo Real',
    desc: 'Detección instantánea con latencia inferior a 15 ms mediante redes neuronales convolucionales de vanguardia.',
    color: 'text-yellow-400',
    border: 'border-yellow-500/20',
    iconBg: 'bg-yellow-500/10',
    glow: 'rgba(234,179,8,0.12)',
    stat: '< 15 ms',
    statLabel: 'Latencia',
  },
  {
    icon: Target,
    title: 'Alta Precisión',
    desc: 'Más del 95% de exactitud en el reconocimiento de señas bajo condiciones variables de iluminación.',
    color: 'text-blue-400',
    border: 'border-blue-500/20',
    iconBg: 'bg-blue-500/10',
    glow: 'rgba(59,130,246,0.12)',
    stat: '95%+',
    statLabel: 'Acierto',
  },
  {
    icon: Award,
    title: 'Certificación',
    desc: 'Diplomas acreditados internacionalmente al completar cada nivel del programa oficial.',
    color: 'text-purple-400',
    border: 'border-purple-500/20',
    iconBg: 'bg-purple-500/10',
    glow: 'rgba(168,85,247,0.12)',
    stat: '6',
    statLabel: 'Niveles',
  },
  {
    icon: Cpu,
    title: 'Motor Adaptativo',
    desc: 'La IA ajusta la dificultad en tiempo real según su velocidad y precisión de aprendizaje personalizado.',
    color: 'text-green-400',
    border: 'border-green-500/20',
    iconBg: 'bg-green-500/10',
    glow: 'rgba(34,197,94,0.12)',
    stat: '21',
    statLabel: 'Puntos tracking',
  },
  {
    icon: Globe,
    title: 'Multidialecto',
    desc: 'Soporte para múltiples variaciones regionales: LSE, LSP, ASL y más dialectos en expansión continua.',
    color: 'text-indigo-400',
    border: 'border-indigo-500/20',
    iconBg: 'bg-indigo-500/10',
    glow: 'rgba(99,102,241,0.12)',
    stat: '4+',
    statLabel: 'Lenguas',
  },
  {
    icon: ShieldCheck,
    title: 'Grado Enterprise',
    desc: 'Cifrado de extremo a extremo y arquitectura de cero confianza para proteger datos institucionales.',
    color: 'text-red-400',
    border: 'border-red-500/20',
    iconBg: 'bg-red-500/10',
    glow: 'rgba(239,68,68,0.12)',
    stat: 'E2E',
    statLabel: 'Cifrado',
  },
];

const LandingFeatures = ({ featuresRef }) => (
  <section ref={featuresRef} id="caracteristicas" className="w-full max-w-7xl mx-auto px-6 mb-36 z-10">

    {/* Header */}
    <div className="flex flex-col items-center mb-20 text-center">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.25em] mb-6">
        <Cpu size={11} /> Tecnología de Grado Militar
      </div>
      <h2 className="text-4xl sm:text-6xl font-black dark:text-white text-slate-900 mb-4 uppercase tracking-tighter">
        INGENIERÍA DE{' '}
        <span className="dark:text-white/15 text-slate-300">VANGUARDIA</span>
      </h2>
      <p className="dark:text-white/25 text-slate-400 text-sm max-w-md font-medium leading-relaxed">
        Infraestructura construida para la excelencia — escalable, segura y adaptativa.
      </p>
      <div className="h-1 w-16 bg-blue-600 rounded-full mt-6" />
    </div>

    {/* Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
      {features.map((f, i) => (
        <div
          key={i}
          className={`feature-card group relative dark:bg-white/[0.02] bg-white dark:border dark:hover:bg-white/[0.04] hover:bg-slate-50 border ${f.border} rounded-[1.75rem] sm:rounded-[2rem] p-6 sm:p-8 overflow-hidden transition-all duration-500 cursor-default shadow-sm dark:shadow-none`}
          style={{ '--glow': f.glow }}
        >
          {/* Ambient glow */}
          <div
            className="absolute -right-10 -bottom-10 w-44 h-44 blur-[70px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"
            style={{ background: f.glow }}
          />
          {/* Top gradient on hover */}
          <div className="absolute inset-0 rounded-[1.75rem] sm:rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{ background: `linear-gradient(135deg, ${f.glow.replace('0.12', '0.06')} 0%, transparent 60%)` }}
          />

          <div className="relative z-10 flex flex-col h-full">
            {/* Header row */}
            <div className="flex items-start justify-between mb-5 sm:mb-7">
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl ${f.iconBg} border ${f.border} flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                <f.icon size={22} sm:size={26} className={f.color} />
              </div>
              <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${f.color}`}>
                <ArrowUpRight size={16} />
              </div>
            </div>

            {/* Text */}
            <h3 className={`text-base sm:text-lg font-black dark:text-white text-slate-800 mb-2 sm:mb-3 uppercase tracking-tight group-hover:${f.color} transition-colors duration-300`}>
              {f.title}
            </h3>
            <p className="dark:text-white/25 text-slate-400 text-[13px] sm:text-sm leading-relaxed font-medium mb-6 sm:mb-8 flex-1">
              {f.desc}
            </p>

            {/* Stat */}
            <div className="pt-4 sm:pt-5 border-t dark:border-white/5 border-slate-100 flex items-center justify-between">
              <div>
                <div className={`text-xl sm:text-2xl font-black ${f.color} tracking-tight leading-none`}>{f.stat}</div>
                <div className="text-[8px] sm:text-[9px] font-black dark:text-white/15 text-slate-400 uppercase tracking-widest mt-0.5">{f.statLabel}</div>
              </div>
              {/* Mini progress bar decoration */}
              <div className="flex gap-1 items-end h-5">
                {[40, 70, 55, 90, 65, 100].map((h, j) => (
                  <div
                    key={j}
                    className={`w-1 rounded-t-sm transition-all duration-500 ${f.iconBg} group-hover:opacity-80`}
                    style={{ height: `${h}%`, opacity: 0.3 }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default LandingFeatures;