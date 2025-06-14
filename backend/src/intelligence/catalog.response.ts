import { detectProductByKeywords, getProductDescription } from './product.engine'
import { empresaConfig } from '../config/empresaConfig';

/**
 * Genera una respuesta emocionalmente inteligente con el link del catálogo,
 * basada en las palabras clave del mensaje del usuario.
 * 
 * ⚠️ Este método debe ser invocado exclusivamente desde:
 * - `intentHandler.flow.ts` para intención comercial
 * - `aiResponder.ts` como fallback contextual
 */
export function getCatalogResponse(name: string, text: string, lastSeenTimestamp?: number): string {
  const normalized = text.toLowerCase()
  const product = detectProductByKeywords(normalized)
  const description = product ? getProductDescription(product) : null

  const saludo = !lastSeenTimestamp || Date.now() - lastSeenTimestamp > 60000
    ? `¡${name}, qué gusto saludarte! 😊\n\n`
    : ''

  // 📌 Respuestas especiales para palabras clave específicas
  if (/playa|sun set|verano/.test(normalized) && /conjunto|short/.test(normalized)) {
    return `${saludo}☀️ ¡Qué bien que estés interesado en nuestros conjuntos de playa! ¿Te gustaría saber los precios de los conjuntos de playa en alguna talla o color específico? 

Tenemos varias opciones frescas para el clima de Venezuela, incluyendo la colección *Sun Set*.

Incluye camisas ligeras y shorts en colores como azul, gris, beige, rosa y negro.

👉 ${empresaConfig.enlaces.catalogo}`
  }

  if (/camisa de vestir|camisas de lino|manga larga/.test(normalized)) {
    return `${saludo}👔 Nuestra colección *Monarch linen* ofrece camisas de vestir manga larga, elaboradas en tela lino. Elegancia y frescura en cada modelo.

👉 ${empresaConfig.enlaces.catalogo}`
  }

  if (/conjunto.*(dama|caballero)|ropa deportiva|sport set/.test(normalized)) {
    return `${saludo}💪 Tenemos conjuntos deportivos estilo oversize tanto para dama como caballero. Frescura, comodidad y actitud.

👉 ${empresaConfig.enlaces.catalogo}`
  }

  const detalle = product && description
    ? `✨ Parece que estás buscando *${product}*.
${description}`
    : '🖤 Nuestra colección es versátil y con carácter. Camisas, conjuntos, pantalones y más... para que expreses quién eres.'

  return `${saludo}${detalle}

🛍️ Puedes ver todos nuestros modelos, colores y tallas directamente en el catálogo:
👉 ${empresaConfig.enlaces.catalogo}

Si tienes un estilo en mente o algo que te gustaría ver, dime y te ayudo a encontrar lo ideal para ti. 😉`
}

/**
 * Respuesta específica para usuarios que preguntan por camisas
 * ❌ No menciona precios explícitamente.
 */
export function respondToShirtPrice(): string {
  return `👕 ¡Claro! Las camisas ${empresaConfig.nombre} destacan por su diseño moderno, calidad premium y estilo atemporal.

Tonos clásicos como blanco y azul marino, además de opciones vibrantes como esmeralda y burdeos.

🧥 Explora los modelos aquí:
👉 ${empresaConfig.enlaces.catalogo}/camisas

¿Tienes en mente algún estilo o color? Dímelo y te ayudo a elegir la ideal para ti. 😉`
}

/**
 * Respuesta específica para usuarios que preguntan por conjuntos
 * ❌ No menciona precios explícitamente.
 */
export function respondToSetPrice(): string {
  return `✨ Nuestros conjuntos están pensados para combinar estilo urbano con frescura playera 🏖️

👕 Camisas + Shorts con cortes modernos, colores vibrantes como esmeralda, burdeos y más.

🧥 Explora los conjuntos aquí:
👉 ${empresaConfig.enlaces.catalogo}/conjuntos

¿Tienes algún estilo o color en mente? Dímelo y te ayudo a elegir. 😉`
}
