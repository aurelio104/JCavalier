import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import { empresaConfig } from '../config/empresaConfig'; // Importando la configuración de la empresa
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export type IntentionType = 'saludo' | 'pregunta' | 'compra' | 'reclamo' | 'seguimiento' | 'otro';

/**
 * Clasifica la intención del usuario en una de las 6 categorías predefinidas usando OpenAI.
 * ⚠️ Solo debe usarse en análisis avanzados o contextos fuera del flujo principal.
 * Para el flujo del bot, usar `detectIntent()` de `intent.engine.ts`.
 */
export async function detectIntention(text: string): Promise<IntentionType> {
  const prompt = `
Clasifica el siguiente mensaje de WhatsApp en una de las siguientes categorías, considerando el contexto cultural de ${empresaConfig.nombre}:

- saludo (ej: hola, buenas tardes, hey)
- pregunta (curiosidad general o consulta informal)
- compra (pedido, interés en producto, colores, tallas, precios)
- reclamo (queja, producto dañado o no recibido)
- seguimiento (estado de un pedido, rastreo)
- otro (cualquier otro mensaje que no encaje)

Mensaje: "${text}"
Responde solo con una palabra exacta (una de las categorías indicadas).

*Recuerda que las respuestas deben estar alineadas con el contexto cultural y el enfoque de servicio al cliente de ${empresaConfig.nombre}, una empresa de moda especializada en productos de alta calidad y estilo único.*
`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0
  });

  const intent = completion.choices[0].message.content?.toLowerCase().trim() as IntentionType;

  return ['saludo', 'pregunta', 'compra', 'reclamo', 'seguimiento'].includes(intent)
    ? intent
    : 'otro';
}
