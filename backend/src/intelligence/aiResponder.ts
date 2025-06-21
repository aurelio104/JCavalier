import { OpenAI } from 'openai'
import { buildUserContext } from './context.generator'
import { detectProductByKeywords } from './product.engine'
import { getCatalogResponse } from './catalog.response'
import { empresaConfig } from '../config/empresaConfig'
import { getUser } from '@memory/memory.mongo'
import { Emotion } from '@schemas/UserMemory'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

/**
 * Genera una respuesta emocionalmente empática basada en el contexto del usuario.
 * ⚠️ Esta función debe utilizarse solo como fallback si ningún flujo ha respondido antes.
 */
export async function generatePersonalizedReply(userId: string, message: string): Promise<string> {
  const normalized = message.toLowerCase().normalize('NFD').replace(/[̀-\u036f]/g, '')

  // Detectar si el mensaje menciona algún producto
  const productDetected = detectProductByKeywords(normalized)
  if (productDetected) {
    const name = userId.split('@')[0] || 'amigo'
    return getCatalogResponse(name, message)
  }

  // Obtener contexto completo del usuario
  const context = await buildUserContext(userId)
  const user = await getUser(userId)

  const emotion: Emotion = user?.emotionSummary || 'neutral'
  const perfil = user?.profileType || 'explorador'
  const frecuencia = user?.frequency || 'ocasional'

  const tonoFrecuencia = frecuencia === 'recurrente' ? '¡Gracias por volver!' : ''
  const emocionesCriticas: Emotion[] = ['negative']

  const sugerenciaEmpatica = emocionesCriticas.includes(emotion)
    ? 'Estoy aquí para ayudarte en lo que necesites.'
    : ''

  const prompt = `
Eres un asesor de ${empresaConfig.nombre}, una marca de moda venezolana. Tu estilo es breve, directo, cordial y adaptado al español latino de Venezuela.

• Estado emocional: *${emotion}*
• Perfil: *${perfil}*
• Frecuencia de compra: *${frecuencia}*

${tonoFrecuencia} ${sugerenciaEmpatica}

Contexto útil:
${context}

Mensaje recibido:
"${message}"

Tu respuesta (una sola, clara y corta, sin explicaciones ni repeticiones. Si aplica, ofrece ayuda concreta, productos o enlaces):`

  const completion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'gpt-4o',
    temperature: 0.7,
    max_tokens: 100
  })

  return (
    completion.choices?.[0]?.message?.content?.trim() ||
    `¿Querés contarme un poco más para poder ayudarte mejor?`
  )
}
