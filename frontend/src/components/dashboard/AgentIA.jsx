import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { MessageCircle, X, Mic, MicOff, Send, Bot } from 'lucide-react';

const AgentIA = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [botPosition, setBotPosition] = useState({ x: 50, y: 50 });
  const [isMobile, setIsMobile] = useState(false);
  const messagesEndRef = useRef(null);

  // Mensaje de bienvenida automático
  useEffect(() => {
    const welcomeMessage = {
      id: 1,
      text: "¡Hola! Soy tu asistente IA. ¿En qué puedo ayudarte hoy? Puedo explicarte los módulos, tu progreso o responder tus preguntas sobre lenguaje de señas. 😊",
      isBot: true,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, []);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Efecto para seguir el mouse (solo desktop)
  useEffect(() => {
    if (!isOpen || isMobile) return;

    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setBotPosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isOpen, isMobile]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    // Agregar mensaje del usuario
    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Simular respuesta del bot después de un delay
    setTimeout(() => {
      const botResponse = generateBotResponse(inputMessage);
      setMessages(prev => [...prev, botResponse]);

      // Text-to-speech para la respuesta del bot
      if ('speechSynthesis' in window) {
        const speech = new SpeechSynthesisUtterance(botResponse.text);
        speech.lang = 'es-ES';
        speech.rate = 0.9;
        window.speechSynthesis.speak(speech);
      }
    }, 1000);
  };

  const generateBotResponse = (userMessage) => {
    const message = userMessage.toLowerCase();

    if (message.includes('hola') || message.includes('hi')) {
      return {
        id: messages.length + 2,
        text: "¡Hola! ¿Cómo estás? ¿En qué módulo te gustaría practicar hoy? 🤗",
        isBot: true,
        timestamp: new Date()
      };
    } else if (message.includes('módulo') || message.includes('modulo')) {
      return {
        id: messages.length + 2,
        text: "Tenemos 6 módulos disponibles: Vocales, Palabras, Números, Signos Matemáticos, Abecedario y Operaciones. ¿Cuál te interesa? 📚",
        isBot: true,
        timestamp: new Date()
      };
    } else if (message.includes('progreso') || message.includes('avance')) {
      return {
        id: messages.length + 2,
        text: "¡Vas muy bien! Has completado 2 de 6 módulos con 89% de precisión promedio. ¡Sigue así! 🎯",
        isBot: true,
        timestamp: new Date()
      };
    } else if (message.includes('gracias') || message.includes('thanks')) {
      return {
        id: messages.length + 2,
        text: "¡De nada! Estoy aquí para ayudarte. ¿Necesitas algo más? 😊",
        isBot: true,
        timestamp: new Date()
      };
    } else {
      return {
        id: messages.length + 2,
        text: "¡Interesante pregunta! Puedo ayudarte con información sobre los módulos, tu progreso, o explicarte cómo funciona la tecnología de reconocimiento de señas. ¿Qué te gustaría saber? 🤔",
        isBot: true,
        timestamp: new Date()
      };
    }
  };

  const toggleListening = () => {
    setIsListening(!isListening);
    // Aquí integrarías Web Speech API para reconocimiento de voz
  };

  return (
    <>
      {/* Botón flotante del bot - En Portal */}
      {ReactDOM.createPortal(
        <button
          className={`fixed bottom-4 right-4 sm:bottom-auto sm:right-auto z-[100] transition-all duration-500 ease-out ${isOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
            }`}
          style={isMobile ? {} : {
            left: `${botPosition.x}%`,
            top: `${botPosition.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
          onClick={() => setIsOpen(true)}
        >
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 sm:p-4 rounded-full shadow-2xl hover:shadow-blue-500/25 transition-all hover:scale-110">
            <Bot className="text-white" size={20} />
          </div>
        </button>,
        document.body
      )}

      {/* Chat del bot - En Portal */}
      {isOpen && ReactDOM.createPortal(
        <div className="fixed bottom-0 left-0 right-0 sm:left-auto sm:right-6 sm:bottom-6 sm:w-96 w-full h-[85vh] sm:h-[500px] bg-[#0a0c10]/95 backdrop-blur-xl sm:rounded-3xl rounded-t-3xl border border-white/10 shadow-2xl z-[100] flex flex-col transition-all duration-300 ease-out transform translate-y-0">
          {/* Header del chat */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 sm:p-4 sm:rounded-t-3xl rounded-t-3xl text-white flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-white/20 p-1.5 sm:p-2 rounded-full">
                <Bot size={18} className="sm:w-5 sm:h-5" />
              </div>
              <div>
                <div className="font-semibold text-sm sm:text-base">Lexa IA</div>
                <div className="text-[10px] sm:text-xs opacity-80">ASISTENTE VIRTUAL</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Área de mensajes */}
          <div className="flex-1 p-3 sm:p-4 overflow-y-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-3 sm:mb-4 ${message.isBot ? 'text-left' : 'text-right'}`}
              >
                <div
                  className={`inline-block max-w-[85%] sm:max-w-xs p-2.5 sm:p-3 rounded-2xl text-sm sm:text-base ${message.isBot
                    ? 'bg-[#05070a] text-slate-200 border border-white/5 rounded-bl-none'
                    : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-br-none'
                    }`}
                >
                  {message.text}
                </div>
                <div className={`text-[10px] sm:text-xs text-white/40 mt-1 ${message.isBot ? 'text-left' : 'text-right'}`}>
                  {message.timestamp.toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input de mensaje */}
          <div className="p-3 sm:p-4 border-t border-white/20">
            <div className="flex gap-2">
              <button
                onClick={toggleListening}
                className={`p-2 rounded-xl transition-colors ${isListening
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
              >
                {isListening ? <MicOff size={16} className="sm:w-[18px] sm:h-[18px]" /> : <Mic size={16} className="sm:w-[18px] sm:h-[18px]" />}
              </button>
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Escribe tu mensaje..."
                className="flex-1 bg-[#05070a] text-white border border-white/10 rounded-xl px-3 sm:px-4 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
              >
                <Send size={16} className="sm:w-[18px] sm:h-[18px]" />
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default AgentIA;