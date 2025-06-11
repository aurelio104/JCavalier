import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import SizeSelector from './SizeSelector';
import CartModal from './CartModal';

const productData = {
  'Monarch linen': {
    description: 'Camisas de vestir manga larga, elaboradas en tela lino.',
    items: [
      { id: 1, name: 'Monarch linen Blanco', price: 25.0, image: '/images/Monarch linen/1.jpg' },
      { id: 2, name: 'Monarch linen Gris', price: 25.0, image: '/images/Monarch linen/2.jpg' },
      { id: 3, name: 'Monarch linen Beige', price: 25.0, image: '/images/Monarch linen/3.jpg' },
      { id: 4, name: 'Monarch linen Rosa', price: 25.0, image: '/images/Monarch linen/4.jpg' },
      { id: 5, name: 'Monarch linen Azul', price: 25.0, image: '/images/Monarch linen/5.jpg' },
      { id: 6, name: 'Monarch linen Negro', price: 25.0, image: '/images/Monarch linen/6.jpg' },
    ],
  },
  'Franela Imperial estilo Old money': {
    description: 'Elaboradas en tela tejida Jacquard suave y ligera.',
    items: [
  { id: 11, name: 'Franela Imprerial Blanco', price: 32.0, image: '/images/Franela Imperial estilo Old money/1.jpg' },
   { id: 12, name: 'Franela Imprerial Verde', price: 28.0, image: '/images/Franela Imperial estilo Old money/2.jpg' },
    ],
  },
    'Chemise Imperial estilo Old money': {
    description: 'Elaboradas en tela tejida Jacquard suave y ligera.',
    items: [
  { id: 20, name: 'Chemise Imprerial Beige', price: 32.0, image: '/images/Chemise Imperial estilo Old money/1.jpg' },
   { id: 21, name: 'Chemise Imprerial Negro', price: 28.0, image: '/images/Chemise Imperial estilo Old money/2.jpg' },
    ],
  },

  'Set Diamond estilo old money ': {
    description: 'Conjunto elegante casual elaborado en tela tejida Jacquard. Disponible en 2 presentaciones short o pantalón + camisa manga corta.',
    items: [
      { id: 30, name: 'Pantalón y Camisa Blanco', price: 22.0, image: '/images/Set Diamond estilo old money/1.jpg' },
      { id: 31, name: 'Short y Camisa Blanco', price: 35.0, image: '/images/Set Diamond estilo old money/2.jpg' },
      { id: 32, name: 'Pantalón y Camisa Blanco Perla', price: 25.0, image: '/images/Set Diamond estilo old money/3.jpg' },
      { id: 33, name: 'Short y Camisa Blanco Perla', price: 25.0, image: '/images/Set Diamond estilo old money/4.jpg' },
      { id: 34, name: 'Pantalón y Camisa Beige', price: 25.0, image: '/images/Set Diamond estilo old money/5.jpg' },
      { id: 35, name: 'Short y Camisa Beige', price: 25.0, image: '/images/Set Diamond estilo old money/6.jpg' },
      { id: 36, name: 'Pantalón y Camisa Verde Oliva', price: 25.0, image: '/images/Set Diamond estilo old money/7.jpg' },
      { id: 37, name: 'Short y Camisa Verde Oliva', price: 25.0, image: '/images/Set Diamond estilo old money/8.jpg' },      
      { id: 38, name: 'Pantalón y Camisa Marron', price: 25.0, image: '/images/Set Diamond estilo old money/9.jpg' },
      { id: 39, name: 'Short y Camisa Marron', price: 25.0, image: '/images/Set Diamond estilo old money/10.jpg' },
      { id: 40, name: 'Pantalón y Camisa Negro', price: 25.0, image: '/images/Set Diamond estilo old money/11.jpg' },
      { id: 41, name: 'Short y Camisa Negro', price: 25.0, image: '/images/Set Diamond estilo old money/12.jpg' },      
    ],
  },
  'Gold Sport Set Dama': {
    description: 'conjunto deportivo sport elaborado en tela French Terry 100% algodón. Franela estilo oversize y short tipo cargo.',
    items: [
      { id: 50, name: 'Gold Sport Dama Verde', price: 100.0, image: '/images/Gold Sport Set Dama/1.jpg' },
      { id: 51, name: 'Gold Sport Dama Azul', price: 85.0, image: '/images/Gold Sport Set Dama/2.jpg' },
      { id: 52, name: 'Gold Sport Dama Rojo', price: 25.0, image: '/images/Gold Sport Set Dama/3.jpg' },
      { id: 53, name: 'Gold Sport Dama Blanco', price: 25.0, image: '/images/Gold Sport Set Dama/4.jpg' },
      { id: 54, name: 'Gold Sport Dama Beige', price: 25.0, image: '/images/Gold Sport Set Dama/5.jpg' },

    ],
  },
    'Gold Sport Set Caballero': {
    description: 'conjunto deportivo sport elaborado en tela French Terry 100% algodón. Franela estilo oversize y short tipo cargo.',
    items: [
      { id: 60, name: 'Gold Sport Caballero Blanco', price: 100.0, image: '/images/Gold Sport Set Caballero/1.jpg' },
      { id: 61, name: 'Gold Sport Caballero Verde', price: 85.0, image: '/images/Gold Sport Set Caballero/2.jpg' },
      { id: 62, name: 'Gold Sport Caballero Azul', price: 25.0, image: '/images/Gold Sport Set Caballero/3.jpg' },
      { id: 63, name: 'Gold Sport Caballero beige', price: 25.0, image: '/images/Gold Sport Set Caballero/4.jpg' },
      { id: 64, name: 'Gold Sport Caballero Rojo', price: 25.0, image: '/images/Gold Sport Set Caballero/5.jpg' },
    ],
  },
  'Sun Set': {
    description: 'Looks frescos y tropicales ideales para la playa o el verano.',
    items: [
      { id: 70, name: 'Sun Set Azul', price: 25.0, image: '/images/Sun Set/1.jpg' },
      { id: 71, name: 'Sun Set Gris', price: 25.0, image: '/images/Sun Set/2.jpg' },
      { id: 72, name: 'Sun Set Beige', price: 25.0, image: '/images/Sun Set/3.jpg' },
      { id: 73, name: 'Sun Set Rosa', price: 25.0, image: '/images/Sun Set/4.jpg' },
      { id: 74, name: 'Sun Set Azul', price: 25.0, image: '/images/Sun Set/5.jpg' },
      { id: 75, name: 'Sun Set Negro', price: 25.0, image: '/images/Sun Set/6.jpg' },
    ],
  },
  'Camisas Cubanas': {
    description: 'Camisas con aire tropical y corte relajado, para ocasiones especiales o casuales.',
    items: [
      { id: 80, name: 'Camisa Cubana Blanco', price: 30.0, image: '/images/Camisas Cubanas/1.jpg' },
      { id: 81, name: 'Camisa Cubana Beige', price: 25.0, image: '/images/Monarch linen/3.jpg' },
      { id: 82, name: 'Camisa Cubana Rosa', price: 25.0, image: '/images/Monarch linen/4.jpg' },
      { id: 83, name: 'Camisa Cubana Azul', price: 25.0, image: '/images/Monarch linen/5.jpg' },
      { id: 84, name: 'Camisa Cubana Negro', price: 25.0, image: '/images/Monarch linen/6.jpg' },
      { id: 85, name: 'Camisa Cubana Negro', price: 25.0, image: '/images/Monarch linen/6.jpg' },
    ],
  },

  // Colección 'Merch Oversize Gladiador'
  'Merch Oversize Gladiador': {
    description: 'Elaboradas en tela yersy 100% algodón.',
    items: [
      { id: 90, name: 'Overzise Gradiador Dama Marron', price: 25.0, image: '/images/Merch Oversize Gladiador/1.jpg' },
      { id: 91, name: 'Overzise Gradiador Dama Gris', price: 25.0, image: '/images/Merch Oversize Gladiador/2.jpg' },
      { id: 92, name: 'Overzise Gradiador Dama Negro', price: 25.0, image: '/images/Merch Oversize Gladiador/3.jpg' },
    ],
  },
};




