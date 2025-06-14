import { OpenAI } from 'openai'
import { buildUserContext } from './context.generator'
import { detectProductByKeywords } from './product.engine'
import { getCatalogResponse } from './catalog.response'
import { empresaConfig } from '../config/empresaConfig';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

/**
 * Genera una respuesta emocionalmente empática basada en el contexto del usuario.
 * ⚠️ Esta función debe utilizarse solo como fallback si ningún flujo ha respondido antes.
 */
export async function generatePersonalizedReply(userId: string, message: string): Promise<string> {
  const normalized = message.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

  // Detectar si el mensaje menciona algún producto
  const productDetected = detectProductByKeywords(normalized)
  if (productDetected) {
    const name = userId.split('@')[0] || 'amigo'
    return getCatalogResponse(name, message)  // Responder con el catálogo de productos
  }

  // Obtener el contexto del usuario desde la memoria
  const context = await buildUserContext(userId)

  // Prompt actualizado para que las respuestas sean más personalizadas y en español latino
  const prompt = `
Eres un estilista digital empático de ${empresaConfig.nombre}, una marca de moda disruptiva. 
Debes responder en *español latino*, usando un tono cálido, directo y conectado emocionalmente con el usuario.

Contexto del usuario:
${context}

Mensaje recibido:
"${message}"

Tu respuesta (usa un tono cálido, directo y conectado emocionalmente, y asegúrate de que sea adecuada para el contexto y la cultura venezolana, mencionando detalles como el nombre de la empresa y posibles productos o servicios relacionados):`

  // Solicitar respuesta a OpenAI
  const completion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'gpt-4o',
    temperature: 0.85,
    max_tokens: 120
  })

  // Si OpenAI no devuelve una respuesta adecuada, usar una respuesta de fallback
  return (
    completion.choices?.[0]?.message?.content?.trim() ||
    `Disculpa, ¿podrías contarme un poco más para ayudarte mejor?`
  )
}
