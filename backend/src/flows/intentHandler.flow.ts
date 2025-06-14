// ✅ src/flows/intentHandler.flow.ts

import { WASocket, proto } from '@whiskeysockets/baileys'
import { detectIntent, analyzeEmotion } from '@intelligence/intent.engine'
import { getUser, saveUser } from '@memory/memory.mongo'
import { Emotion, BotIntent, UserHistoryEntry } from '@schemas/UserMemory'
import { handleWelcome } from './welcome.flow'
import { getCatalogResponse } from '@intelligence/catalog.response'
import { detectProductByKeywords } from '@intelligence/product.engine'
import { empresaConfig } from '../config/empresaConfig'; // Importamos la configuración de la empresa

// Función para buscar productos relacionados con la consulta y devolver precios
function buscarProductosPorKeywords(keywords: string): string[] {
  const productosRelacionados = Object.entries(empresaConfig.colecciones)
    .filter(([_, product]) => product.keywords.some(keyword => keywords.includes(keyword)))
    .map(([productName, product]) => `${productName} - $${product.price} - Ver más: ${product.link}`)
  
  return productosRelacionados
}

export async function handleIntentRouter(
  text: string,
  sock: WASocket,
  from: string,
  msg: proto.IWebMessageInfo
): Promise<boolean> {
  const normalized = text.toLowerCase().trim()
  const now = Date.now()
  const name = msg.pushName || from.split('@')[0]

  const user = await getUser(from)
  const lastSeen = user?.lastSeen ?? 0
  const saludoReciente = now - lastSeen < 2 * 60 * 1000

  const intent: BotIntent = detectIntent(normalized)
  const emotion: Emotion = analyzeEmotion(normalized)
  const detectedProduct = detectProductByKeywords(normalized)

  const historyEntry: UserHistoryEntry = {
    timestamp: now,
    message: text,
    intent,
    emotion,
    context: 'entrada'
  }

  const updatedUser = {
    _id: from,
    name,
    firstSeen: user?.firstSeen ?? now,
    lastSeen: now,
    lastMessage: text,
    tags: user?.tags || [],
    history: [...(user?.history || []), historyEntry],
    emotionSummary: emotion,
    needsHuman: false,
    ultimaIntencion: intent
  }

  await saveUser(updatedUser)

  const isGreeting = intent === 'greeting'

  // 👋 Saludo sin intención comercial
  if (isGreeting && !detectedProduct) {
    return await handleWelcome(text, sock, from, msg)
  }

  // 💬 Intención comercial con mención de producto o precio
  const isComercialIntent =
    intent === 'catalog' ||
    intent === 'price' ||
    intent === 'size' ||
    intent === 'order' ||
    (isGreeting && detectedProduct)

  if (isComercialIntent && !saludoReciente) {
    if (intent === 'price' || detectedProduct) {
      // Si la consulta es sobre precios, buscar productos relevantes
      const productosRelacionados = buscarProductosPorKeywords(normalized)
      if (productosRelacionados.length > 0) {
        const response = `Aquí tienes algunos productos relacionados con tu consulta sobre precios:\n\n${productosRelacionados.join('\n\n')}`
        await sock.sendMessage(from, { text: response })
        return true
      } else {
        await sock.sendMessage(from, {
          text: `No pude encontrar productos específicos relacionados con tu consulta. ¿Te gustaría ver nuestra colección completa?`
        })
        return true
      }
    }

    const response = getCatalogResponse(name, normalized, user?.lastSeen)
    await sock.sendMessage(from, { text: response })
    return true
  }

  // 📦 Seguimiento
  if (intent === 'tracking') {
    await sock.sendMessage(from, {
      text: `📦 Si ya hiciste un pedido y quieres saber el estado, indícame tu número de orden o tu nombre completo. Estoy aquí para ayudarte.`
    })
    return true
  }

  // 🛠️ Reclamos
  if (intent === 'complaint') {
    await sock.sendMessage(from, {
      text: `😔 Lamento que estés teniendo un inconveniente. Cuéntame qué pasó y haré lo posible por ayudarte.`
    })
    return true
  }

  // 🙏 Agradecimientos
  if (intent === 'thank_you') {
    await sock.sendMessage(from, {
      text: `¡Con gusto! Gracias a ti por confiar en *${empresaConfig.nombre}*. 🖤 Si necesitas algo más, aquí estoy.`
    })
    return true
  }

  // ❓ Preguntas generales
  if (intent === 'question') {
    await sock.sendMessage(from, {
      text: `💬 ¡Buena pregunta! ¿Puedes darme un poco más de contexto para ayudarte mejor? Estoy aquí para ti.`
    })
    return true
  }

  // 👋 Despedida
  if (intent === 'goodbye') {
    await sock.sendMessage(from, {
      text: `¡Hasta pronto! Gracias por visitar *${empresaConfig.nombre}*. Que tengas un excelente día. 👋`
    })
    return true
  }

  // 🌍 Respuesta a ubicación
// Función para eliminar los acentos y normalizar el texto
const removeAccents = (str: string): string =>
  str.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

// Verificar si el mensaje tiene relación con la ubicación
if (['ubicacion', 'donde esta la tienda', 'donde queda la tienda', 'direccion', 'donde esta', 'direccion tienda', 'donde esta ubicada', 'ubicada'].some(keyword => removeAccents(normalized).includes(removeAccents(keyword)))) {
  const { direccion, telefono, correo, ubicacionURL } = empresaConfig.contacto
  await sock.sendMessage(from, {
    text: `🏠 ¡Hola, ${name}! Aquí está la dirección de nuestra tienda:\n\n📍 *Dirección:* ${direccion}\n🔗 Puedes ver nuestra ubicación en el siguiente enlace de Google Maps: ${ubicacionURL}\n📞 Si tienes más preguntas, no dudes en contactarnos a través de:\n📱 *Teléfono:* ${telefono}\n✉️ *Correo:* ${correo}`
  })
  return true
}


  // 🤖 Fallback: sin intención clara pero posible interés comercial
  const fallbackResponse = getCatalogResponse(name, normalized, user?.lastSeen)
  if (!fallbackResponse) {
    await sock.sendMessage(from, {
      text: `🤔 No pude encontrar lo que necesitas. ¿Te gustaría que te ayude con algo específico? Puedo mostrarte nuestra colección de productos, o si tienes alguna pregunta más, ¡estoy aquí para ayudarte!`
    })
  } else {
    await sock.sendMessage(from, { text: fallbackResponse })
  }
  return true
}
