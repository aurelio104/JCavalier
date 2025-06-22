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
 * Devuelve todas las intenciones detectadas en el texto.
 */
export function detectIntent(text: string): BotIntent[] {
  const normalized = normalize(text)
  const intents: Set<BotIntent> = new Set()

  // Conversacionales
  if (/\b(hola|buenas|saludos|hey|holi)\b/.test(normalized)) intents.add('greeting')
  if (/\b(gracias|muy amable|perfecto|encantado|excelente servicio)\b/.test(normalized)) intents.add('thank_you')
  if (/\b(chao|adios|nos vemos|hasta luego)\b/.test(normalized)) intents.add('goodbye')
  if (/(no sirve|problema|defecto|fallo|malo|incompleto|inconveniente|error)/.test(normalized)) intents.add('complaint')

  // Comerciales
  if (/(catalogo|coleccion|ropa|modelos|conjunto|conjuntos|camisa|franela|pantalon|short|producto|prenda|oversize|set|dama|caballero|color|ver ropa|ver modelos|outfit|look|playera)/.test(normalized)) intents.add('catalog')
  if (/(precio|precios|costos|cuanto cuesta|cuanto valen|vale|cuesta|tarifa|cuanto es|valor de|coste|how much|price|cuanto cuestan los conjuntos de playa|precio conjunto playa|precio conjuntos de playa)/.test(normalized)) intents.add('price')
  if (/(talla|tallas|medida|xs|s|m|l|xl|xxl|hay talla|que tallas|size)/.test(normalized)) intents.add('size')
  if (/(quiero esto|me gusta este|comprar|lo compro|agregar al carrito|confirmo pedido|hago el pedido|lo llevo|quiero pedir|quiero ordenar|buy)/.test(normalized)) intents.add('order')
  if (/(cuando llega|seguimiento|trackeo|estado del pedido|envio|en camino|donde esta|tracking|rastreo)/.test(normalized)) intents.add('tracking')

  // Consultas generales
  if (/(cuanto mide|cuantas unidades|como funciona|puedo|hay stock|dudas|me explicas|informacion|how does it work)/.test(normalized)) intents.add('question')

  if (intents.size === 0) {
    console.log(`🧠 [Intent Engine] No match: "${text}" → "${normalized}" → 'unknown'`)
    intents.add('unknown')
  }

  return Array.from(intents)
}

/**
 * Determina la intención principal según prioridad.
 */
export function getPrimaryIntent(intents: BotIntent[]): BotIntent {
  const priority: BotIntent[] = [
    'order',
    'price',
    'catalog',
    'tracking',
    'size',
    'question',
    'complaint',
    'thank_you',
    'greeting',
    'goodbye',
    'unknown'
  ]
  for (const p of priority) {
    if (intents.includes(p)) return p
  }
  return 'unknown'
}

/**
 * Detecta emociones básicas en texto del usuario.
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
 */
export function isPriceInquiry(message: string): boolean {
  const normalized = normalize(message)

  const fuzzyTerms = [
    'cuanto cuestan las camisas',
    'precio camisas',
    'precio conjuntos',
    'cuanto cuestan los conjuntos',
    'conjuntos de playa precio',
    'precio conjunto playa',
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

  if (/(quiero esto|lo compro|confirmo pedido|hago el pedido|comprar|buy)/.test(normalized)) {
    return 'comprador directo'
  }

  if (/(catálogo|colección|camisa|conjunto|conjuntos|ropa|ver modelos|outfit|playa|sun set)/.test(normalized)) {
    return 'explorador'
  }

  if (/(como funciona|hay stock|me explicas|que incluye|puedo pagar con|aceptan pago movil|aceptan bolivares|me interesa)/.test(normalized)) {
    return 'indeciso'
  }

  return 'explorador'
}
