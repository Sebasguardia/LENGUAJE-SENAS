import React, { useState, useEffect } from 'react';
import {
  Heart, Coffee, Github, Mail, Phone,
  MessageCircle, BrainCircuit, Zap, ChevronUp,
  Globe, ShieldCheck, Cpu, Power, ArrowLeft
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [isVisible, setIsVisible] = useState(false);
  const [systemTime, setSystemTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) setIsVisible(true);
      else setIsVisible(false);
    };

    const timer = setInterval(() => {
      setSystemTime(new Date().toLocaleTimeString());
    }, 1000);

    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
      clearInterval(timer);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer className="mt-24 px-6 sm:px-12 py-16 dark:bg-[#05070a]/60 bg-slate-50 backdrop-blur-3xl rounded-[3rem] dark:border-white/5 border-slate-200 relative overflow-hidden group/footer transition-colors">
      {/* Dynamic Background Effects */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
      <div className="absolute -bottom-40 -left-20 w-80 h-80 bg-blue-600/5 rounded-full blur-[120px] transition-all duration-1000 group-hover/footer:bg-blue-600/10"></div>
      <div className="absolute -top-40 -right-20 w-80 h-80 bg-purple-600/5 rounded-full blur-[120px] transition-all duration-1000 group-hover/footer:bg-purple-600/10"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">
          
          {/* Section 1: Logo & Mission (Enterprise Style) */}
          <div className="lg:col-span-5 space-y-8">
            <div className="flex items-center gap-5">
              <div className="relative group/logo">
                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-2xl group-hover/logo:bg-blue-500/40 transition-all"></div>
                <div className="relative dark:bg-[#0a0c10] bg-white dark:border-white/10 border-slate-200 p-4 rounded-2xl shadow-2xl transition-colors">
                  <BrainCircuit className="text-blue-500" size={32} />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-3xl font-black dark:text-white text-slate-900 tracking-tighter uppercase transition-colors">
                  Señas<span className="text-blue-600">IA</span>
                </h3>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="dark:text-white/30 text-slate-400 text-[9px] font-black uppercase tracking-[0.3em] transition-colors">Protocol Active</span>
                </div>
              </div>
            </div>
            
            <p className="dark:text-white/40 text-slate-500 text-sm leading-relaxed max-w-sm font-medium italic transition-colors">
              "Liderando la inclusión digital mediante inteligencia artificial de grado corporativo. Nuestra misión es democratizar la comunicación universal."
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <div className="flex items-center gap-3 px-4 py-2 dark:bg-white/5 bg-white border dark:border-white/10 border-slate-200 rounded-xl hover:dark:bg-white/10 hover:bg-slate-50 transition-all group/chip cursor-default">
                <ShieldCheck size={14} className="text-blue-500 group-hover/chip:rotate-12 transition-transform" />
                <span className="text-[10px] dark:text-white/50 text-slate-500 font-black uppercase tracking-widest transition-colors">TLS 1.3 Secure</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-2 dark:bg-white/5 bg-white border dark:border-white/10 border-slate-200 rounded-xl hover:dark:bg-white/10 hover:bg-slate-50 transition-all group/chip cursor-default">
                <Globe size={14} className="text-purple-500 group-hover/chip:rotate-12 transition-transform" />
                <span className="text-[10px] dark:text-white/50 text-slate-500 font-black uppercase tracking-widest transition-colors">Global Node</span>
              </div>
            </div>
          </div>

          {/* Section 2: Navigation (Dynamic Matrix) */}
          <div className="lg:col-span-2 space-y-8">
            <h4 className="dark:text-white text-slate-900 text-[10px] font-black uppercase tracking-[0.4em] mb-8 relative inline-block transition-colors">
              Secciones
              <div className="absolute -bottom-2 left-0 w-1/2 h-0.5 bg-blue-500/30"></div>
            </h4>
            <ul className="space-y-4">
              {[
                { label: 'Módulos', id: 'modules-section' },
                { label: 'Progreso', id: 'stats-section' },
                { label: 'Ranking', id: 'ranking-section' }
              ].map((item) => (
                <li key={item.label}>
                  <button 
                    onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' })}
                    className="dark:text-white/40 text-slate-500 hover:dark:text-white hover:text-blue-600 transition-all text-xs font-black uppercase tracking-widest flex items-center gap-3 group/nav"
                  >
                    <ArrowLeft size={10} className="opacity-0 -translate-x-2 group-hover/nav:opacity-100 group-hover/nav:translate-x-0 transition-all rotate-180" />
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 3: Tech Specs (Dynamic Status) */}
          <div className="lg:col-span-2 space-y-8">
            <h4 className="dark:text-white text-slate-900 text-[10px] font-black uppercase tracking-[0.4em] mb-8 relative inline-block transition-colors">
              Tecnología
              <div className="absolute -bottom-2 left-0 w-1/2 h-0.5 bg-blue-500/30"></div>
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between group/status">
                <span className="text-[10px] dark:text-white/30 text-slate-400 font-bold uppercase tracking-widest transition-colors">API Status</span>
                <span className="px-2 py-0.5 rounded text-[8px] font-black bg-blue-500/10 text-blue-600 border border-blue-500/20">Operational</span>
              </div>
              <div className="flex items-center justify-between group/status">
                <span className="text-[10px] dark:text-white/30 text-slate-400 font-bold uppercase tracking-widest transition-colors">IA Engine</span>
                <span className="px-2 py-0.5 rounded text-[8px] font-black bg-purple-500/10 text-purple-600 border border-purple-500/20">V2.4 Active</span>
              </div>
              <div className="flex items-center justify-between group/status">
                <span className="text-[10px] dark:text-white/30 text-slate-400 font-bold uppercase tracking-widest transition-colors">Cores</span>
                <span className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] dark:text-white/60 text-slate-500 font-bold font-mono transition-colors">16x Cloud</span>
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Contact & Social */}
          <div className="lg:col-span-3 space-y-8">
            <h4 className="text-white text-[10px] font-black uppercase tracking-[0.4em] mb-8 relative inline-block">
              Conexión
              <div className="absolute -bottom-2 left-0 w-1/2 h-0.5 bg-blue-500/30"></div>
            </h4>
            <div className="flex flex-col gap-4">
              <button className="flex items-center gap-4 p-3 dark:bg-white/5 bg-white border dark:border-white/5 border-slate-200 rounded-2xl hover:border-blue-500/30 hover:bg-slate-50 transition-all group/item w-full">
                <div className="w-10 h-10 rounded-xl dark:bg-[#0a0c10] bg-slate-50 flex items-center justify-center dark:text-white/20 text-slate-400 group-hover/item:text-blue-500 transition-colors shrink-0">
                  <Mail size={18} />
                </div>
                <div className="text-left">
                  <p className="dark:text-white/20 text-slate-400 text-[8px] font-black uppercase tracking-widest transition-colors">Central</p>
                  <p className="dark:text-white/80 text-slate-700 text-xs font-bold font-mono transition-colors">support@senasia.corp</p>
                </div>
              </button>
              
              <div className="flex gap-4">
                {[
                  { icon: Github, link: 'https://github.com/Sebasguardia' },
                  { icon: MessageCircle, link: '#' },
                  { icon: Phone, link: '#' }
                ].map(({ icon: Icon, link }, idx) => (
                  <a 
                    key={idx} 
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 h-14 dark:bg-white/5 bg-white border dark:border-white/5 border-slate-200 rounded-2xl flex items-center justify-center dark:text-white/30 text-slate-400 hover:text-blue-600 hover:dark:text-white hover:dark:bg-white/10 hover:bg-slate-50 hover:border-blue-500/20 transition-all"
                  >
                    <Icon size={20} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Interactive & Dynamic */}
        <div className="pt-12 mt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 dark:bg-white/5 bg-white px-4 py-2 rounded-xl border dark:border-white/5 border-slate-200 transition-colors shadow-sm dark:shadow-none">
              <Cpu size={14} className="text-blue-500" />
              <span className="text-[10px] dark:text-white/40 text-slate-500 font-mono font-bold tracking-widest">SYS_TIME: <span className="dark:text-white/80 text-slate-800">{systemTime}</span></span>
            </div>
            <p className="dark:text-white/20 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] transition-colors">
              © {currentYear} SEÑASIA ACADEMY. PRO VERSION.
            </p>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4 dark:text-white/20 text-slate-400 text-[10px] font-black uppercase tracking-widest transition-colors">
              <div className="flex items-center gap-2 group/love cursor-default">
                <span>Handcrafted with</span>
                <Heart size={14} className="text-red-500 group-hover/love:scale-125 transition-transform" />
              </div>
              <span>&</span>
              <div className="flex items-center gap-2 group/coffee cursor-default">
                <Coffee size={14} className="text-orange-950 group-hover/coffee:translate-y-[-2px] transition-transform" />
                <span>Code</span>
              </div>
            </div>

            {/* Scroll to Top (Dynamic visibility) */}
            <button 
              onClick={scrollToTop}
              className={`w-12 h-12 rounded-2xl bg-blue-600 border border-blue-500/50 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 hover:scale-110 active:scale-95 transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 scale-50 pointer-events-none'
              }`}
            >
              <ChevronUp size={24} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;