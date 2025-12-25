import React from 'react';
import { 
  Heart, Coffee, Github, Mail, Phone, 
  MessageCircle, BrainCircuit, Zap 
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-16 bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-8">
      <div className="grid md:grid-cols-4 gap-8 mb-8">
        {/* Información del instituto */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
              <BrainCircuit className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
              Instituto Señas IA
            </h3>
          </div>
          <p className="text-gray-700 mb-4 leading-relaxed">
            Revolucionando la educación en lengua de señas mediante inteligencia artificial avanzada. 
            Nuestra plataforma combina tecnología de punta con metodologías pedagógicas innovadoras.
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-yellow-500" />
              <span>IA en tiempo real</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle size={16} className="text-blue-500" />
              <span>Feedback de voz</span>
            </div>
          </div>
        </div>

        {/* Enlaces rápidos */}
        <div>
          <h4 className="font-bold text-gray-900 mb-4">Enlaces Rápidos</h4>
          <ul className="space-y-2 text-gray-700">
            <li><button className="hover:text-blue-600 transition-colors">Módulos de aprendizaje</button></li>
            <li><button className="hover:text-blue-600 transition-colors">Mi progreso</button></li>
            <li><button className="hover:text-blue-600 transition-colors">Configuración</button></li>
            <li><button className="hover:text-blue-600 transition-colors">Centro de ayuda</button></li>
          </ul>
        </div>

        {/* Contacto */}
        <div>
          <h4 className="font-bold text-gray-900 mb-4">Contacto</h4>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-center gap-3">
              <Mail size={16} className="text-blue-600" />
              <span>hola@señasia.edu</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone size={16} className="text-green-600" />
              <span>+51 999 888 777</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Línea inferior */}
      <div className="border-t border-white/20 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 text-gray-600 text-sm">
          <span>© {currentYear} Instituto de Lengua de Señas IA. Todos los derechos reservados.</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <span>Hecho con</span>
            <Heart size={16} className="text-red-500 animate-pulse" />
            <span>y mucho</span>
            <Coffee size={16} className="text-brown-500" />
          </div>
          
          <button className="p-2 bg-white/50 rounded-xl border border-white/20 hover:bg-white/80 transition-all">
            <Github size={16} className="text-gray-700" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;