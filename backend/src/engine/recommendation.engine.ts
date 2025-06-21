import { empresaConfig } from '../config/empresaConfig'
import { getUser } from '@memory/memory.mongo'
import { UserMemory } from '@schemas/UserMemory'

interface CatalogItem {
  nombre: string
  link: string
  collection: string
}

export async function getSmartRecommendations(userId: string): Promise<string[]> {
  const user: UserMemory | null = await getUser(userId)

  if (!user || !user.history?.length) {
    return [
      '¿Querés que te muestre lo nuevo en camisas, franelas o conjuntos? 😉',
      `🛍️ Explorá el catálogo: ${empresaConfig.enlaces.catalogo}`
    ]
  }

  const tagScore: Record<string, number> = {}

  for (const entry of user.history) {
    const weight = entry.emotion === 'positive' ? 2 : entry.emotion === 'neutral' ? 1 : 0.5
    const words = (entry.message ?? '').toLowerCase().split(/\W+/)

    for (const word of words) {
      for (const [nombreColeccion, data] of Object.entries(empresaConfig.colecciones)) {
        if (data.items.some(item => item.toLowerCase() === word)) {
          for (const tag of data.items) {
            tagScore[tag] = (tagScore[tag] || 0) + weight
          }
        }
      }
    }
  }

  const sortedTags = Object.entries(tagScore)
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => tag)

  const recomendaciones: CatalogItem[] = []

  for (const tag of sortedTags) {
    for (const [collection, data] of Object.entries(empresaConfig.colecciones)) {
      if (data.items.includes(tag) && !recomendaciones.find(p => p.nombre === tag)) {
        recomendaciones.push({
          nombre: tag,
          link: data.link,
          collection
        })
        if (recomendaciones.length >= 3) break
      }
    }
    if (recomendaciones.length >= 3) break
  }

  if (recomendaciones.length === 0) {
    return [
      '¿Te gusta un estilo clásico, urbano o relajado?',
      `🔍 Podés ver todas las opciones aquí: ${empresaConfig.enlaces.catalogo}`
    ]
  }

  return recomendaciones.map(
    r => `✨ Recomendado: *${r.nombre}* de la colección *${r.collection}*  
👉 ${r.link}`
  )
}
