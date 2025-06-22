import { OpenAI } from 'openai'
import dotenv from 'dotenv'
import { empresaConfig } from '../config/empresaConfig'

dotenv.config()

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export type IntentionType =
  | 'saludo'
  | 'precio'
  | 'catalogo'
  | 'pedido'
  | 'pregunta'
  | 'reclamo'
  | 'seguimiento'
  | 'otro'

/**
 * Clasifica el mensaje en una categoría general utilizando OpenAI.
 * ⚠️ Úsalo solo para análisis interno o segmentación fuera del flujo principal.
 */
export async function detectIntention(text: string): Promise<IntentionType> {
  const prompt = `
Clasifica el siguiente mensaje de WhatsApp en *una sola* de las siguientes categorías:

- saludo
- precio
- catalogo
- pedido
- pregunta
- reclamo
- seguimiento
- otro

Mensaje: "${text}"

⚠️ Responde únicamente con *una sola palabra exacta*, sin explicaciones.
Toma en cuenta el contexto venezolano y el estilo de atención de la marca "${empresaConfig.nombre}", especializada en moda y estilo.
`

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0
  })

  const intent = completion.choices[0].message.content?.toLowerCase().trim() as IntentionType

  return [
    'saludo',
    'precio',
    'catalogo',
    'pedido',
    'pregunta',
    'reclamo',
    'seguimiento'
  ].includes(intent)
    ? intent
    : 'otro'
}
