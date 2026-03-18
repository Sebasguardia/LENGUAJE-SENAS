import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Award, Users, Sparkles, Zap, Globe } from 'lucide-react';

const trustFeatures = [
  { icon: ShieldCheck, label: 'Cifrado E2E' },
  { icon: Award, label: 'Certificación Oficial' },
  { icon: Users, label: '+10K Profesionales' },
  { icon: Globe, label: 'Acceso Global' },
];

const LandingCTA = ({ ctaRef }) => {
  const navigate = useNavigate();

  return (
    <section ref={ctaRef} className="w-full max-w-6xl mx-auto px-6 mb-36 z-10">
      <div className="relative group overflow-hidden rounded-[3rem] border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.3)]">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900" />
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, #fff 0px, #fff 1px, transparent 1px, transparent 12px)' }} />
        <div className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-400/20 rounded-full blur-[80px] group-hover:scale-125 transition-transform duration-[3s]" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-indigo-600/20 rounded-full blur-[80px] group-hover:scale-110 transition-transform duration-[3s] delay-500" />
        <div className="absolute top-6 right-8 opacity-[0.06]"><Sparkles size={220} /></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

        {/* Content */}
        <div className="relative z-10 px-6 sm:px-20 py-16 sm:py-24 text-center">
          <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8">
            <div className="inline-flex items-center gap-2.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-white/10 border border-white/20 text-white/80 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur-md">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
              Protocolo de Inclusión Activo
              <Zap size={11} className="text-blue-200/60" />
            </div>
            <h2 className="text-4xl sm:text-7xl font-black text-white uppercase tracking-tighter leading-[0.9] sm:leading-[0.88]">
              ¿LISTO PARA EL<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-white to-indigo-200">
                PRÓXIMO NIVEL
              </span>?
            </h2>
            <p className="text-blue-100/50 text-base sm:text-lg font-medium max-w-lg mx-auto leading-relaxed px-4">
              Únase hoy a la red de aprendizaje de lengua de señas más avanzada del mundo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2 sm:pt-4">
              <button
                className="group w-full sm:w-auto px-10 py-4 sm:py-5 bg-white text-blue-900 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-blue-50 transition-all active:scale-95 flex items-center justify-center gap-3"
                onClick={() => navigate('/register')}
              >
                Crear Cuenta Gratis
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                className="w-full sm:w-auto px-10 py-4 sm:py-5 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] border border-white/15 backdrop-blur-md transition-all active:scale-95 flex items-center justify-center"
                onClick={() => navigate('/login')}
              >
                Acceso Institucional
              </button>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-4 px-2">
              {trustFeatures.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/5 border border-white/10 text-[8px] sm:text-[9px] font-black text-white/50 uppercase tracking-widest leading-none">
                  <Icon size={10} sm:size={11} className="text-blue-200/50" />{label}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>
    </section>
  );
};

export default LandingCTA;