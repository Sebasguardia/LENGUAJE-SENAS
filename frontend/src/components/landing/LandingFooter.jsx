import React from 'react';
import { BrainCircuit, Mail, Globe, ArrowRight, Shield, Zap } from 'lucide-react';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

const LandingFooter = () => {
  const currentYear = new Date().getFullYear();

  const links = {
    Plataforma: ['Módulos de Aprendizaje', 'Modo Traductor', 'Ranking Global', 'Certificaciones', 'API Enterprise'],
    Compañía: ['Sobre Nosotros', 'Misión Social', 'Blog Técnico', 'Prensa & Media', 'Trabaja con Nosotros'],
    Legal: ['Privacidad', 'Términos de Uso', 'Cookies', 'Seguridad', 'Accesibilidad'],
  };

  const socials = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Youtube, href: '#', label: 'YouTube' },
  ];

  return (
    <footer className="w-full dark:bg-[#05070a] bg-white dark:border-t dark:border-white/5 border-t border-slate-200 relative z-10 overflow-hidden">
      {/* Top glow decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-blue-600/30 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-24 dark:bg-blue-600/5 bg-blue-100/60 blur-3xl" />

      <div className="max-w-7xl mx-auto px-8 pt-20 pb-10">
        {/* Newsletter banner */}
        <div className="relative mb-16 sm:mb-20 rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden dark:bg-gradient-to-br dark:from-[#0a0f1a] dark:to-[#050a14] bg-gradient-to-br from-slate-50 to-blue-50/50 dark:border dark:border-blue-500/15 border border-blue-200/50 p-8 sm:p-12 text-center md:text-left">
          <div className="absolute inset-0 dark:opacity-[0.04] opacity-[0.03]"
            style={{ backgroundImage: 'radial-gradient(rgba(59,130,246,1) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div className="absolute -top-20 -right-20 w-64 h-64 dark:bg-blue-600/10 bg-blue-200/30 blur-[80px] rounded-full" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <div className="flex items-center gap-2 mb-3">
                <Zap size={14} className="text-blue-500" />
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.25em]">Novedades del Sistema</span>
              </div>
              <h3 className="text-xl sm:text-3xl font-black dark:text-white text-slate-900 tracking-tight leading-tight">
                Mantente al día con <br className="hidden sm:block" />
                <span className="text-blue-500">las actualizaciones IA</span>
              </h3>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <input type="email" placeholder="tu@email.com"
                className="flex-1 md:w-64 dark:bg-white/5 bg-white dark:border dark:border-white/10 border border-slate-200 dark:text-white text-slate-900 placeholder-slate-400 dark:placeholder-white/20 rounded-xl px-5 py-3.5 text-sm font-medium focus:outline-none focus:border-blue-500/40 transition-all text-center sm:text-left"
              />
              <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-6 py-3.5 font-black text-xs uppercase tracking-[0.15em] transition-all shadow-lg shadow-blue-600/20 whitespace-nowrap">
                Suscribirse <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-16 mb-16">
          {/* Brand column */}
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="dark:bg-[#0a0c10] bg-white dark:border dark:border-blue-500/30 border border-blue-200 p-2.5 rounded-xl shadow-sm dark:shadow-none">
                <BrainCircuit className="text-blue-500" size={22} />
              </div>
              <span className="text-2xl font-black dark:text-white text-slate-900 uppercase tracking-tighter">
                Señas<span className="text-blue-500">IA</span>
              </span>
            </div>
            <p className="dark:text-white/25 text-slate-400 text-sm leading-relaxed font-medium max-w-[220px]">
              La plataforma educativa de lenguaje de señas más avanzada del mundo.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {[{ value: '10K+', label: 'Usuarios' }, { value: '95%', label: 'Precisión IA' }, { value: '6', label: 'Módulos' }, { value: '24/7', label: 'Soporte' }].map(({ value, label }) => (
                <div key={label} className="p-3 rounded-xl dark:bg-white/[0.03] bg-slate-50 dark:border dark:border-white/5 border border-slate-100">
                  <div className="text-lg font-black dark:text-white text-slate-900">{value}</div>
                  <div className="text-[9px] font-black dark:text-white/20 text-slate-400 uppercase tracking-wider">{label}</div>
                </div>
              ))}
            </div>

            {/* Socials */}
            <div className="flex gap-2">
              {socials.map(({ icon: Icon, href, label }) => (
                <a key={label} href={href} aria-label={label}
                  className="w-9 h-9 rounded-xl dark:bg-white/[0.03] bg-slate-100 dark:border dark:border-white/5 border border-slate-200 flex items-center justify-center dark:text-white/30 text-slate-400 hover:text-blue-500 dark:hover:text-white dark:hover:bg-blue-600/20 hover:bg-blue-50 dark:hover:border-blue-500/30 hover:border-blue-300 transition-all duration-300">
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Links columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-10 gap-x-6 sm:gap-10">
            {Object.entries(links).map(([category, items]) => (
              <div key={category}>
                <h4 className="text-[9px] font-black dark:text-white/50 text-slate-500 uppercase tracking-[0.35em] mb-5 flex items-center gap-2 leading-none">
                  <span className="w-2.5 h-px bg-blue-500 inline-block" />
                  {category}
                </h4>
                <ul className="space-y-3">
                  {items.map((item) => (
                    <li key={item}>
                      <a href="#" className="group text-sm font-medium dark:text-white/25 text-slate-400 dark:hover:text-white/70 hover:text-slate-700 transition-colors duration-300 flex items-center gap-2">
                        <span className="w-0 group-hover:w-2 h-px bg-blue-500 transition-all duration-300 inline-block" />
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Contact */}
            <div className="col-span-2 sm:col-span-1 border-t dark:border-white/5 border-slate-100 pt-8 sm:pt-0 sm:border-0">
              <h4 className="text-[9px] font-black dark:text-white/50 text-slate-500 uppercase tracking-[0.35em] mb-5 flex items-center gap-2 leading-none">
                <span className="w-2.5 h-px bg-blue-500 inline-block" />Contacto
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                <a href="mailto:enterprise@señasia.com" className="flex items-start gap-3 group">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0 group-hover:scale-110 transition-transform">
                    <Mail size={14} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black dark:text-white/20 text-slate-400 uppercase tracking-widest leading-none mb-1">Email</p>
                    <p className="text-xs font-bold dark:text-white/40 text-slate-500 group-hover:text-blue-500 transition-colors">enterprise@señasia.com</p>
                  </div>
                </a>
                <div className="flex items-start gap-3 group cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500 shrink-0 group-hover:scale-110 transition-transform">
                    <Globe size={14} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black dark:text-white/20 text-slate-400 uppercase tracking-widest leading-none mb-1">Cobertura</p>
                    <p className="text-xs font-bold dark:text-white/40 text-slate-500 group-hover:text-green-500 transition-colors">Latinoamérica & España</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 dark:border-t dark:border-white/[0.05] border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] font-black dark:text-white/15 text-slate-400 uppercase tracking-[0.25em]">
            © {currentYear} SeñasIA Corp. · Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Shield size={10} className="dark:text-white/15 text-slate-400" />
              <span className="text-[9px] font-black dark:text-white/15 text-slate-400 uppercase tracking-widest">SSL Secured</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
              <span className="text-[9px] font-black dark:text-white/15 text-slate-400 uppercase tracking-widest">Todos los sistemas operativos</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
