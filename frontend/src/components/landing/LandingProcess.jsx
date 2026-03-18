import React from 'react';
import { UserPlus, BookOpen, BrainCircuit, Award, ChevronRight } from 'lucide-react';

const steps = [
    {
        icon: UserPlus,
        number: '01',
        title: 'Crear Cuenta',
        desc: 'Regístrese en segundos y configure su perfil de aprendizaje con nivel inicial personalizado.',
        color: 'text-blue-400',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        glow: 'rgba(59,130,246,0.12)',
        lineColor: '#3b82f6',
    },
    {
        icon: BookOpen,
        number: '02',
        title: 'Elegir Módulo',
        desc: 'Seleccione su ruta desde Fundamentos IA hasta Intérprete Senior según su objetivo.',
        color: 'text-indigo-400',
        bg: 'bg-indigo-500/10',
        border: 'border-indigo-500/20',
        glow: 'rgba(99,102,241,0.12)',
        lineColor: '#6366f1',
    },
    {
        icon: BrainCircuit,
        number: '03',
        title: 'Entrenar con IA',
        desc: 'Practique en tiempo real con nuestro motor neuronal adaptativo de alta precisión.',
        color: 'text-purple-400',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/20',
        glow: 'rgba(168,85,247,0.12)',
        lineColor: '#a855f7',
    },
    {
        icon: Award,
        number: '04',
        title: 'Certificarse',
        desc: 'Obtenga su diploma acreditado y únase a la red global de profesionales certificados.',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        glow: 'rgba(16,185,129,0.12)',
        lineColor: '#10b981',
    },
];

const LandingProcess = () => (
    <section id="proceso" className="w-full max-w-7xl mx-auto px-6 mb-36 z-10">

        {/* Header */}
        <div className="flex flex-col items-center mb-20 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/8 text-white/30 text-[10px] font-black uppercase tracking-[0.3em] mb-6">
                Protocolo de Acceso
            </div>
            <h2 className="text-4xl sm:text-6xl font-black dark:text-white text-slate-900 uppercase tracking-tighter">
                ¿CÓMO <span className="dark:text-white/15 text-slate-300">FUNCIONA</span>?
            </h2>
            <div className="h-px w-48 bg-gradient-to-r from-transparent via-blue-600 to-transparent mt-6" />
        </div>

        {/* Timeline */}
        <div className="relative">
            {/* Desktop connector */}
            <div className="hidden lg:block absolute top-[3.75rem] left-[calc(12.5%+2rem)] right-[calc(12.5%+2rem)] z-0">
                <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, rgba(59,130,246,0) 0%, rgba(59,130,246,0.25) 20%, rgba(99,102,241,0.25) 40%, rgba(168,85,247,0.25) 60%, rgba(16,185,129,0) 100%)' }} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 relative z-10">
                {steps.map((step, i) => (
                    <div key={i} className="group relative">
                        {/* Card */}
                        <div className={`bg-white/[0.02] dark:bg-white/[0.02] bg-white dark:border ${step.border} border border-slate-200/80 rounded-[1.75rem] sm:rounded-[2rem] p-6 sm:p-7 h-full overflow-hidden dark:hover:bg-white/[0.04] hover:bg-slate-50 transition-all duration-500 relative shadow-sm dark:shadow-none`}>
                            {/* Glow */}
                            <div
                                className="absolute -bottom-8 -right-8 w-28 h-28 blur-[50px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                                style={{ background: step.glow }}
                            />

                            {/* Step tag */}
                            <div className="flex items-center justify-between mb-5 sm:mb-7 relative z-10">
                                <span className="text-[9px] font-black tracking-[0.5em] dark:text-white/10 text-slate-300">{step.number}</span>
                                {i < steps.length - 1 && (
                                    <ChevronRight size={14} className="dark:text-white/10 text-slate-300 hidden lg:block" />
                                )}
                            </div>

                            {/* Icon */}
                            <div className={`relative z-10 w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl ${step.bg} border ${step.border} flex items-center justify-center mb-5 sm:mb-7 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                                <step.icon size={22} className={step.color} />
                            </div>

                            <h3 className={`relative z-10 text-base sm:text-lg font-black dark:text-white text-slate-800 mb-2 sm:mb-3 uppercase tracking-tight group-hover:${step.color} transition-colors duration-300`}>
                                {step.title}
                            </h3>
                            <p className="relative z-10 dark:text-white/25 text-slate-500 text-[13px] sm:text-sm font-medium leading-relaxed">
                                {step.desc}
                            </p>

                            {/* Bottom accent line */}
                            <div
                                className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                style={{ background: `linear-gradient(90deg, transparent, ${step.lineColor}40, transparent)` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

export default LandingProcess;