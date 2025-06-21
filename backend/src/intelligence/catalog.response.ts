import { detectProductByKeywords, getProductDescription } from './product.engine'
import { empresaConfig } from '../config/empresaConfig'

/**
 * Genera una respuesta clara y breve con el link del catálogo,
 * basada en las palabras clave del mensaje del usuario.
 *
 * ⚠️ Invocado desde:
 * - `intentHandler.flow.ts`
 * - `aiResponder.ts`
 */
export function getCatalogResponse(name: string, text: string, lastSeenTimestamp?: number): string {
  const normalized = text.toLowerCase()
  const product = detectProductByKeywords(normalized)
  const description = product ? getProductDescription(product) : null

  const saludo = !lastSeenTimestamp || Date.now() - lastSeenTimestamp > 60000
    ? `¡Hola ${name}! 👋\n\n`
    : ''

  if (/playa|sun set|verano/.test(normalized) && /conjunto|short/.test(normalized)) {
    return `${saludo}☀️ Tenemos conjuntos frescos ideales para clima playero, como la colección *Sun Set*.

👉 ${empresaConfig.enlaces.catalogo}`
  }

  if (/camisa de vestir|camisas de lino|manga larga/.test(normalized)) {
    return `${saludo}👔 Nuestra colección *Monarch linen* tiene camisas elegantes de lino, manga larga.

👉 ${empresaConfig.enlaces.catalogo}`
  }

  if (/conjunto.*(dama|caballero)|ropa deportiva|sport set/.test(normalized)) {
    return `${saludo}💪 Contamos con conjuntos deportivos oversize para dama y caballero.

👉 ${empresaConfig.enlaces.catalogo}`
  }

  const detalle = product && description
    ? `✨ Parece que buscás *${product}*.
${description}`
    : '🖤 Tenemos camisas, conjuntos, pantalones y más estilos.'

  const respuestaBase = `${saludo}${detalle}\n\n👉 ${empresaConfig.enlaces.catalogo}`

  if (product === 'camisa') {
    return `${respuestaBase}\n\n👖 También podés combinarlas con nuestros pantalones sobrios.`
  }

  return respuestaBase
}

export function respondToShirtPrice(): string {
  return `👕 Las camisas ${empresaConfig.nombre} destacan por su estilo y calidad.

👉 Ver modelos: ${empresaConfig.enlaces.catalogo}/camisas`
}

export function respondToSetPrice(): string {
  return `✨ Nuestros conjuntos combinan frescura y estilo urbano.

👉 Ver conjuntos: ${empresaConfig.enlaces.catalogo}/conjuntos`
}
