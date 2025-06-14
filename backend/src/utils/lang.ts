// ✅ src/utils/lang.ts

import { proto, WASocket } from '@whiskeysockets/baileys'; // Asegúrate de importar correctamente WASocket y proto
import { OpenAI } from 'openai';
import { quickReacts } from './responses'; // Asegúrate de tener las reacciones rápidas predefinidas
import { empresaConfig } from '../config/empresaConfig'; // Importando la configuración de la empresa

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

/**
 * Detecta el idioma del texto: 'es' o 'en'
 */
export function detectLanguage(text: string): 'es' | 'en' {
  const lower = text.toLowerCase();

  // Indicadores de español
  const spanishIndicators = /[áéíóúñ¡¿]|(hola|gracias|buenas|quiero|precio|talla|pedido|producto|conjunto|beach|playa)/;
  
  // Indicadores de inglés
  const englishIndicators = /(hello|thanks|how much|buy|yes|no|do you|i want|please|order|price|size|okay|perfect|great|cool|awesome)/;

  if (spanishIndicators.test(lower)) return 'es'; // Detecta si es español
  if (englishIndicators.test(lower)) return 'en'; // Detecta si es inglés

  // Fallback para casos mixtos
  const commonEnglish = ['the', 'you', 'is', 'how', 'much', 'price', 'buy'];
  const enHits = commonEnglish.filter((w) => lower.includes(w)).length;
  return enHits > 1 ? 'en' : 'es'; // Si la mayoría de las palabras son en inglés, detecta inglés
}

/**
 * Detecta el idioma dominante de la conversación reciente (incluyendo el mensaje actual)
 */
export function detectLanguageFromHistory(history: string[], current: string): 'es' | 'en' {
  const combined = [...history, current];
  const enCount = combined.filter((m) => detectLanguage(m) === 'en').length;
  return enCount / combined.length >= 0.4 ? 'en' : 'es'; // Si el 40% o más de los mensajes son en inglés, se considera inglés
}

/**
 * Traduce un texto a español si viene en inglés; si ya está en español, lo retorna igual
 * También maneja respuestas cortas con reacciones divertidas predefinidas
 */
export async function maybeTranslateToSpanish(text: string, lang: 'en' | 'es'): Promise<string> {
  if (lang === 'es') return text; // Si ya está en español, lo retorna tal cual

  const normalized = text.trim().toLowerCase();

  // Si el mensaje tiene una reacción predefinida, retorna la respuesta rápida
  if (quickReacts[normalized]) return quickReacts[normalized];

  // Traducción utilizando OpenAI para mantener el tono y el contexto
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'Traduce el siguiente mensaje al español conservando el sentido y tono:'
      },
      {
        role: 'user',
        content: text
      }
    ],
    temperature: 0.2,
    max_tokens: 120
  });

  return (
    completion.choices?.[0]?.message?.content?.trim() || text // Si no se obtiene una traducción, devuelve el texto original
  );
}

/**
 * Maneja la respuesta de acuerdo con el idioma detectado y responde en español latino
 */
export async function handleLanguageResponse(
  text: string,
  sock: WASocket,
  from: string,
  msg: proto.IWebMessageInfo
) {
  const detectedLanguage = detectLanguage(text); // Detecta el idioma del mensaje

  // Si detecta que el mensaje está en inglés, lo traduce y responde en español latino
  const translatedText = detectedLanguage === 'en' ? await maybeTranslateToSpanish(text, 'en') : text;

  // Si el mensaje está en inglés, respondemos en español latino
  if (detectedLanguage === 'en') {
    await sock.sendMessage(from, {
      text: `¡Perfecto! Aquí tienes el catálogo, como pediste. Puedes ver todos los modelos aquí: ${empresaConfig.enlaces.catalogo}`
    });
  } else {
    // Si el mensaje está en español o es mixto, respondemos en español latino
    await sock.sendMessage(from, {
      text: `¡Genial! Aquí está el catálogo de los conjuntos de playa. Puedes ver todos los productos aquí: ${empresaConfig.enlaces.catalogo}`
    });
  }
}
