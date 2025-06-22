interface ProductKeywords {
  [key: string]: string[];
}

export const productData: ProductKeywords = {
  camisa: ['camisa', 'camisas', 'blusa', 'shirt', 'shirtwear'],
  conjunto: ['conjunto', 'outfit', 'set', 'combo', 'look completo'],
  pantalon: ['pantalon', 'pantalones', 'jeans', 'pants', 'denim'],
  short: ['short', 'bermuda', 'bermudas'],
  franela: ['franela', 'franelas', 't-shirt', 'playera', 'remera'],
  chemise: ['chemise', 'polo', 'tipo polo'],
  deportivo: ['sport', 'deportivo', 'oversize', 'gym', 'entrenar', 'fitness'],
  cubana: ['cubana', 'cubanas', 'cubano', 'tropical'],
  verano: ['sun set', 'verano', 'playa', 'beachwear', 'ropa de playa', 'moda verano'],
  merch: ['merch', 'gladiador', 'oversize gladiador', 'edición limitada'],
  accesorio: ['accesorio', 'accesorios', 'gorra', 'sombrero', 'bucket hat']
}

/**
 * Detecta el producto o colección según palabras clave del texto.
 * Devuelve el identificador de la colección si encuentra coincidencia.
 */
export function detectProductByKeywords(text: string): string | null {
  const normalized = text.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')

  for (const collection in productData) {
    if (productData[collection].some(keyword => normalized.includes(keyword))) {
      return collection
    }
  }

  return null
}

/**
 * Devuelve una descripción emocional breve del producto.
 */
export function getProductDescription(collection: string): string {
  const descriptions: Record<string, string> = {
    camisa: '🧥 Camisas con corte sobrio y tejido premium.',
    conjunto: '✨ Conjuntos cómodos y versátiles, ideales para clima cálido.',
    pantalon: '👖 Pantalones con estilo clásico y ajuste relajado.',
    short: '🩳 Shorts livianos, perfectos para el día a día.',
    franela: '👕 Franelas frescas con estilo casual.',
    chemise: '🧵 Chemises estilo Old Money en tela Jacquard.',
    deportivo: '🏋️ Conjuntos sport oversize para dama y caballero.',
    cubana: '🌴 Camisas cubanas con vibra tropical y relajada.',
    verano: '☀️ Looks frescos para el verano, como los de la colección *Sun Set*.',
    merch: '🔥 Nuestra línea Gladiador en estilo oversize y algodón 100%.',
    accesorio: '🧢 Complementos que elevan cualquier look.'
  }

  return descriptions[collection] || '🖤 Prenda destacada de nuestra colección.'
}
