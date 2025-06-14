// ✅ src/intelligence/product.engine.ts

// Definir la interfaz ProductKeywords con un índice de tipo string
interface ProductKeywords {
  [key: string]: string[];  // Permite cualquier clave de tipo string con valores tipo string[]
}

// Suponiendo que 'productData' es un objeto con estas claves
export const productData: ProductKeywords = {
  camisa: ['camisa', 'blusa', 'shirt'],
  conjunto: ['conjunto', 'outfit', 'set'],
  pantalon: ['pantalon', 'jeans', 'pants']
};

/**
 * Detecta la colección/producto basado en palabras clave encontradas en el texto del usuario.
 * Retorna el nombre exacto de la colección si se detecta.
 */
export function detectProductByKeywords(text: string): string | null {
  const normalized = text.toLowerCase();

  // Recorre las claves específicas de la colección
  for (const collection in productData) {
    if (productData.hasOwnProperty(collection)) {
      for (const keyword of productData[collection]) {
        if (normalized.includes(keyword)) {
          return collection;
        }
      }
    }
  }

  return null;
}

/**
 * Devuelve la descripción emocional del producto, utilizada en respuestas humanas.
 */
export function getProductDescription(collection: string): string {
  // Aquí debes agregar las descripciones emocionales asociadas a cada colección
  const descriptions: { [key: string]: string } = {
    camisa: 'Camisas con un diseño único y elegante.',
    conjunto: 'Conjuntos que combinan perfectamente para cualquier ocasión.',
    pantalon: 'Pantalones cómodos y con estilo para cada día.'
  };

  return descriptions[collection] || 'Producto desconocido';
}
