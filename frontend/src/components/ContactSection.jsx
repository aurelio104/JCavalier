import React from 'react';
import { MessageCircle, Instagram } from 'lucide-react';
import { FaTiktok } from 'react-icons/fa';

const ContactSection = () => {
  return (
    <section className="bg-black text-white py-10 px-4">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:min-h-[250px]">
        
        {/* Contenedor izquierdo */}
        <div className="flex-1 flex items-center justify-center text-center mb-6 md:mb-0">
          <div className="space-y-3 max-w-xs">
            <h2 className="text-2xl font-heading uppercase tracking-widest">Contáctanos</h2>
            <p className="text-sm leading-relaxed">
              Para atención personalizada, colaboraciones o distribución exclusiva, estamos disponibles.
            </p>
            <p className="text-xs opacity-60">Maracay, Venezuela</p>
            <p className="text-xs opacity-60">+58 412-896-6414</p>
          </div>
        </div>

        {/* Línea blanca solo visible en pantallas medianas+ */}
        <div className="hidden md:block w-[1px] bg-white mx-5" />

        {/* Contenedor derecho con botones */}
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <a
            href="https://wa.me/584128966414"
            target="_blank"
            rel="noopener noreferrer"
            className="w-40 flex items-center justify-center gap-2 py-2 text-xs border border-white rounded-full hover:bg-white hover:text-black transition text-center"
          >
            <MessageCircle size={14} />
            WhatsApp
          </a>

          <a
            href="https://instagram.com/jcavalier_"
            target="_blank"
            rel="noopener noreferrer"
            className="w-40 flex items-center justify-center gap-2 py-2 text-xs border border-white rounded-full hover:bg-white hover:text-black transition text-center"
          >
            <Instagram size={14} />
            Instagram
          </a>

          <a
            href="https://tiktok.com/@jcavalier"
            target="_blank"
            rel="noopener noreferrer"
            className="w-40 flex items-center justify-center gap-2 py-2 text-xs border border-white rounded-full hover:bg-white hover:text-black transition text-center"
          >
            <FaTiktok size={14} />
            TikTok
          </a>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
