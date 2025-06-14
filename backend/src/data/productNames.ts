import { empresaConfig } from '../config/empresaConfig';  // Importamos la configuración de la empresa

// Definir un tipo que representa las claves posibles de las colecciones
type CollectionName = keyof typeof empresaConfig.colecciones;

/**
 * Detecta la colección/producto basado en palabras clave encontradas en el texto del usuario.
 * Retorna el nombre exacto de la colección si se detecta.
 */
export function detectProductByKeywords(text: string): CollectionName | null {
  const normalized = text.toLowerCase();

  // Revisamos todas las colecciones en la configuración de la empresa
  for (const [collectionName, data] of Object.entries(empresaConfig.colecciones) as [CollectionName, any][]) {
    // Aseguramos que cada colección tenga palabras clave para hacer la búsqueda
    if (data.keywords && Array.isArray(data.keywords)) {
      for (const keyword of data.keywords) {
        if (normalized.includes(keyword)) {
          return collectionName;
        }
      }
    }
  }
  return null;
}

/**
 * Devuelve la descripción emocional del producto, utilizada en respuestas humanas.
 */
export function getProductDescription(collection: CollectionName): string {
  const product = empresaConfig.colecciones[collection];
  return product ? product.description : 'Producto no encontrado';
}
