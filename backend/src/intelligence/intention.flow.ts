import { OpenAI } from 'openai'
import dotenv from 'dotenv'
import { empresaConfig } from '../config/empresaConfig'

dotenv.config()

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export type IntentionType =
  | 'saludo'
  | 'pregunta'
  | 'compra'
  | 'reclamo'
  | 'seguimiento'
  | 'otro'

/**
 * Clasifica el mensaje en una categoría general.
 * ⚠️ Usar solo para análisis fuera del flujo principal. Para producción, preferir `detectIntent()`.
 */
export async function detectIntention(text: string): Promise<IntentionType> {
  const prompt = `
Clasifica el siguiente mensaje de WhatsApp en *una sola* de las siguientes categorías:

- saludo
- pregunta
- compra
- reclamo
- seguimiento
- otro

Mensaje: "${text}"

⚠️ Responde únicamente con una palabra exacta (una de las categorías).
Toma en cuenta el contexto cultural de Venezuela y el enfoque de atención directa y empática de la marca ${empresaConfig.nombre}, especializada en moda de alto estilo.
`

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0
  })

  const intent = completion.choices[0].message.content?.toLowerCase().trim() as IntentionType

  return ['saludo', 'pregunta', 'compra', 'reclamo', 'seguimiento'].includes(intent)
    ? intent
    : 'otro'
}
