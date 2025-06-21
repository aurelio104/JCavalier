// ✅ src/intelligence/emotion.flow.ts

import { OpenAI } from 'openai'
import dotenv from 'dotenv'
import { empresaConfig } from '../config/empresaConfig'

dotenv.config()

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export type EmotionType =
  | 'positivo'
  | 'neutral'
  | 'negativo'
  | 'frustración'
  | 'decepción'
  | 'tristeza'
  | 'alegría'

/**
 * Detecta el tono emocional del mensaje usando OpenAI.
 * ⚠️ Uso exclusivo en flujos que requieran alta sensibilidad emocional.
 * Para análisis rápidos usar `analyzeEmotion()` de `intent.engine.ts`.
 */
export async function detectEmotion(text: string): Promise<EmotionType> {
  const prompt = `
Clasificá el tono emocional del siguiente mensaje de WhatsApp como una sola palabra:

- positivo
- neutral
- negativo
- frustración
- decepción
- tristeza
- alegría

Solo responde una palabra sin explicación, considerando contexto emocional venezolano y tono de marca de ${empresaConfig.nombre}.

Mensaje:
"${text}"
  `.trim()

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0
  })

  const raw = completion.choices?.[0]?.message?.content?.toLowerCase().trim()
  const emotion = raw as EmotionType

  const valid: EmotionType[] = [
    'positivo',
    'neutral',
    'negativo',
    'frustración',
    'decepción',
    'tristeza',
    'alegría'
  ]

  return valid.includes(emotion) ? emotion : 'neutral'
}

/**
 * Genera una respuesta empática opcional según emoción detectada.
 */
export function respuestaEmocionalProactiva(emocion: EmotionType): string | null {
  switch (emocion) {
    case 'tristeza':
      return '💙 Lamento que te sientas así. ¿Querés que lo resolvamos juntos?'
    case 'frustración':
      return '😓 Siento lo que pasó. Estoy aquí para ayudarte ahora mismo.'
    case 'decepción':
      return '🙏 No fue lo que esperabas. Decime cómo podemos mejorar para vos.'
    default:
      return null
  }
}
