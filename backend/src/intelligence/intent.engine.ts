// ✅ src/intelligence/intent.engine.ts

import { Emotion, BotIntent } from '@schemas/UserMemory';
import { fuzzyIncludes } from '@utils/fuzzyMatch';
import { empresaConfig } from '../config/empresaConfig'; // Importamos la configuración de la empresa

/**
 * Normaliza un texto a minúsculas, sin tildes ni espacios extra
 */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Detecta la intención principal del usuario a partir del texto normalizado
 * Admite interacciones mixtas (español + inglés)
 */
export function detectIntent(text: string): BotIntent {
  const normalized = normalize(text);

  // 🧠 Conversacionales
  if (/\b(hola|buenas|saludos|hey|holi)\b/.test(normalized)) return 'greeting';
  if (/\b(gracias|muy amable|perfecto|encantado|excelente servicio)\b/.test(normalized)) return 'thank_you';
  if (/\b(chao|adios|nos vemos|hasta luego)\b/.test(normalized)) return 'goodbye';
  if (/\b(no sirve|error|problema|defecto|fallo|malo|incompleto|inconveniente)\b/.test(normalized)) return 'complaint';

  // 🛍️ Comerciales – producto, tipo, color, etc.
  if (
    /\b(catalogo|coleccion|ropa|modelos|conjunto|camisa|chamise|franela|pantalon|short|producto|prenda|vestimenta|oversize|set|dama|caballero|color|colores|tonos|ver ropa|ver modelos|outfit|look)\b/
      .test(normalized)
  ) return 'catalog';

  if (
    /\b(precio|costos|cuanto cuesta|cuanto valen|vale|cuesta|tarifa|cuanto es|valor de|coste|how much|price)\b/
      .test(normalized)
  ) return 'price';

  if (
    /\b(talla|tallas|medida|xs|s|m|l|xl|xxl|disponible en|hay talla|que tallas|size)\b/
      .test(normalized)
  ) return 'size';

  if (
    /\b(quiero esto|me gusta este|comprar|lo compro|agregar al carrito|confirmo pedido|deseo comprar|hago el pedido|lo llevo|quiero pedir|quiero ordenar|i want|buy)\b/
      .test(normalized)
  ) return 'order';

  if (
    /\b(cuando llega|seguimiento|trackeo|estado del pedido|envio|en camino|donde esta|tracking|rastreo)\b/
      .test(normalized)
  ) return 'tracking';

  // ❓ Preguntas generales
  if (
    /\b(cuanto mide|cuantas unidades|como funciona|puedo|hay stock|dudas|me explicas|informacion|how does it work)\b/
      .test(normalized)
  ) return 'question';

  // 🤷 Intención desconocida
  return 'other';
}

/**
 * Analiza la emoción del mensaje del usuario
 */
export function analyzeEmotion(text: string): Emotion {
  const normalized = normalize(text);

  if (
    /(😍|feliz|genial|excelente|me encanta|emocionado|wow|gracias|encantado|super|contento|increible|great|perfect)/.test(normalized)
  ) {
    return 'positive';
  }

  if (
    /(😢|molesto|odio|terrible|no sirve|frustrado|no me gusta|decepcionado|enojado|horrible|mal|pésimo|sad|depressed|frustration)/.test(normalized)
  ) {
    return 'negative';
  }

  return 'neutral';
}

/**
 * Detecta si el mensaje pregunta específicamente por precios de camisas o conjuntos
 * ⚠️ Solo debe ser utilizado dentro de `intentHandler.flow.ts` para evitar duplicaciones.
 */
export function isPriceInquiry(message: string): boolean {
  const normalized = normalize(message);

  const fuzzyTerms = [
    // Camisas
    'cuanto cuestan las camisas',
    'precio camisas',
    'precio de camisa',
    'cuanto cuesta camisa',
    'camisas cuanto valen',
    'camisas jcavalier precio',
    'quiero saber el precio de las camisas',

    // Conjuntos / sets / outfits
    'precio conjuntos',
    'cuanto cuestan los conjuntos',
    'cuanto valen los conjuntos',
    'conjuntos de playa precio',
    'quiero saber el precio de los conjuntos',
    'cuanto cuesta un conjunto jcavalier',
    'precio outfit',
    'precio set',
    'precio look playa',
    'set old money cuanto cuesta',
    // Inglés
    'how much is the shirt',
    'how much is the set',
    'price of beach outfits',
    'how much for the shirts'
  ];

  return fuzzyIncludes(normalized, fuzzyTerms);
}
