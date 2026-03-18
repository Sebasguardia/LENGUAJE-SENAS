import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Zap, Sparkles, HeartHandshake, Star, User, Users, Briefcase,
  Hand, HandMetal, ThumbsUp, MousePointer2,
} from 'lucide-react';

// Components
import LandingNavbar from '../components/landing/LandingNavbar';
import LandingHero from '../components/landing/LandingHero';
import LandingProcess from '../components/landing/LandingProcess';
import LandingFeatures from '../components/landing/LandingFeatures';
import LandingModules from '../components/landing/LandingModules';
import LandingTestimonials from '../components/landing/LandingTestimonials';
import LandingCTA from '../components/landing/LandingCTA';
import LandingFooter from '../components/landing/LandingFooter';

gsap.registerPlugin(ScrollTrigger);

// ─── Testimonials data ─────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    name: 'María González',
    role: 'Especialista en Educación',
    text: 'SeñasIA ha transformado radicalmente nuestra metodología de inclusión. La precisión del motor neuronal es simplemente inigualable.',
    avatar: User,
  },
  {
    name: 'Dr. Carlos Ruiz',
    role: 'Director de Innovación',
    text: 'Una infraestructura tecnológica robusta que permite escalar el aprendizaje del lenguaje de señas a niveles institucionales.',
    avatar: Briefcase,
  },
  {
    name: 'Ana Martínez',
    role: 'Intérprete Certificada',
    text: 'La plataforma ofrece un entorno de práctica profesional que simula situaciones reales con una fidelidad asombrosa.',
    avatar: Users,
  },
];

// ─── Neural Canvas ─────────────────────────────────────────────────────────────
const useNeuralCanvas = (canvasRef) => {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = Math.random() * 0.4 - 0.2;
        this.speedY = Math.random() * 0.4 - 0.2;
        this.hue = Math.random() * 40 + 210;
        this.alpha = Math.random() * 0.18 + 0.04;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }
      draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = `hsl(${this.hue}, 70%, 60%)`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    const particles = Array.from({ length: 100 }, () => new Particle());

    const drawNeural = () => {
      const layers = 5, perLayer = 8;
      const lw = canvas.width / (layers + 1);
      for (let l = 1; l <= layers; l++) {
        const x = l * lw;
        for (let n = 0; n < perLayer; n++) {
          const y = (n + 1) * (canvas.height / (perLayer + 1));
          const pulse = Math.sin(Date.now() * 0.002 + l * 0.5 + n * 0.2) * 0.3 + 0.7;
          ctx.save();
          ctx.globalAlpha = 0.04 * pulse;
          ctx.fillStyle = `hsl(${220 + l * 10}, 70%, 60%)`;
          ctx.beginPath();
          ctx.arc(x, y, 2 * pulse, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.save();
            ctx.globalAlpha = (150 - dist) / 150 * 0.04;
            ctx.strokeStyle = 'hsl(220, 70%, 50%)';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
            ctx.restore();
          }
        }
      }

      drawNeural();
      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [canvasRef]);
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
const Landing = () => {
  const canvasRef = useRef(null);
  const statsRef = useRef(null);
  const featuresRef = useRef(null);
  const modulesRef = useRef(null);
  const testimonialsRef = useRef(null);
  const ctaRef = useRef(null);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useNeuralCanvas(canvasRef);

  // ── GSAP Animations ──────────────────────────────────────────────────────────
  useEffect(() => {
    // Hero sequence
    gsap.timeline()
      .fromTo('.hero-badge',
        { scale: 0, rotation: -180, opacity: 0 },
        { scale: 1, rotation: 0, opacity: 1, duration: 0.8, ease: 'back.out(1.7)' }
      )
      .fromTo('.hero-title',
        { y: 80, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }, '-=0.3'
      )
      .fromTo('.hero-description',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 }, '-=0.5'
      )
      .fromTo('.hero-buttons',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 }, '-=0.3'
      )
      .fromTo('.stat-item',
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.6, stagger: 0.15, ease: 'elastic.out(1, 0.5)' }, '-=0.2'
      );

    // Feature cards
    gsap.fromTo('.feature-card',
      { y: 80, opacity: 0, rotationX: 30 },
      {
        y: 0, opacity: 1, rotationX: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: featuresRef.current, start: 'top 80%', toggleActions: 'play none none reverse' },
      }
    );

    // Module cards
    gsap.fromTo('.module-card',
      { scale: 0.85, opacity: 0, y: 40 },
      {
        scale: 1, opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: 'back.out(1.2)',
        scrollTrigger: { trigger: modulesRef.current, start: 'top 70%', toggleActions: 'play none none reverse' },
      }
    );

    // CTA
    gsap.fromTo(ctaRef.current,
      { scale: 0.85, opacity: 0 },
      {
        scale: 1, opacity: 1, duration: 1.2, ease: 'power3.out',
        scrollTrigger: { trigger: ctaRef.current, start: 'top 85%', toggleActions: 'play none none reverse' },
      }
    );

    // Floating decorations
    gsap.to('.floating-element', {
      y: 28, rotation: 4, duration: 5, repeat: -1, yoyo: true, ease: 'sine.inOut', stagger: 0.6,
    });

    // Auto-rotate testimonials
    const interval = setInterval(() => {
      gsap.to('.testimonial-content', {
        opacity: 0, y: -16, duration: 0.4,
        onComplete: () => {
          setCurrentTestimonial(prev => (prev + 1) % TESTIMONIALS.length);
          gsap.fromTo('.testimonial-content',
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 0.4 }
          );
        },
      });
    }, 8000);

    return () => {
      clearInterval(interval);
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <div className="min-h-screen dark:bg-[#05070a] bg-[#f8fafc] flex flex-col relative overflow-hidden font-sans selection:bg-blue-500/30 dark:text-white text-slate-900">

      {/* ── Background ──────────────────────────────────────────────────────── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] dark:bg-blue-600/5 bg-blue-400/8 rounded-full blur-[160px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] dark:bg-indigo-600/5 bg-indigo-300/8 rounded-full blur-[160px] animate-pulse" style={{ animationDuration: '5s' }} />
        <div className="absolute inset-0 dark:opacity-[0.025] opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(#a0aec0 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      {/* Neural canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none dark:opacity-35 opacity-20 dark:mix-blend-screen mix-blend-multiply" />

      {/* Floating icon decorations */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {[Hand, HandMetal, ThumbsUp, MousePointer2, Star, Zap, Sparkles, HeartHandshake].map((Icon, i) => (
          <div
            key={i}
            className="floating-element absolute dark:text-white text-slate-400"
            style={{ opacity: 0.025, left: `${[5, 15, 25, 70, 80, 60, 45, 90][i]}%`, top: `${[10, 60, 30, 15, 70, 45, 80, 35][i]}%` }}
          >
            <Icon size={110} />
          </div>
        ))}
      </div>

      {/* ── UI ──────────────────────────────────────────────────────────────── */}
      <LandingNavbar />

      <main className="relative z-10">
        <LandingHero statsRef={statsRef} />

        <LandingProcess />

        <LandingFeatures featuresRef={featuresRef} />

        <LandingModules modulesRef={modulesRef} />

        <LandingTestimonials
          testimonialsRef={testimonialsRef}
          currentTestimonial={currentTestimonial}
          setCurrentTestimonial={setCurrentTestimonial}
          testimonials={TESTIMONIALS}
        />

        <LandingCTA ctaRef={ctaRef} />
      </main>

      <LandingFooter />

      <style>{`
        ::-webkit-scrollbar { width: 6px; }
      `}</style>
    </div>
  );
};

export default Landing;