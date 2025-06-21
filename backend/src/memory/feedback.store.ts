// ✅ src/intelligence/feedback.store.ts

import { saveFeedbackToMongo } from '@memory/memory.mongo'
import { Emotion } from '@schemas/UserMemory'

/**
 * Estructura del feedback que puede guardar el bot
 */
interface FeedbackPayload {
  userId: string
  message: string
  emotion: Emotion
  origin?: 'postventa' | 'interaccion' | 'reclamo' | 'agradecimiento'
  timestamp?: Date
}

/**
 * Guarda una entrada de feedback del usuario en la memoria persistente.
 * 
 * @param payload - Objeto con info del usuario, mensaje, emoción y origen opcional.
 */
export async function storeUserFeedback(payload: FeedbackPayload): Promise<void> {
  const { userId, message, emotion, origin = 'interaccion', timestamp = new Date() } = payload

  try {
    await saveFeedbackToMongo({
      userId,
      message,
      emotion,
      origin,
      timestamp
    })
    console.log(`📝 Feedback guardado de ${userId}: [${emotion}] "${message}"`)
  } catch (error) {
    console.error('❌ Error al guardar feedback:', error)
  }
}
