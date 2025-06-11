import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const CartModal = ({ isOpen, onClose, onAddMore, cartItems, onRemoveItem, onClearCart }) => {
  const encodeLine = (label, value) =>
    `${label}: ${encodeURIComponent(value || '')}`

  const message = cartItems
    .map(
      (item) =>
        encodeLine('Colección', item.collection) + '%0A' +
        encodeLine('Producto', item.model) + '%0A' +
        encodeLine('Talla', item.size) + '%0A' +
        encodeLine('Color', item.color) + '%0A' +
        encodeLine('Precio', item.price)
    )
    .join('%0A%0A')

  const finalMessage =
    '🧾 Pedido confirmado desde el sitio JCAVALIER:%0A%0A' +
    message +
    '%0A%0A💬 Gracias por su atención. Espero su confirmación.'

  const whatsappUrl = `https://wa.me/584128966414?text=${finalMessage}`

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="cart-modal-title"
        >
          <motion.div
            className="relative bg-[#1a1a1a] text-white w-full max-w-md sm:max-w-xl sm:rounded-lg sm:p-6 shadow-xl"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {/* Botón cerrar */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 text-white text-4xl font-bold hover:text-white/60 z-50"
              aria-label="Cerrar modal"
            >
              ×
            </button>

            <h2
              id="cart-modal-title"
              className="text-white text-2xl mb-4 text-center font-heading uppercase tracking-wide"
            >
              Tu Selección
            </h2>

            <div
              className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-white scrollbar-track-transparent pr-1"
              aria-describedby="cart-items"
            >
              {cartItems.map((item, index) => (
                <motion.div
                  key={`${item.id}-${item.size}-${item.color}`}
                  className="flex items-center gap-4 border-b border-white/20 pb-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <img
                    src={item.image}
                    alt={`Imagen del producto ${item.model}`}
                    className="w-16 h-16 object-cover rounded border border-white"
                  />
                  <div className="flex-1">
                    <div className="text-xs text-white/60 uppercase font-semibold mb-1">
                      Colección: {item.collection}
                    </div>
                    <div className="font-medium">{item.model}</div>
                    <div className="text-sm flex flex-col">
                      <span>Talla: {item.size}</span>
                      <span>Color: {item.color}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="font-bold text-sm">${item.price}</div>
                    <button
                      type="button"
                      onClick={() => onRemoveItem(index)}
                      className="text-xs text-red-500 hover:text-red-400 mt-1 transition"
                    >
                      Eliminar
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {cartItems.length > 0 && (
              <div className="mt-6 space-y-4">
                <button
                  type="button"
                  onClick={onClearCart}
                  className="text-sm text-red-500 hover:text-red-400 underline transition block text-center"
                >
                  Vaciar carrito
                </button>

                <button
                  type="button"
                  onClick={onAddMore}
                  className="w-full border border-white py-3 rounded-full text-white hover:bg-white hover:text-black transition font-semibold shadow-md"
                >
                  Agregar otro producto
                </button>
              </div>
            )}

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 block w-full border border-white text-white text-center py-3 rounded-full hover:bg-white hover:text-black transition font-bold shadow-lg"
            >
              Confirmar por WhatsApp
            </a>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default CartModal
