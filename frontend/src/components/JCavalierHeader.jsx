import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const JCavalierHeader = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    const section = document.querySelector(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        hasScrolled
          ? 'bg-white bg-opacity-90 shadow backdrop-blur border-b border-gray-200'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <div
          onClick={() => scrollTo('#inicio')}
          className="text-xl font-heading tracking-widest uppercase text-gray-900 cursor-pointer"
        >
          JCavalier
        </div>

        {/* Navegación en escritorio */}
        <nav className="hidden md:flex items-center space-x-6" role="navigation" aria-label="Menú principal">
          {[
            { label: 'Inicio', id: '#inicio' },
            { label: 'Colección', id: '#tulio-catalogo' },
            { label: 'Nosotros', id: '#nosotros' },
            { label: 'Contacto', id: '#contacto' }
          ].map(({ label, id }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="text-xs uppercase tracking-widest text-gray-700 hover:text-black transition"
            >
              {label}
            </button>
          ))}
          <a
            href="/admin"
            className="ml-4 px-3 py-1.5 text-xs text-white uppercase tracking-wide border border-white rounded-full hover:bg-white hover:text-black transition shadow backdrop-blur-sm"
          >
            Admin
          </a>
        </nav>

        {/* Botón del menú móvil */}
        <button
          className="md:hidden text-gray-700"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Abrir menú"
          aria-expanded={isMobileMenuOpen}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
            />
          </svg>
        </button>
      </div>

      {/* Menú móvil desplegable */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="md:hidden bg-white border-t border-gray-200 overflow-hidden"
          >
            <div className="flex flex-col space-y-4 px-6 py-4">
              {[
                { label: 'Inicio', id: '#inicio' },
                { label: 'Colección', id: '#tulio-catalogo' },
                { label: 'Nosotros', id: '#nosotros' },
                { label: 'Contacto', id: '#contacto' }
              ].map(({ label, id }) => (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  className="text-sm uppercase tracking-widest text-gray-800 hover:text-black transition"
                >
                  {label}
                </button>
              ))}
              <a
                href="/admin"
                className="text-white text-sm uppercase tracking-widest border border-white px-4 py-2 rounded-full bg-black bg-opacity-70 hover:bg-white hover:text-black transition text-center backdrop-blur-sm"
              >
                Admin
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default JCavalierHeader;
