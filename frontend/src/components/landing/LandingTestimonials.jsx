import React from 'react';
import { Quote, Star, BadgeCheck, ChevronLeft, ChevronRight } from 'lucide-react';

const LandingTestimonials = ({ testimonialsRef, currentTestimonial, setCurrentTestimonial, testimonials }) => {
  const current = testimonials[currentTestimonial];
  const total = testimonials.length;
  const prev = () => setCurrentTestimonial((currentTestimonial - 1 + total) % total);
  const next = () => setCurrentTestimonial((currentTestimonial + 1) % total);

  return (
    <section ref={testimonialsRef} id="testimonios" className="w-full max-w-6xl mx-auto px-6 mb-36 z-10">
      {/* Header */}
      <div className="flex flex-col items-center mb-16 text-center">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-blue-600/50" />
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-blue-600/50" />
        </div>
        <h2 className="text-4xl sm:text-5xl font-black dark:text-white text-slate-900 uppercase tracking-tighter mb-3">
          VOCES DE LA RED
        </h2>
        <p className="dark:text-white/20 text-slate-400 text-[10px] font-black uppercase tracking-[0.4em]">
          Experiencias de Usuario Verificadas
        </p>
      </div>

      {/* Card */}
      <div className="relative dark:bg-white/[0.02] bg-white dark:border dark:border-white/5 border border-slate-200 backdrop-blur-3xl rounded-[2rem] sm:rounded-[3rem] overflow-hidden dark:shadow-[0_40px_80px_rgba(0,0,0,0.4)] shadow-xl">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-600/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br dark:from-blue-600/4 from-blue-50/50 via-transparent dark:to-indigo-600/4 to-indigo-50/30 pointer-events-none" />
        <div className="absolute top-8 left-8 dark:text-white/[0.02] text-slate-100 hidden sm:block">
          <Quote size={180} />
        </div>

        <div className="relative z-10 p-8 sm:p-16">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 sm:gap-10 items-center">
            {/* Left: Avatar */}
            <div className="flex flex-col items-center lg:items-start gap-5">
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[1.5rem] sm:rounded-[1.75rem] bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5 shadow-2xl shadow-blue-600/25">
                  <div className="w-full h-full rounded-[calc(1.5rem-2px)] sm:rounded-[calc(1.75rem-2px)] dark:bg-[#0a0c10] bg-slate-100 flex items-center justify-center dark:text-white text-slate-600">
                    {React.createElement(current.avatar, { size: 40 })}
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-600 border-2 dark:border-[#05070a] border-white flex items-center justify-center shadow-lg">
                  <BadgeCheck size={12} sm:size={14} className="text-white" />
                </div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-lg sm:text-xl font-black dark:text-white text-slate-900 uppercase tracking-tight mb-1">{current.name}</div>
                <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[8px] sm:text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
                  <BadgeCheck size={10} />{current.role}
                </div>
              </div>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} sm:size={16} className="text-yellow-400 fill-yellow-400" />)}
              </div>
              <div className="flex items-center gap-3 mt-1 sm:mt-2">
                <button onClick={prev} className="w-10 h-10 rounded-xl dark:bg-white/5 bg-slate-100 dark:border dark:border-white/10 border border-slate-200 flex items-center justify-center dark:text-white/40 text-slate-500 hover:text-blue-500 dark:hover:text-white dark:hover:bg-white/10 hover:bg-slate-200 transition-all">
                  <ChevronLeft size={18} />
                </button>
                <span className="text-[10px] font-black dark:text-white/20 text-slate-400 uppercase tracking-widest">{currentTestimonial + 1}/{total}</span>
                <button onClick={next} className="w-10 h-10 rounded-xl dark:bg-white/5 bg-slate-100 dark:border dark:border-white/10 border border-slate-200 flex items-center justify-center dark:text-white/40 text-slate-500 hover:text-blue-500 dark:hover:text-white dark:hover:bg-white/10 hover:bg-slate-200 transition-all">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* Right: Quote */}
            <div className="testimonial-content">
              <Quote size={24} sm:size={28} className="text-blue-500/30 mb-3 sm:mb-4" />
              <blockquote className="text-lg sm:text-2xl font-medium dark:text-white/75 text-slate-600 leading-relaxed mb-6 sm:mb-8">
                {current.text}
              </blockquote>
              <div className="flex gap-2 justify-center lg:justify-start">
                {testimonials.map((_, i) => (
                  <button key={i} onClick={() => setCurrentTestimonial(i)}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      i === currentTestimonial ? 'w-8 sm:w-10 bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.4)]' : 'w-2.5 sm:w-3 dark:bg-white/10 bg-slate-200 dark:hover:bg-white/20 hover:bg-slate-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>
    </section>
  );
};

export default LandingTestimonials;