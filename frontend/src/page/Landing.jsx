import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  GraduationCap, BookOpen, Sparkles, Users, MessageCircle, BrainCircuit,
  Star, HeartHandshake, Globe2, Phone, Mail, Facebook, Instagram, Twitter,
  Youtube, Zap, Target, Award, Clock, TrendingUp, ChevronRight, Play, Users2,
  ShieldCheck, Library, Hand, HandMetal, ThumbsUp, MousePointer2, Hash,
  MessageSquare, User, Briefcase, Shield, Mic, Book, Menu, X
} from 'lucide-react';

// Registrar ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

const Landing = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  // Refs para animaciones
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const modulesRef = useRef(null);
  const testimonialsRef = useRef(null);
  const ctaRef = useRef(null);
  const headerRef = useRef(null);
  const statsRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Animación del header
    gsap.fromTo(headerRef.current,
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
    );

    // Animación del hero section
    const heroTl = gsap.timeline();
    heroTl
      .fromTo('.hero-badge',
        { scale: 0, rotation: -180 },
        { scale: 1, rotation: 0, duration: 0.8, ease: "back.out(1.7)" }
      )
      .fromTo('.hero-title',
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power3.out" }, "-=0.3"
      )
      .fromTo('.hero-description',
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 }, "-=0.5"
      )
      .fromTo('.hero-buttons',
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 }, "-=0.3"
      )
      .fromTo('.stat-item',
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.6,
          stagger: 0.2,
          ease: "elastic.out(1, 0.5)"
        }, "-=0.2"
      );

    // Animación de features con ScrollTrigger
    gsap.fromTo('.feature-card',
      {
        y: 100,
        opacity: 0,
        rotationX: 45
      },
      {
        y: 0,
        opacity: 1,
        rotationX: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: featuresRef.current,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse"
        }
      }
    );

    // Animación de módulos con efecto cascada
    gsap.fromTo('.module-card',
      {
        scale: 0.8,
        opacity: 0,
        y: 50
      },
      {
        scale: 1,
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "back.out(1.2)",
        scrollTrigger: {
          trigger: modulesRef.current,
          start: "top 70%",
          end: "bottom 30%",
          toggleActions: "play none none reverse"
        }
      }
    );

    // Animación de testimonials
    gsap.fromTo(testimonialsRef.current,
      {
        scale: 0.9,
        opacity: 0
      },
      {
        scale: 1,
        opacity: 1,
        duration: 1,
        scrollTrigger: {
          trigger: testimonialsRef.current,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse"
        }
      }
    );

    // Animación del CTA final
    gsap.fromTo(ctaRef.current,
      {
        scale: 0.8,
        opacity: 0,
        rotationY: 90
      },
      {
        scale: 1,
        opacity: 1,
        rotationY: 0,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ctaRef.current,
          start: "top 85%",
          end: "bottom 15%",
          toggleActions: "play none none reverse"
        }
      }
    );

    // Animación de elementos flotantes continuos
    gsap.to('.floating-element', {
      y: 30,
      rotation: 5,
      duration: 4,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      stagger: 0.5
    });

    // Efecto de partículas en el cursor
    const handleMouseMove = (e) => {
      gsap.to('.cursor-particle', {
        x: e.clientX,
        y: e.clientY,
        stagger: 0.1,
        duration: 0.5,
        ease: "power2.out"
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Canvas animation (tu código existente)
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let animationFrameId;
    const particles = [];

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
        this.color = `hsl(${Math.random() * 60 + 200}, 70%, 60%)`;
        this.alpha = Math.random() * 0.3 + 0.1;
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
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    for (let i = 0; i < 150; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width / 2
      );
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.05)');
      gradient.addColorStop(1, 'rgba(139, 92, 246, 0.02)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      particles.forEach((particle, i) => {
        particles.slice(i + 1).forEach(otherParticle => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.save();
            ctx.globalAlpha = (100 - distance) / 100 * 0.1;
            ctx.strokeStyle = `hsl(260, 70%, 60%)`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
            ctx.restore();
          }
        });
      });

      drawNeuralNetwork(ctx, canvas);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Testimonial interval
    const testimonialInterval = setInterval(() => {
      // Animación de transición de testimonials
      gsap.to('.testimonial-content', {
        opacity: 0,
        y: -20,
        duration: 0.5,
        onComplete: () => {
          setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
          gsap.fromTo('.testimonial-content',
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5 }
          );
        }
      });
    }, 5000);

    return () => {
      clearInterval(testimonialInterval);
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  const drawNeuralNetwork = (ctx, canvas) => {
    const layers = 5;
    const neuronsPerLayer = 8;
    const layerWidth = canvas.width / (layers + 1);

    for (let layer = 1; layer <= layers; layer++) {
      const x = layer * layerWidth;

      for (let neuron = 0; neuron < neuronsPerLayer; neuron++) {
        const y = (neuron + 1) * (canvas.height / (neuronsPerLayer + 1));

        ctx.save();
        const pulse = Math.sin(Date.now() * 0.002 + layer * 0.5 + neuron * 0.2) * 0.3 + 0.7;
        ctx.globalAlpha = 0.1 * pulse;
        ctx.fillStyle = `hsl(${260 + layer * 10}, 70%, 60%)`;
        ctx.beginPath();
        ctx.arc(x, y, 3 * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (layer < layers) {
          const nextX = (layer + 1) * layerWidth;
          for (let nextNeuron = 0; nextNeuron < neuronsPerLayer; nextNeuron++) {
            const nextY = (nextNeuron + 1) * (canvas.height / (neuronsPerLayer + 1));

            ctx.save();
            const connectionAlpha = 0.05 * Math.random();
            ctx.globalAlpha = connectionAlpha;
            ctx.strokeStyle = `hsl(260, 70%, 60%)`;
            ctx.lineWidth = 0.3;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(nextX, nextY);
            ctx.stroke();
            ctx.restore();
          }
        }
      }
    }
  };

  const testimonials = [
    {
      name: "María González",
      role: "Estudiante de Educación",
      text: "Esta plataforma ha revolucionado mi forma de aprender señas. La IA es increíblemente precisa.",
      avatar: User
    },
    {
      name: "Carlos Rodríguez",
      role: "Padre de familia",
      text: "Mi hijo con discapacidad auditiva ahora puede practicar desde casa. ¡Gracias!",
      avatar: Users
    },
    {
      name: "Ana Martínez",
      role: "Intérprete profesional",
      text: "Como profesional, valoro la precisión y el enfoque educativo de la plataforma.",
      avatar: Briefcase
    }
  ];

  const features = [
    { icon: Zap, title: "Tiempo Real", desc: "Detección instantánea con IA", color: "text-yellow-500" },
    { icon: Target, title: "Alta Precisión", desc: "Más del 95% de exactitud", color: "text-green-500" },
    { icon: Award, title: "Certificados", desc: "Diplomas al completar módulos", color: "text-blue-500" },
    { icon: Clock, title: "Flexible", desc: "Aprende a tu propio ritmo", color: "text-purple-500" },
    { icon: TrendingUp, title: "Progreso", desc: "Seguimiento detallado", color: "text-orange-500" },
    { icon: Users2, title: "Comunidad", desc: "+10,000 usuarios activos", color: "text-pink-500" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex flex-col relative overflow-hidden">
      {/* Canvas Background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0 pointer-events-none"
      />

      {/* Floating Elements Mejorados */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Partículas que siguen el cursor */}
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={`cursor-particle absolute w-2 h-2 bg-blue-400 rounded-full opacity-30 filter blur-sm floating-element`}
            style={{
              left: `${20 + i * 10}%`,
              top: `${20 + i * 10}%`,
            }}
          />
        ))}

        {/* Elementos flotantes animados */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="floating-element absolute rounded-full opacity-20"
            style={{
              width: `${100 + Math.random() * 200}px`,
              height: `${100 + Math.random() * 200}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              background: `radial-gradient(circle, 
                hsl(${200 + i * 20}, 70%, 60%) 0%, 
                transparent 70%)`,
              animationDelay: `${i * 2}s`,
              filter: 'blur(40px)'
            }}
          />
        ))}

        {/* Hand Signs Floating Mejorado */}
        {[Hand, HandMetal, ThumbsUp, MousePointer2, Star, Zap, Sparkles, HeartHandshake].map((Icon, i) => (
          <div
            key={i}
            className="floating-element absolute opacity-10"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 3}s`,
            }}
          >
            <Icon size={64} className="text-white" />
          </div>
        ))}
      </div>

      {/* Header con animación Mejorado */}
      {/* Header con animación Mejorado y Responsive */}
      <header
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-500 border-b ${isScrolled || isMenuOpen
          ? 'py-3 px-4 sm:px-8 bg-slate-900/95 backdrop-blur-2xl border-white/10 shadow-2xl'
          : 'py-5 px-4 sm:px-8 bg-transparent border-transparent'
          } flex justify-between items-center`}
      >
        <div className="flex items-center gap-2 sm:gap-3 z-50">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-lg opacity-75 animate-pulse"></div>
            <GraduationCap size={32} className="text-white relative z-10 sm:size-[42px]" />
          </div>
          <span className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent truncate max-w-[180px] sm:max-w-none">
            Señas IA
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex gap-8 items-center">
          {['Inicio', 'Módulos', 'Características', 'Testimonios', 'Contacto'].map((item) => (
            <button
              key={item}
              className="text-white/70 font-semibold hover:text-white transition-all duration-300 hover:scale-105"
              onClick={() => {
                const element = document.getElementById(item.toLowerCase());
                if (item === 'Inicio') window.scrollTo({ top: 0, behavior: 'smooth' });
                else element?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {item}
            </button>
          ))}
          <button
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2.5 rounded-xl font-bold hover:scale-105 transition-all duration-300"
            onClick={() => navigate('/login')}
          >
            Comenzar Ahora
          </button>
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          className="lg:hidden z-50 p-2 text-white/80 hover:text-white transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={30} /> : <Menu size={30} />}
        </button>

        {/* Mobile Sidebar Overlay */}
        <div className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-500 lg:hidden ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`} onClick={() => setIsMenuOpen(false)} />

        {/* Mobile Sidebar */}
        <div className={`fixed top-0 right-0 h-screen w-[280px] bg-slate-900/90 backdrop-blur-3xl border-l border-white/10 z-40 transform transition-transform duration-500 ease-out lg:hidden ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}>
          <div className="flex flex-col p-8 pt-24 gap-6">
            {['Inicio', 'Módulos', 'Características', 'Testimonios', 'Contacto'].map((item) => (
              <button
                key={item}
                className="text-left text-2xl font-bold text-white/80 hover:text-white transition-colors"
                onClick={() => {
                  setIsMenuOpen(false);
                  const element = document.getElementById(item.toLowerCase());
                  if (item === 'Inicio') window.scrollTo({ top: 0, behavior: 'smooth' });
                  else setTimeout(() => element?.scrollIntoView({ behavior: 'smooth' }), 300);
                }}
              >
                {item}
              </button>
            ))}
            <div className="h-px bg-white/10 my-4" />
            <button
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl"
              onClick={() => {
                setIsMenuOpen(false);
                navigate('/login');
              }}
            >
              Comenzar Ahora
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section con animaciones GSAP - Padding-top añadido para compensar header fixed */}
      <section ref={heroRef} className="flex-1 flex flex-col justify-center items-center text-center px-4 pt-32 sm:pt-40 pb-20 relative z-10">
        <div className="max-w-5xl">
          {/* Badge animado */}
          <div className="hero-badge inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white px-6 py-3 rounded-full mb-8 border border-white/10 backdrop-blur-sm">
            <Zap size={20} className="text-yellow-400 animate-pulse" />
            <span className="font-semibold text-white">Plataforma con IA de Vanguardia</span>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
          </div>

          {/* Título principal */}
          <h1 className="hero-title text-4xl sm:text-6xl md:text-7xl font-black text-white mb-6 leading-tight drop-shadow-2xl px-4">
            Revoluciona tu{' '}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Aprendizaje
            </span>{' '}
            con IA
          </h1>

          <p className="hero-description text-lg sm:text-xl text-white/80 mb-10 leading-relaxed max-w-3xl mx-auto px-6">
            La primera plataforma que combina <strong>inteligencia artificial avanzada</strong> con
            <strong> metodologías pedagógicas innovadoras</strong> para enseñarte lengua de señas de manera
            interactiva, personalizada y efectiva.
          </p>

          {/* Botones CTA */}
          <div className="hero-buttons flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 px-4">
            <button
              className="w-full sm:w-auto group relative bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 sm:px-12 py-4 sm:py-5 rounded-2xl font-bold text-lg shadow-2xl hover:scale-105 transition-all duration-500 overflow-hidden"
              onClick={() => navigate('/login')}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <span className="flex items-center gap-3 relative z-10">
                <Play size={24} className="group-hover:scale-110 transition-transform" />
                Comenzar Gratis Hoy
              </span>
            </button>

          </div>

          {/* Stats Grid */}
          <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {[
              { number: "10K+", label: "Usuarios Activos", icon: Users },
              { number: "95%", label: "Precisión IA", icon: Target },
              { number: "50+", label: "Módulos", icon: Library },
              { number: "24/7", label: "Soporte", icon: ShieldCheck }
            ].map((stat, index) => (
              <div key={index} className="stat-item text-center">
                <div className="mb-4 flex justify-center floating-element">
                  <stat.icon size={48} className="text-blue-400" />
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  {stat.number}
                </div>
                <div className="text-white/60 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section con animaciones ScrollTrigger */}
      <section ref={featuresRef} id="características" className="w-full max-w-7xl mx-auto px-4 mb-28 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-6">Tecnología de Punta</h2>
          <p className="text-xl text-white/60 max-w-3xl mx-auto">
            Integramos las últimas innovaciones en IA y aprendizaje automático para ofrecerte
            la experiencia educativa más avanzada del mercado
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="feature-card group relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-white/20 shadow-2xl hover:scale-105 transition-all duration-500"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10">
                <div className={`p-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 w-fit mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon size={40} className={feature.color} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-white/70 leading-relaxed">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modules Section con animación cascada */}
      <section ref={modulesRef} id="módulos" className="w-full max-w-7xl mx-auto px-4 mb-28 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-6 flex items-center justify-center gap-4">
            <BookOpen size={48} className="text-blue-400 floating-element" />
            Módulos Interactivos
          </h2>
          <p className="text-xl text-white/60">Domina el lenguaje de señas a través de nuestra curriculum progresivo</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { title: "Fundamentos", icon: Shield, level: "Básico", lessons: 15, color: "from-green-500 to-blue-500" },
            { title: "Vocales & Números", icon: Hash, level: "Básico", lessons: 12, color: "from-blue-500 to-purple-500" },
            { title: "Abecedario Completo", icon: Book, level: "Intermedio", lessons: 20, color: "from-purple-500 to-pink-500" },
            { title: "Vocabulario Esencial", icon: MessageSquare, level: "Intermedio", lessons: 25, color: "from-pink-500 to-red-500" },
            { title: "Expresiones Diarias", icon: Mic, level: "Avanzado", lessons: 18, color: "from-red-500 to-orange-500" },
            { title: "Conversación Fluida", icon: Users2, level: "Avanzado", lessons: 22, color: "from-orange-500 to-yellow-500" }
          ].map((module, index) => (
            <div
              key={index}
              className="module-card group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-white/20 shadow-2xl hover:scale-105 transition-all duration-500 cursor-pointer overflow-hidden"
            >
              <div className="absolute top-4 right-4 bg-white/10 px-3 py-1 rounded-full text-xs text-white/80">
                {module.level}
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-2xl bg-white/5 floating-element">
                  <module.icon size={36} className="text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">{module.title}</h3>
              </div>

              <p className="text-white/60 mb-6">Aprende a través de ejercicios interactivos con feedback en tiempo real</p>

              <div className="flex items-center justify-between">
                <span className="text-white/50 text-sm">{module.lessons} lecciones</span>

              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section con transición suave */}
      <section ref={testimonialsRef} id="testimonios" className="w-full max-w-5xl mx-auto px-4 mb-28 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-6">Historias de Éxito</h2>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 sm:p-12 border border-white/10 shadow-2xl">
          <div className="text-center mb-8 testimonial-content">
            <div className="flex justify-center mb-6 floating-element">
              {React.createElement(testimonials[currentTestimonial].avatar, { size: 60, className: "text-blue-400 sm:size-80" })}
            </div>
            <p className="text-lg sm:text-2xl text-white/90 italic mb-6 leading-relaxed">
              "{testimonials[currentTestimonial].text}"
            </p>
            <div className="font-bold text-white text-lg sm:text-xl">{testimonials[currentTestimonial].name}</div>
            <div className="text-blue-400 text-sm sm:text-base">{testimonials[currentTestimonial].role}</div>
          </div>

          <div className="flex justify-center gap-3">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`w-4 h-4 rounded-full transition-all duration-300 ${index === currentTestimonial ? 'bg-blue-500 scale-125' : 'bg-white/30'
                  }`}
                onClick={() => {
                  gsap.to('.testimonial-content', {
                    opacity: 0,
                    y: -20,
                    duration: 0.3,
                    onComplete: () => {
                      setCurrentTestimonial(index);
                      gsap.fromTo('.testimonial-content',
                        { opacity: 0, y: 20 },
                        { opacity: 1, y: 0, duration: 0.3 }
                      );
                    }
                  });
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA con animación 3D */}
      <section ref={ctaRef} className="w-full max-w-5xl mx-auto px-4 mb-28 relative z-10">
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl p-8 sm:p-16 text-center text-white border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_70%)]"></div>
          <h2 className="text-3xl sm:text-5xl font-bold mb-6 relative z-10">¿Listo para el Cambio?</h2>
          <p className="text-lg sm:text-xl mb-10 opacity-90 relative z-10 px-4">
            Únete a la revolución del aprendizaje de lengua de señas con IA
          </p>
          <button
            className="w-full sm:w-auto bg-gradient-to-r from-white to-blue-200 text-blue-900 px-8 sm:px-16 py-4 sm:py-5 rounded-2xl font-bold text-lg shadow-2xl hover:scale-105 hover:shadow-glow transition-all duration-500 relative z-10"
            onClick={() => navigate('/register')}
          >
            Crear Cuenta Gratis
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-gradient-to-b from-transparent to-black/50 relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <GraduationCap size={36} className="text-blue-400 floating-element" />
                <span className="text-2xl font-bold text-white">Señas IA</span>
              </div>
              <p className="text-white/60 leading-relaxed">
                Liderando la revolución en educación de lengua de señas mediante inteligencia artificial avanzada.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-white text-lg mb-6">Navegación</h3>
              <ul className="space-y-3 text-white/60">
                {['Inicio', 'Módulos', 'Características', 'Precios', 'Blog'].map((item) => (
                  <li key={item}><a href="#" className="hover:text-white transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-white text-lg mb-6">Contacto</h3>
              <ul className="space-y-3 text-white/60">
                <li className="flex items-center gap-3"><Mail size={18} /> hola@señasia.com</li>
                <li className="flex items-center gap-3"><Phone size={18} /> +1 (555) 123-4567</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-white text-lg mb-6">Síguenos</h3>
              <div className="flex gap-4">
                {[Facebook, Instagram, Twitter, Youtube].map((Icon, index) => (
                  <a key={index} href="#" className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
                    <Icon size={24} className="text-white" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 text-center text-white/40">
            <p>© 2024 Instituto de Lengua de Señas IA. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Custom CSS Animations */}
      <style jsx>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          33% { transform: translateY(-30px) rotate(120deg) scale(1.1); }
          66% { transform: translateY(20px) rotate(240deg) scale(0.9); }
        }
        
        @keyframes drop {
          0% { transform: translateY(-100px) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
        
        .animate-float-slow {
          animation: float-slow 20s ease-in-out infinite;
        }
        
        .animate-drop {
          animation: drop linear infinite;
        }
        
        .drop-shadow-glow {
          filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.5));
        }
        
        .shadow-glow {
          box-shadow: 0 0 50px rgba(59, 130, 246, 0.5);
        }
      `}</style>
    </div>
  );
};

export default Landing;