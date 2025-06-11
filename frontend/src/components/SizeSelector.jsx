import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, ZoomOut } from 'lucide-react';

const SizeSelector = ({ onSelect, onClose, product, collection }) => {
  const items = collection.items; // Extraemos los productos
  const [selectedSize, setSelectedSize] = useState('');
  const [currentIndex, setCurrentIndex] = useState(
    items.findIndex((p) => p.id === product.id) || 0
  );
  const [isZoomed, setIsZoomed] = useState(false);

  const currentProduct = items[currentIndex];

  const handleConfirm = () => {
    if (selectedSize) {
      const words = currentProduct.name.trim().split(' ');
      const color = words[words.length - 1];
      const model = words.slice(0, -1).join(' ');
      onSelect({ size: selectedSize, color, model });
    }
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
  };

  const toggleZoom = () => {
    setIsZoomed((prev) => !prev);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        role="dialog"
        aria-modal="true"
        aria-label="Selector de talla"
      >
        <motion.div
          className="relative bg-[#1a1a1a] text-white w-full max-w-md sm:max-w-xl sm:rounded-lg sm:p-6"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white text-4xl font-bold hover:text-white/60 z-50"
            aria-label="Cerrar selector"
          >
            ×
          </button>

          <div className="relative mb-6 w-full h-[60vh] overflow-hidden rounded-lg">
            <AnimatePresence initial={false} mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 w-full h-full"
              >
                <img
                  src={currentProduct.image}
                  alt={currentProduct.name}
                  className={`w-full h-full object-cover transition-transform duration-300 ${
                    isZoomed ? 'scale-150 cursor-zoom-out' : 'scale-100 cursor-zoom-in'
                  }`}
                  onClick={toggleZoom}
                />
              </motion.div>
            </AnimatePresence>

            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 text-4xl bg-white/10 hover:bg-white/30 text-white px-3 py-1 rounded-full z-20"
              aria-label="Imagen anterior"
            >
              ‹
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-4xl bg-white/10 hover:bg-white/30 text-white px-3 py-1 rounded-full z-20"
              aria-label="Imagen siguiente"
            >
              ›
            </button>

            <button
              onClick={toggleZoom}
              className="absolute bottom-3 right-3 bg-white/10 hover:bg-white/30 p-2 rounded-full text-white z-20"
              aria-label={isZoomed ? 'Alejar imagen' : 'Acercar imagen'}
            >
              {isZoomed ? <ZoomOut size={20} /> : <ZoomIn size={20} />}
            </button>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-heading uppercase tracking-wide">{currentProduct.name}</h2>
          </div>

          <div className="mb-10">
            <label className="block text-white mb-4 text-xl font-semibold text-center uppercase">Talla:</label>
            <div className="flex justify-center gap-4">
              {['S', 'M', 'L', 'XL'].map((size) => (
                <motion.button
                  key={size}
                  className={`w-14 h-14 rounded-full border-2 text-xl font-bold flex items-center justify-center transition duration-300 ${
                    selectedSize === size
                      ? 'bg-white text-black border-white shadow-[0_0_20px_6px_rgba(255,255,255,0.3)]'
                      : 'border-white text-white hover:bg-white hover:text-black'
                  }`}
                  onClick={() => setSelectedSize(size)}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.05 }}
                  aria-label={`Seleccionar talla ${size}`}
                >
                  {size}
                </motion.button>
              ))}
            </div>
          </div>

          <button
            className={`w-11/12 mx-auto block py-4 border text-lg font-bold uppercase tracking-wide rounded-full shadow-md backdrop-blur-sm text-center transition-all ${
              selectedSize
                ? 'bg-white text-black hover:bg-black hover:text-white border-white'
                : 'bg-white/20 text-white border-white cursor-not-allowed'
            }`}
            onClick={handleConfirm}
            disabled={!selectedSize}
          >
            Confirmar
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SizeSelector;
