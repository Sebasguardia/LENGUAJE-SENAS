import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Mic, MicOff, Send, Bot } from 'lucide-react';

const AgentIA = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [botPosition, setBotPosition] = useState({ x: 50, y: 50 });
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

  // Efecto para seguir el mouse
  useEffect(() => {
    if (!isOpen) return;

    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setBotPosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isOpen]);

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
      {/* Botón flotante del bot */}
      <button
        className={`fixed z-50 transition-all duration-500 ease-out ${
          isOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
        }`}
        style={{
          left: `${botPosition.x}%`,
          top: `${botPosition.y}%`,
          transform: 'translate(-50%, -50%)'
        }}
        onClick={() => setIsOpen(true)}
      >
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-full shadow-2xl hover:shadow-blue-500/25 transition-all hover:scale-110">
          <Bot className="text-white" size={28} />
        </div>
      </button>

      {/* Chat del bot */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-96 bg-white/95 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl z-50 flex flex-col">
          {/* Header del chat */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-t-3xl text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                <Bot size={20} />
              </div>
              <div>
                <div className="font-semibold">Asistente IA</div>
                <div className="text-xs opacity-80">En línea • Listo para ayudar</div>
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
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-4 ${message.isBot ? 'text-left' : 'text-right'}`}
              >
                <div
                  className={`inline-block max-w-xs p-3 rounded-2xl ${
                    message.isBot
                      ? 'bg-blue-50 text-gray-800 rounded-bl-none'
                      : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-br-none'
                  }`}
                >
                  {message.text}
                </div>
                <div className={`text-xs text-gray-500 mt-1 ${message.isBot ? 'text-left' : 'text-right'}`}>
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
          <div className="p-4 border-t border-white/20">
            <div className="flex gap-2">
              <button
                onClick={toggleListening}
                className={`p-2 rounded-xl transition-colors ${
                  isListening 
                    ? 'bg-red-100 text-red-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Escribe tu mensaje..."
                className="flex-1 bg-gray-100 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AgentIA;