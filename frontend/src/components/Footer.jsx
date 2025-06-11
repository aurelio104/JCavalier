import React from 'react';
import { Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-black text-white pt-12 pb-6 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 border-b border-gray-800 pb-8">
        
        {/* Marca */}
        <div>
          <h2 className="text-lg font-heading uppercase tracking-widest mb-3">
            JCavalier
          </h2>
          <p className="text-sm text-white/70 leading-relaxed">
            Ropa masculina con elegancia atemporal, inspirada en legado, sobriedad y distinción.
          </p>
        </div>

        {/* Navegación */}
        <nav aria-label="Navegación principal">
          <h3 className="text-xs uppercase font-semibold tracking-wide mb-3">
            Navegación
          </h3>
          <ul className="space-y-2 text-sm text-white/70">
            <li><a href="#inicio" className="hover:text-white transition">Inicio</a></li>
            <li><a href="#tulio-catalogo" className="hover:text-white transition">Colección</a></li>
            <li><a href="#nosotros" className="hover:text-white transition">Nosotros</a></li>
            <li><a href="#contacto" className="hover:text-white transition">Contacto</a></li>
          </ul>
        </nav>
      </div>

      {/* Copyright */}
      <div className="mt-6 text-center text-xs text-white/50 px-2">
        &copy; {new Date().getFullYear()} JCavalier. Todos los derechos reservados.
      </div>
    </footer>
  );
};

export default Footer;
