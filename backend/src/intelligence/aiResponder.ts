import { OpenAI } from 'openai'
import { buildUserContext } from './context.generator'
import { detectProductByKeywords } from './product.engine'
import { getCatalogResponse } from './catalog.response'
import { empresaConfig } from '../config/empresaConfig';
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
    return getCatalogResponse(name, message)  // Responder con el catálogo de productos
  }

  // Obtener contexto completo del usuario
  const context = await buildUserContext(userId)
  const user = await getUser(userId)

  const emotion: Emotion = user?.emotionSummary || 'neutral'
  const perfil = user?.profileType || 'explorador'
  const frecuencia = user?.frequency || 'ocasional'

  const tonoFrecuencia = frecuencia === 'recurrente' ? 'como siempre, gracias por volver' : ''
  const emocionesCriticas: Emotion[] = ['negative'] // en caso de usar clasificación refinada

  const sugerenciaEmpatica = emocionesCriticas.includes(emotion)
    ? 'Si estás teniendo un mal momento, estoy aquí para ayudarte.'
    : ''

  const prompt = `
Eres un estilista digital empático de ${empresaConfig.nombre}, una marca de moda disruptiva.

Tu tono es cálido, directo y adaptado emocionalmente.

• El usuario se siente: *${emotion}*
• Su perfil es: *${perfil}*
• Frecuencia de compra: *${frecuencia}*

${tonoFrecuencia} ${sugerenciaEmpatica}

Contexto del usuario:
${context}

Mensaje recibido:
"${message}"

Tu respuesta (usa español latino y asegúrate de que sea adecuada para el tono emocional, la frecuencia del usuario y la cultura venezolana. Sé directo, empático y menciona productos o servicios si es útil):`

  // Solicitar respuesta a OpenAI
  const completion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'gpt-4o',
    temperature: 0.85,
    max_tokens: 120
  })

  return (
    completion.choices?.[0]?.message?.content?.trim() ||
    `Disculpa, ¿podrías contarme un poco más para ayudarte mejor?`
  )
}
