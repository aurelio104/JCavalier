import React from 'react';
import { motion } from 'framer-motion';

const DashboardProductos = () => {
  return (
    <section
      className="relative min-h-screen w-full flex items-center justify-center text-center overflow-hidden px-4 py-20"
      style={{
        backgroundImage: "url('/hero-jcavalier.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Fondo y efecto cristal */}
      <motion.div
        className="absolute inset-0 bg-black z-0"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 1.4, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute inset-0 z-10 backdrop-blur-xl bg-white bg-opacity-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        transition={{ duration: 1.8, delay: 0.6, ease: 'easeOut' }}
      />

      {/* Contenido principal */}
      <motion.div
        className="relative z-20 text-white flex flex-col items-center w-full max-w-4xl"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.25 } } }}
      >
        <motion.img
          src="/LogoB.png"
          alt="Logo JCavalier"
          className="w-20 h-20 mb-6 object-contain"
          initial={{ scale: 0 }}
          animate={{ scale: 2, y: -20 }}
          transition={{ duration: 1.5, delay: 0.5, ease: 'easeInOut' }}
        />

        <motion.h2
          className="text-3xl font-heading uppercase tracking-wider mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 1.3 }}
        >
          Gestión de Catálogo
        </motion.h2>

        <motion.div
          className="bg-white/10 backdrop-blur-md rounded-xl p-8 w-full text-left text-white space-y-6 shadow-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 1.6 }}
        >
          <p className="text-base md:text-lg">
            Aquí podrás administrar todas las colecciones y productos de JCavalier. Próximamente:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-white/80">
            <li>Agregar nuevos productos a una colección</li>
            <li>Editar productos existentes</li>
            <li>Eliminar productos obsoletos</li>
            <li>Visualizar inventario por categoría</li>
          </ul>
        </motion.div>

        <a
          href="/admin/dashboard"
          className="mt-10 text-sm text-white/70 hover:text-white underline"
        >
          ← Volver al panel
        </a>
      </motion.div>
    </section>
  );
};

export default DashboardProductos;
