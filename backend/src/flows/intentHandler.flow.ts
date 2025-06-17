// ✅ src/flows/intentHandler.flow.ts

import { WASocket, proto, downloadMediaMessage } from '@whiskeysockets/baileys'
import { detectIntent, analyzeEmotion } from '@intelligence/intent.engine'
import { getUser, saveUser } from '@memory/memory.mongo'
import { Emotion, BotIntent, UserHistoryEntry } from '@schemas/UserMemory'
import { handleWelcome } from './welcome.flow'
import { getCatalogResponse } from '@intelligence/catalog.response'
import { detectProductByKeywords } from '@intelligence/product.engine'
import { empresaConfig } from '../config/empresaConfig'
import { transcribirAudio } from '@utils/audio.transcriber'

function buscarProductosPorKeywords(keywords: string): string[] {
  const productosRelacionados = Object.entries(empresaConfig.colecciones)
    .filter(([_, product]) => product.keywords.some(keyword => keywords.includes(keyword)))
    .map(([productName, product]) => `${productName} - $${product.price} - Ver más: ${product.link}`)

  return productosRelacionados
}

const removeAccents = (str: string): string =>
  str.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export async function handleIntentRouter(
  text: string,
  sock: WASocket,
  from: string,
  msg: proto.IWebMessageInfo
): Promise<boolean> {
  let normalized = text.toLowerCase().trim()
  const now = Date.now()
  const name = msg.pushName || from.split('@')[0]

  // 🆕 Verificar si es nota de voz
  const isAudio = !!msg.message?.audioMessage
  if (isAudio) {
    const buffer = await downloadMediaMessage(msg, 'buffer', {})
    const tempAudioPath = `./temp/${from}-${Date.now()}.ogg`
    const fs = await import('fs/promises')
    await fs.writeFile(tempAudioPath, buffer)

    try {
      normalized = await transcribirAudio(tempAudioPath)
    } catch (e) {
      await sock.sendMessage(from, {
        text: '❌ No pude entender tu nota de voz. ¿Podés intentar escribirlo por texto, por favor?' })
      return true
    } finally {
      await fs.unlink(tempAudioPath)
    }
  }

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

  // 🆕 Si usuario responde "sí" a promociones
  if (normalized === 'sí' || normalized === 'si' || normalized.includes('quiero promociones')) {
    updatedUser.tags = Array.from(new Set([...(user?.tags || []), 'suscrito_promociones']))
    await saveUser(updatedUser)
    await sock.sendMessage(from, {
      text: `✅ ¡Perfecto, ${name}! Quedás suscrito para recibir *promociones y novedades* por WhatsApp. ✨🖤`
    })
    return true
  }

  await saveUser(updatedUser)

  const isGreeting = intent === 'greeting'
  const isComercialIntent =
    intent === 'catalog' ||
    intent === 'price' ||
    intent === 'size' ||
    intent === 'order' ||
    (isGreeting && detectedProduct)

  if (isGreeting && !detectedProduct) {
    return await handleWelcome(text, sock, from, msg)
  }

  if (isComercialIntent && !saludoReciente) {
    if (intent === 'price' || detectedProduct) {
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

  if (intent === 'tracking') {
    await sock.sendMessage(from, {
      text: `📦 Si ya hiciste un pedido y quieres saber el estado, indícame tu número de orden o tu nombre completo. Estoy aquí para ayudarte.`
    })
    return true
  }

  if (intent === 'complaint') {
    await sock.sendMessage(from, {
      text: `😔 Lamento que estés teniendo un inconveniente. Cuéntame qué pasó y haré lo posible por ayudarte.`
    })
    return true
  }

  if (intent === 'thank_you') {
    await sock.sendMessage(from, {
      text: `¡Con gusto! Gracias a ti por confiar en *${empresaConfig.nombre}*. 🖤 Si necesitas algo más, aquí estoy.`
    })
    return true
  }

  if (intent === 'question') {
    await sock.sendMessage(from, {
      text: `💬 ¿Qué deseas saber? Aquí tienes opciones para guiarte:

📦 *Envíos*
🧾 *Pagos*
📍 *Ubicación*
📐 *Tallas*
💬 *Otro*` })
    return true
  }

  if (intent === 'goodbye') {
    await sock.sendMessage(from, {
      text: `¡Hasta pronto! Gracias por visitar *${empresaConfig.nombre}*. Que tengas un excelente día. 👋`
    })
    return true
  }

  if ([
    'ubicacion', 'donde esta la tienda', 'donde queda la tienda',
    'direccion', 'donde esta', 'direccion tienda',
    'donde esta ubicada', 'ubicada'
  ].some(keyword => removeAccents(normalized).includes(removeAccents(keyword)))) {
    const { direccion, telefono, correo, ubicacionURL } = empresaConfig.contacto
    await sock.sendMessage(from, {
      text: `🏠 ¡Hola, ${name}! Aquí está la dirección de nuestra tienda:

📍 *Dirección:* ${direccion}
🔗 Google Maps: ${ubicacionURL}
📱 Teléfono: ${telefono}
✉️ Correo: ${correo}`
    })
    return true
  }

  if (normalized.includes('cancelar') || normalized.includes('arrepenti') || normalized.includes('ya no lo quiero')) {
    await sock.sendMessage(from, {
      text: `✅ Tu solicitud para cancelar el pedido fue registrada. Si ya realizaste un pago, por favor indícalo para procesar el reembolso.`
    })
    return true
  }

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