const CatalogView = () => {
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [animateCatalog, setAnimateCatalog] = useState(false);
  const [showCollection, setShowCollection] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // State to manage loading

  const catalogRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('jcavalierCart');
    if (saved) setCartItems(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('jcavalierCart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Simulate loading delay for collections and catalog
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateCatalog(true); // Start catalog animation after 1 second
      setIsLoading(false); // Mark loading as complete
    }, 1000); // Adjust time as needed

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (selectedCollection) {
      setTimeout(() => {
        setShowCollection(true); // Show collection after delay
      }, 500);
    }
  }, [selectedCollection]);

  const handleCollectionChange = (name) => {
    setSelectedCollection(name);
    setShowCollection(false); // Hide collection before showing
  };

  const handleSelectOptions = ({ size, color, model }) => {
    const collectionName = selectedCollection;
    const item = {
      ...selectedProduct,
      size,
      color,
      model,
      collection: collectionName,
    };

    setCartItems((prev) => {
      const exists = prev.some(
        (p) => p.id === item.id && p.size === item.size && p.color === item.color
      );
      return exists ? prev : [...prev, item];
    });

    setSelectedProduct(null);
    setIsCartOpen(true);
  };

  return (
    <section
      ref={catalogRef}
      id="tulio-catalogo"
      className={`bg-[#1a1a1a] py-16 px-4 min-h-[auto] ${isLoading ? 'opacity-0' : 'opacity-100'}`} // Hide section until loading is done
    >
      <motion.div
        className="max-w-7xl mx-auto"
        initial={{ y: '50px' }}
        animate={{ y: animateCatalog ? 0 : '50px' }}
        transition={{ duration: 1, ease: 'easeInOut' }}
      >
        {!selectedCollection ? (
          <>
            <h2 className="text-white text-2xl sm:text-3xl font-heading mb-10 text-center uppercase tracking-wider">
              Colecciones JCavalier
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {Object.entries(productData).map(([name, data], i) => (
                <ProductCard
                  key={name}
                  product={{
                    name,
                    image: data.items[0]?.image,
                  }}
                  delay={i * 0.1}
                  onClick={() => handleCollectionChange(name)}
                />
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="mb-6">
              <motion.button
                onClick={() => setSelectedCollection(null)}
                className="text-xl text-white hover:underline mb-4 block text-left"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, scale: 1.1 }}
                transition={{ duration: 0.8, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' }}
              >
                ← Volver a colecciones
              </motion.button>

              <h3 className="text-white text-2xl font-heading uppercase tracking-wider text-center mb-2">
                {selectedCollection}
              </h3>
              <div className="h-[2px] w-24 bg-white/30 mx-auto mb-4 rounded-full animate-pulse" />

              <p className="text-white-400 text-base font-medium text-center max-w-2xl mx-auto">
                {productData[selectedCollection].description}
              </p>
            </div>

            {/* Only show the collection after 500ms */}
            {showCollection && (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {productData[selectedCollection].items.map((product, i) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    delay={i * 0.1}
                    onClick={setSelectedProduct}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </motion.div>

      {selectedProduct && (
        <SizeSelector
          product={selectedProduct}
          collection={productData[selectedCollection]}
          onSelect={handleSelectOptions}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onAddMore={() => setIsCartOpen(false)}
        onRemoveItem={(index) => setCartItems((prev) => prev.filter((_, i) => i !== index))}
        onClearCart={() => setCartItems([])}
        cartItems={cartItems}
      />
    </section>
  );
};

const ProductCard = ({ product, delay, onClick, onImageLoad }) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
    if (onImageLoad) onImageLoad();
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView && imageLoaded ? { opacity: 1, y: 0 } : { opacity: 1 }}
      transition={{ duration: 0.7, delay }}
      className="bg-[#262626] p-4 text-white rounded-md cursor-pointer hover:shadow-md transition"
      onClick={() => onClick(product)}
    >
      <div className="aspect-square overflow-hidden rounded-md">
        <img
          src={product.image}
          alt={`Vista previa de ${product.name}`}
          className="w-full h-full object-cover transition-transform duration-500 ease-in-out hover:scale-105"
          onLoad={handleImageLoad}
        />
      </div>
      <div className="mt-4 text-sm text-center">
        <p className="font-medium">{product.name}</p>
        {product.price && (
          <p className="text-gray-400 text-xs mt-1">${product.price.toFixed(2)} USD</p>
        )}
      </div>
    </motion.div>
  );
};

export default CatalogView;
