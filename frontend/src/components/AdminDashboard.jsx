import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { logout } from '../utils/auth';

const AdminDashboard = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [canInstall, setCanInstall] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.finally(() => {
        setDeferredPrompt(null);
      });
    }
  };

  const handleCatalogManage = () => {
    navigate('/admin/productos');
  };

  const handleLogoutAndReturn = () => {
    logout();
    navigate('/');
  };

  return (
    <section
      className="relative h-screen w-full flex items-center justify-center text-center overflow-hidden"
      style={{
        backgroundImage: "url('/hero-jcavalier.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Botón instalación */}
      {canInstall && (
        <motion.div
          className="absolute top-24 right-6 z-30"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 1, ease: 'easeOut' }}
        >
          <button onClick={handleInstall} className="hover:opacity-80 transition">
            <img src="/googleplay-badge.svg" alt="Google Play" className="h-11" />
          </button>
        </motion.div>
      )}

      {/* Fondo oscuro */}
      <motion.div
        className="absolute inset-0 bg-black z-0"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 1.4 }}
      />

      {/* Capa cristal */}
      <motion.div
        className="absolute inset-0 z-10 backdrop-blur-xl bg-white bg-opacity-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        transition={{ duration: 1.8, delay: 0.6 }}
      />

      {/* Contenido */}
      <motion.div
        className="relative z-20 px-6 text-white flex flex-col items-center space-y-10"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.25 } } }}
      >
        <motion.img
          src="/LogoB.png"
          alt="Logo JCavalier"
          className="w-28 h-28 object-contain"
          initial={{ scale: 0 }}
          animate={{ scale: 3, y: -45 }}
          transition={{ duration: 2, delay: 1 }}
        />

        <motion.p
          className="text-lg md:text-xl text-white/90 tracking-wide"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 1.3 }}
        >
          Bienvenido al Panel Administrativo JCavalier
        </motion.p>

        <motion.div
          className="flex flex-col space-y-4 mt-4 items-center"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 1.6 }}
        >
          <button
            onClick={handleCatalogManage}
            className="w-48 py-4 border border-white text-white text-lg uppercase tracking-wider hover:bg-white hover:text-black transition rounded-full shadow-md backdrop-blur-sm text-center"
          >
            Gestionar Catálogo
          </button>

          <button
            onClick={handleLogoutAndReturn}
            className="w-48 py-4 border border-white text-white text-lg uppercase tracking-wider hover:bg-white hover:text-black transition rounded-full shadow-md backdrop-blur-sm text-center"
          >
            Cerrar sesión
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default AdminDashboard;
