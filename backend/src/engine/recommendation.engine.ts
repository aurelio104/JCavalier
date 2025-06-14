// ✅ src/engine/recommendation.engine.ts

import { empresaConfig } from '../config/empresaConfig'; // Importamos la configuración de la empresa
import { getUser } from '@memory/memory.mongo';
import { Emotion, UserMemory } from '@schemas/UserMemory';

type CatalogItem = {
  id: string;
  nombre: string;
  tags: string[];
  precio: number;
};

export async function getSmartRecommendations(userId: string): Promise<string[]> {
  const user: UserMemory | null = await getUser(userId);
  if (!user || !user.history || user.history.length === 0) {
    return ['¿Querés que te muestre lo nuevo en camisas, sudaderas o pantalones? 👕👖'];
  }

  const tagScore: Record<string, number> = {};

  // Analizamos el historial de usuario
  for (const entry of user.history) {
    const weight: number =
      entry.emotion === 'positive'
        ? 2
        : entry.emotion === 'neutral'
        ? 1
        : 0.5;

    const words = (entry.message ?? '').toLowerCase().split(/\W+/);

    // Verificamos si el mensaje coincide con algún tag de los productos disponibles
    for (const word of words) {
      for (const collection of Object.values(empresaConfig.colecciones)) {
        if (collection.items.some(item => item.toLowerCase() === word)) {
          for (const tag of collection.items) {
            tagScore[tag] = (tagScore[tag] || 0) + weight;
          }
        }
      }
    }
  }

  const sortedTags = Object.entries(tagScore)
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => tag);

  const recommended: CatalogItem[] = [];

  // Recomendamos productos basados en los tags más frecuentes
  for (const tag of sortedTags) {
    for (const collection of Object.values(empresaConfig.colecciones)) {
      if (collection.items.includes(tag) && !recommended.find(p => p.nombre === tag)) {
        recommended.push({
          id: tag, // Usamos el nombre del tag como el id del producto (puedes modificarlo si tienes un sistema de IDs más complejo)
          nombre: tag,
          tags: collection.items,
          precio: 100, // Aquí se puede obtener un precio adecuado si se tiene más información sobre cada producto
        });
        if (recommended.length >= 3) break;
      }
    }
    if (recommended.length >= 3) break;
  }

  if (recommended.length === 0) {
    return ['Te puedo ayudar a encontrar algo ideal para vos. ¿Preferís algo oscuro, elegante, o futurista?'];
  }

  return recommended.map(p => `✨ ${p.nombre} - $${p.precio}`);
}
