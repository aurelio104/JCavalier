// ✅ src/intelligence/emotion.flow.ts

import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import { empresaConfig } from '../config/empresaConfig';

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export type EmotionType =
  | 'positivo'
  | 'neutral'
  | 'negativo'
  | 'frustración'
  | 'decepción'
  | 'tristeza'
  | 'alegría';

/**
 * Clasifica el tono emocional de un mensaje usando OpenAI.
 * ⚠️ Solo debe usarse en contextos donde se requiera mayor precisión emocional.
 * Para el flujo normal del bot, usar `analyzeEmotion()` de `intent.engine.ts`.
 */
export async function detectEmotion(text: string): Promise<EmotionType> {
  const prompt = `
Clasificá el tono emocional del siguiente mensaje de WhatsApp en uno de los siguientes estados emocionales:
- positivo
- neutral
- negativo
- frustración
- decepción
- tristeza
- alegría

Mensaje: "${text}"

⚠️ Responde solo con una palabra exacta, sin explicación. El tono debe ser considerado dentro del contexto cultural de Venezuela y de la empresa ${empresaConfig.nombre}.
`

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0
  });

  const emotion = completion.choices[0].message.content?.toLowerCase().trim() as EmotionType;

  return [
    'positivo',
    'neutral',
    'negativo',
    'frustración',
    'decepción',
    'tristeza',
    'alegría'
  ].includes(emotion)
    ? emotion
    : 'neutral';
}

/**
 * Opcional: función para generar respuestas proactivas basadas en emociones detectadas.
 */
export function respuestaEmocionalProactiva(emocion: EmotionType): string | null {
  switch (emocion) {
    case 'tristeza':
      return '💙 Lamentamos que te sientas así. ¿Hay algo que pueda hacer para ayudarte mejor?';
    case 'frustración':
      return '😓 Siento que estés teniendo dificultades. Estoy aquí para ayudarte en lo que necesites.';
    case 'decepción':
      return '🙏 Lamentamos no haber cumplido tus expectativas. ¿Qué podemos mejorar para ti?';
    default:
      return null;
  }
}