import React from 'react';
import {
  Heart, Coffee, Github, Mail, Phone,
  MessageCircle, BrainCircuit, Zap
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-20 px-8 py-12 bg-white/[0.02] backdrop-blur-3xl rounded-[3rem] border border-white/5 relative overflow-hidden group">
      {/* Decorative background element */}
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-600/5 rounded-full blur-[100px] transition-all group-hover:bg-blue-600/10"></div>

      <div className="grid md:grid-cols-4 gap-12 mb-12 relative z-10">
        {/* Brand Section */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-2xl shadow-lg shadow-blue-500/20">
              <BrainCircuit className="text-white" size={28} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white tracking-tight">
                SeñasIA
              </h3>
              <p className="text-blue-400/60 text-[10px] uppercase font-black tracking-[0.2em] leading-none mt-1">Intelligent Learning</p>
            </div>
          </div>
          <p className="text-white/40 text-sm leading-relaxed max-w-sm font-medium">
            Liderando la inclusión digital mediante inteligencia artificial. Nuestra plataforma
            democratiza el aprendizaje de señas con feedback en tiempo real y tutoría personalizada.
          </p>
          <div className="flex items-center gap-6 pt-2">
            <div className="flex items-center gap-2 group/item cursor-default">
              <div className="p-1.5 rounded-lg bg-yellow-500/10 text-yellow-500">
                <Zap size={14} />
              </div>
              <span className="text-white/30 text-[11px] font-bold group-hover/item:text-white/50 transition-colors uppercase tracking-widest">Real-time AI</span>
            </div>
            <div className="flex items-center gap-2 group/item cursor-default">
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
                <MessageCircle size={14} />
              </div>
              <span className="text-white/30 text-[11px] font-bold group-hover/item:text-white/50 transition-colors uppercase tracking-widest">Voice Guidance</span>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-6">
          <h4 className="text-white text-xs font-black uppercase tracking-[0.3em]">Navegación</h4>
          <ul className="space-y-3">
            {['Módulos Académicos', 'Mi Progreso', 'Logros', 'Soporte Técnico'].map((item) => (
              <li key={item}>
                <button className="text-white/40 hover:text-blue-400 transition-all text-sm font-semibold flex items-center gap-2 group/btn">
                  <div className="w-1 h-1 bg-white/10 rounded-full group-hover/btn:bg-blue-500 transition-colors" />
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact info */}
        <div className="space-y-6">
          <h4 className="text-white text-xs font-black uppercase tracking-[0.3em]">Contacto</h4>
          <div className="space-y-4">
            <div className="flex items-center gap-4 group/box p-1 hover:translate-x-1 transition-transform">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/30 group-hover/box:text-blue-400 transition-colors">
                <Mail size={18} />
              </div>
              <div>
                <p className="text-white/20 text-[10px] font-black uppercase tracking-widest">Email</p>
                <p className="text-white/60 text-sm font-bold">ia@senasia.edu</p>
              </div>
            </div>
            <div className="flex items-center gap-4 group/box p-1 hover:translate-x-1 transition-transform">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/30 group-hover/box:text-green-400 transition-colors">
                <Phone size={18} />
              </div>
              <div>
                <p className="text-white/20 text-[10px] font-black uppercase tracking-widest">WhatsApp</p>
                <p className="text-white/60 text-sm font-bold">+51 900 000 000</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5 pt-10 mt-10 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <p className="text-white/20 text-[11px] font-bold uppercase tracking-widest">
            © {currentYear} SEÑASIA ACADEMY. Todos los derechos reservados.
          </p>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 text-white/20 text-[11px] font-bold uppercase tracking-[0.2em]">
            <span>Hecho con</span>
            <Heart size={14} className="text-red-500/40 animate-pulse" />
            <span>&</span>
            <Coffee size={14} className="text-orange-950/40" />
            <span>X IA Lab</span>
          </div>

          <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all">
            <Github size={18} />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;