import React from 'react';
import { motion } from 'framer-motion';

// Función para animar texto letra por letra
const splitTextToSpans = (text) => {
  return text.split('').map((char, index) => (
    <motion.span
      key={index}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="inline-block"
    >
      {char}
    </motion.span>
  ));
};

const AboutSection = () => {
  return (
    <motion.section
      id="nosotros"
      className="relative bg-black text-white py-24 px-6 overflow-hidden"
      style={{
        backgroundImage: "url('/about-bg.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.4 }}
    >
      {/* Capa oscura encima del fondo */}
      <motion.div
        className="absolute inset-0 bg-black bg-opacity-70 z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ duration: 1.2 }}
      />

      {/* Contenido principal */}
      <motion.div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
        {/* Título animado */}
        <h2 className="text-3xl md:text-4xl font-heading uppercase tracking-widest text-white flex justify-center flex-wrap">
          {splitTextToSpans('Nuestra Esencia')}
        </h2>

        {/* Párrafo 1 */}
        <motion.p
          className="text-base md:text-lg text-white/90 leading-relaxed font-light"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          En <span className="font-medium">JCavalier</span> no solo vestimos cuerpos, vestimos historias.
          Nuestra inspiración nace de la elegancia atemporal, el carácter silencioso de los detalles,
          y el estilo que trasciende modas pasajeras.
        </motion.p>

        {/* Párrafo 2 */}
        <motion.p
          className="text-base md:text-lg text-white/80 leading-relaxed font-light"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.6 }}
        >
          Cada prenda está pensada para hombres que valoran el legado, la sobriedad y el poder de la presencia.
          Desde cortes clásicos hasta tejidos nobles, <span className="font-medium">JCavalier</span>
          es un símbolo de distinción.
        </motion.p>

        {/* Cita final */}
        <motion.blockquote
          className="text-base md:text-lg text-white/70 leading-relaxed font-light italic"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.0 }}
        >
          “Vestir bien no es llamar la atención, es ser inolvidable sin esfuerzo.”
        </motion.blockquote>
      </motion.div>
    </motion.section>
  );
};

export default AboutSection;
