import React, { useState, useEffect, useRef } from 'react';

const RobotAgent = ({ mousePosition }) => {
  const [eyePosition, setEyePosition] = useState({ left: 0, right: 0 });
  const [isTalking, setIsTalking] = useState(false);
  const robotRef = useRef(null);

  // Seguimiento ocular mejorado
  useEffect(() => {
    if (!robotRef.current) return;

    const robotRect = robotRef.current.getBoundingClientRect();
    const robotCenterX = robotRect.left + robotRect.width / 2;
    const robotCenterY = robotRect.top + robotRect.height / 2;

    // Calcular dirección del mouse relativa al robot
    const deltaX = mousePosition.x - robotCenterX;
    const deltaY = mousePosition.y - robotCenterY;

    // Limitar el movimiento de los ojos (más sensible)
    const maxMovement = 3; // Pixeles máximos que se pueden mover los ojos
    const leftEyeX = Math.max(Math.min(deltaX * 0.02, maxMovement), -maxMovement);
    const leftEyeY = Math.max(Math.min(deltaY * 0.02, maxMovement / 2), -maxMovement / 2);
    const rightEyeX = Math.max(Math.min(deltaX * 0.02, maxMovement), -maxMovement);
    const rightEyeY = Math.max(Math.min(deltaY * 0.02, maxMovement / 2), -maxMovement / 2);

    setEyePosition({
      left: { x: leftEyeX, y: leftEyeY },
      right: { x: rightEyeX, y: rightEyeY }
    });

  }, [mousePosition]);

  // Animación de hablar
  useEffect(() => {
    const talkInterval = setInterval(() => {
      setIsTalking(true);
      setTimeout(() => setIsTalking(false), 500);
    }, 3000);

    return () => clearInterval(talkInterval);
  }, []);

  // Función para hacer hablar al robot
  const speak = (message) => {
    if ('speechSynthesis' in window) {
      const speech = new SpeechSynthesisUtterance(message);
      speech.lang = 'es-ES';
      speech.rate = 0.9;
      speech.volume = 0.8;
      window.speechSynthesis.speak(speech);
    }
  };

  return (
    <div className="relative inline-block" ref={robotRef}>
      {/* Robot principal */}
      <div className="relative">
        {/* Cabeza del robot */}
        <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 w-32 h-32 rounded-2xl shadow-2xl border-4 border-white/20">
          
          {/* Antena con luz intermitente */}
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
            <div className="w-4 h-6 bg-gradient-to-r from-blue-400 to-purple-400 rounded-t-full"></div>
            <div className="w-2 h-2 bg-yellow-400 rounded-full mx-auto mt-1 animate-pulse"></div>
          </div>

          {/* Ojos que siguen el mouse - CORREGIDO */}
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 flex gap-8">
            {/* Ojo izquierdo */}
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 bg-white rounded-full shadow-inner">
                <div 
                  className="absolute top-1/2 left-1/2 w-4 h-4 bg-blue-900 rounded-full transition-all duration-200"
                  style={{
                    transform: `translate(calc(-50% + ${eyePosition.left.x}px), calc(-50% + ${eyePosition.left.y}px))`
                  }}
                />
              </div>
            </div>
            
            {/* Ojo derecho */}
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 bg-white rounded-full shadow-inner">
                <div 
                  className="absolute top-1/2 left-1/2 w-4 h-4 bg-blue-900 rounded-full transition-all duration-200"
                  style={{
                    transform: `translate(calc(-50% + ${eyePosition.right.x}px), calc(-50% + ${eyePosition.right.y}px))`
                  }}
                />
              </div>
            </div>
          </div>

          {/* Boca animada - CORREGIDA */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
            <div className={`w-16 h-2 bg-white rounded-full transition-all duration-300 overflow-hidden ${
              isTalking ? 'h-3' : 'h-2'
            }`}>
              <div className={`w-full h-full bg-gray-700 transition-all duration-300 ${
                isTalking ? 'translate-y-0' : 'translate-y-full'
              }`}></div>
            </div>
          </div>

          {/* Mejillas */}
          <div className="absolute bottom-8 left-4 w-3 h-3 bg-pink-400/30 rounded-full"></div>
          <div className="absolute bottom-8 right-4 w-3 h-3 bg-pink-400/30 rounded-full"></div>
        </div>

        {/* Cuerpo del robot */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -translate-y-1">
          <div className="w-28 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-b-2xl border-4 border-t-0 border-white/20 shadow-lg"></div>
        </div>
      </div>

      {/* Efecto de glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur-xl opacity-20 animate-pulse"></div>

      {/* Botón para hacer hablar al robot */}
      <button 
        onClick={() => speak("¡Hola! Soy RoboSeñas, tu asistente de aprendizaje. Estoy aquí para ayudarte a dominar el lenguaje de señas. ¿Por qué módulo quieres empezar hoy?")}
        className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 z-10"
      >
        👋 Hazme hablar
      </button>

      {/* Mensaje flotante */}
      <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-md rounded-2xl p-3 border border-white/20 shadow-2xl max-w-xs">
        <p className="text-white text-sm text-center">¡Te estoy mirando! 👀</p>
      </div>

      {/* Partículas alrededor */}
      <div className="absolute -top-4 -left-4 w-3 h-3 bg-yellow-400 rounded-full animate-bounce"></div>
      <div className="absolute -top-4 -right-4 w-3 h-3 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
      <div className="absolute -bottom-4 -left-4 w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
      <div className="absolute -bottom-4 -right-4 w-3 h-3 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '1.5s'}}></div>
    </div>
  );
};

export default RobotAgent;