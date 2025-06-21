// ✅ src/intelligence/intent.engine.ts

import { Emotion, BotIntent } from '@schemas/UserMemory'
import { fuzzyIncludes } from '@utils/fuzzyMatch'
import { empresaConfig } from '../config/empresaConfig'

/**
 * Normaliza el texto eliminando tildes, espacios extra y pasando a minúsculas.
 */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Detecta la intención del usuario desde el texto normalizado.
 */
export function detectIntent(text: string): BotIntent {
  const normalized = normalize(text)

  // 🧠 Conversacionales
  if (/\b(hola|buenas|saludos|hey|holi)\b/.test(normalized)) return 'greeting'
  if (/\b(gracias|muy amable|perfecto|encantado|excelente servicio)\b/.test(normalized)) return 'thank_you'
  if (/\b(chao|adios|nos vemos|hasta luego)\b/.test(normalized)) return 'goodbye'
  if (/\b(no sirve|problema|defecto|fallo|malo|incompleto|inconveniente|error)\b/.test(normalized)) return 'complaint'

  // 🛍️ Comerciales
  if (
    /\b(catalogo|coleccion|ropa|modelos|conjunto|camisa|franela|pantalon|short|producto|prenda|oversize|set|dama|caballero|color|ver ropa|ver modelos|outfit|look)\b/
      .test(normalized)
  ) return 'catalog'

  if (
    /\b(precio|costos|cuanto cuesta|cuanto valen|vale|cuesta|tarifa|cuanto es|valor de|coste|how much|price)\b/
      .test(normalized)
  ) return 'price'

  if (
    /\b(talla|tallas|medida|xs|s|m|l|xl|xxl|hay talla|que tallas|size)\b/
      .test(normalized)
  ) return 'size'

  if (
    /\b(quiero esto|me gusta este|comprar|lo compro|agregar al carrito|confirmo pedido|hago el pedido|lo llevo|quiero pedir|quiero ordenar|buy)\b/
      .test(normalized)
  ) return 'order'

  if (
    /\b(cuando llega|seguimiento|trackeo|estado del pedido|envio|en camino|donde esta|tracking|rastreo)\b/
      .test(normalized)
  ) return 'tracking'

  // ❓ Consultas generales
  if (
    /\b(cuanto mide|cuantas unidades|como funciona|puedo|hay stock|dudas|me explicas|informacion|how does it work)\b/
      .test(normalized)
  ) return 'question'

  return 'other'
}

/**
 * Detecta emociones básicas en texto del usuario.
 * Ideal para flujos rápidos que no requieren `detectEmotion()`.
 */
export function analyzeEmotion(text: string): Emotion {
  const normalized = normalize(text)

  if (/(😍|genial|excelente|me encanta|emocionado|gracias|super|contento|perfect)/.test(normalized)) {
    return 'positive'
  }

  if (/(😢|molesto|odio|frustrado|decepcionado|enojado|mal|pésimo|horrible|no sirve|terrible)/.test(normalized)) {
    return 'negative'
  }

  return 'neutral'
}

/**
 * Evalúa si se trata de una pregunta directa sobre precios.
 * ⚠️ Usar dentro de `intentHandler.flow.ts`.
 */
export function isPriceInquiry(message: string): boolean {
  const normalized = normalize(message)

  const fuzzyTerms = [
    'cuanto cuestan las camisas',
    'precio camisas',
    'precio conjuntos',
    'cuanto cuestan los conjuntos',
    'conjuntos de playa precio',
    'precio outfit',
    'precio look',
    'set old money cuanto cuesta',
    'how much is the shirt',
    'price of beach outfits'
  ]

  return fuzzyIncludes(normalized, fuzzyTerms)
}

/**
 * Detecta perfil de usuario: explorador, comprador directo o indeciso.
 */
export function detectarPerfilDeCompra(text: string): 'explorador' | 'comprador directo' | 'indeciso' {
  const normalized = normalize(text)

  if (/\b(quiero esto|lo compro|confirmo pedido|hago el pedido|comprar|buy)\b/.test(normalized)) {
    return 'comprador directo'
  }

  if (/\b(catálogo|colección|camisa|conjunto|ropa|ver modelos|outfit)\b/.test(normalized)) {
    return 'explorador'
  }

  if (/\b(como funciona|hay stock|me explicas|que incluye|puedo pagar con)\b/.test(normalized)) {
    return 'indeciso'
  }

  return 'explorador'
}
