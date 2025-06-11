import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const HeroLanding = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

// Efecto para hacer el scroll después de que todo haya cargado
useEffect(() => {
  const handleLoad = () => {
    setTimeout(() => {
      const start = window.scrollY; // Posición actual
      const end = 100; // Destino (100px desde la parte superior)
      const duration = 1000; // Duración en milisegundos (1 segundo)

      const startTime = performance.now();

      const animateScroll = (currentTime) => {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1); // Asegura que no sobrepase el 100%

        window.scrollTo(0, start + (end - start) * progress);

        if (progress < 1) {
          requestAnimationFrame(animateScroll); // Continuar animando hasta que se complete
        }
      };

      requestAnimationFrame(animateScroll); // Iniciar la animación
    }, 3500); // Ajusta el tiempo si es necesario
  };

  handleLoad();
}, []);

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.finally(() => {
        setDeferredPrompt(null);
      });
    }
  };

  return (
    <section
      className="relative h-screen w-full flex items-center justify-center text-center overflow-hidden select-none"
      style={{
        backgroundImage: "url('/hero-jcavalier.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundRepeat: 'no-repeat',
        zIndex: 1, // Aseguramos que HeroLanding esté debajo del CatalogView
      }}
    >
      {/* Botones de instalación */}
      <motion.div
        className="absolute top-24 right-6 z-30 flex flex-col space-y-3 items-end"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.4, delay: 1, ease: 'easeOut' }}
      >
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            alert(
              'En iOS:\n1. Abre en Safari\n2. Toca el botón compartir\n3. Selecciona "Agregar a pantalla de inicio"'
            );
          }}
          aria-label="Instalar desde App Store"
          className="hover:opacity-80 transition select-none"
        >
          <img src="/appstore-badge.svg" alt="Disponible en App Store" className="h-11" />
        </a>

        {canInstall && (
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handleInstall();
            }}
            aria-label="Instalar desde Google Play"
            className="hover:opacity-80 transition select-none"
          >
            <img src="/googleplay-badge.svg" alt="Disponible en Google Play" className="h-11" />
          </a>
        )}
      </motion.div>

      {/* Capa oscura */}
      <motion.div
        className="absolute inset-0 bg-black z-0"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 1.4, ease: 'easeInOut' }}
      />

      {/* Capa tipo cristal */}
      <motion.div
        className="absolute inset-0 z-10 backdrop-blur-xl bg-white bg-opacity-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        transition={{ duration: 1.8, delay: 0.6, ease: 'easeOut' }}
      />

      {/* Contenido principal */}
      <motion.div
        className="relative z-20 px-6 text-white flex flex-col items-center space-y-10"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.25 } } }}
      >
        {/* Logo */}
        <motion.img
          src="/LogoB.png"
          alt="Logo JCavalier"
          className="w-28 h-28 object-contain"
          initial={{ scale: 0 }}
          animate={{ scale: 3, y: -45 }}
          transition={{ duration: 2, delay: 1, ease: 'easeInOut' }}
        />

        {/* Subtítulo */}
        <motion.p
          className="text-lg md:text-xl text-white/90 tracking-wide font-heading"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 1.3, ease: 'easeOut' }}
        >
          La ropa que refleja tu legado y carácter
        </motion.p>

        {/* Enlaces sociales */}
        <motion.div
          className="flex flex-col space-y-4 mt-4 items-center"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 1.6, ease: 'easeOut' }}
        >
          <a
            href="https://wa.me/584128966414"
            className="w-48 py-4 border border-white text-white text-lg uppercase tracking-wider hover:bg-white hover:text-black transition rounded-full shadow-md backdrop-blur-sm text-center"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
          </a>
          <a
            href="https://instagram.com/jcavalier_"
            className="w-48 py-4 border border-white text-white text-lg uppercase tracking-wider hover:bg-white hover:text-black transition rounded-full shadow-md backdrop-blur-sm text-center"
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroLanding;
