// ✅ src/flows/intentHandler.flow.ts

import { WASocket, proto, downloadMediaMessage } from '@whiskeysockets/baileys'
import { detectIntent, analyzeEmotion } from '@intelligence/intent.engine'
import { getUser, saveUser } from '@memory/memory.mongo'
import { Emotion, BotIntent, UserHistoryEntry, UserMemory } from '@schemas/UserMemory'
import { handleWelcome } from './welcome.flow'
import { getCatalogResponse } from '@intelligence/catalog.response'
import { detectProductByKeywords } from '@intelligence/product.engine'
import { empresaConfig } from '../config/empresaConfig'
import { transcribirAudio } from '@utils/audio.transcriber'

function buscarProductosPorKeywords(keywords: string): string[] {
  return Object.entries(empresaConfig.colecciones)
    .filter(([_, product]) => product.keywords.some(keyword => keywords.includes(keyword)))
    .map(([productName, product]) => `${productName} - $${product.price} - Ver más: ${product.link}`)
}

const removeAccents = (str: string): string =>
  str.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

export async function handleIntentRouter(
  text: string,
  sock: WASocket,
  from: string,
  msg: proto.IWebMessageInfo
): Promise<boolean> {
  let normalized = text.toLowerCase().trim()
  const now = Date.now()
  const rawName = msg.pushName || from.split('@')[0]
  const name = rawName.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]/g, '').trim() || 'cliente'

  const isAudio = !!msg.message?.audioMessage
  if (isAudio) {
    const buffer = await downloadMediaMessage(msg, 'buffer', {})
    const tempAudioPath = `./temp/${from}-${Date.now()}.ogg`
    const fs = await import('fs/promises')
    await fs.writeFile(tempAudioPath, buffer)

    try {
      normalized = await transcribirAudio(tempAudioPath)
    } catch {
      await sock.sendMessage(from, { text: '❌ No entendí tu nota de voz. ¿Podés escribirlo?' })
      return true
    } finally {
      await fs.unlink(tempAudioPath)
    }
  }

  const user = await getUser(from)
  const lastSeen = user?.lastSeen ?? 0
  const saludoReciente = now - lastSeen < 2 * 60 * 1000

  const flujoActivo = user?.flujoActivo
  const pasoEntrega = user?.pasoEntrega ?? 0
  const excepcionesDelivery = ['retiro personal', 'delivery', 'encomienda']

  if (
    flujoActivo === 'delivery' &&
    pasoEntrega > 0 &&
    !excepcionesDelivery.some(k => normalized.includes(k))
  ) return false

  let intent: BotIntent = detectIntent(normalized)
  const emotion: Emotion = analyzeEmotion(normalized)
  const detectedProduct = detectProductByKeywords(normalized)

  let probableCollection = user?.tags?.includes('probable_sun_set') ? 'Sun Set' : ''
  if (normalized.includes('conjunto') && normalized.includes('playa')) {
    intent = 'price'
    probableCollection = 'Sun Set'
  }

  const handledRecently =
    user?.ultimoIntentHandled?.intent === intent &&
    now - user.ultimoIntentHandled.timestamp < 3 * 60 * 1000

  if (handledRecently) return true

  const historyEntry: UserHistoryEntry = {
    timestamp: now,
    message: text,
    intent,
    emotion,
    context: 'entrada'
  }

  const intentosSinIntencion = (user?.tags?.includes('sin_intencion_1') ? 1 : 0)

  const updatedUser: UserMemory = {
    ...(user || {
      _id: from,
      name,
      firstSeen: now,
      tags: [],
      history: [],
      emotionSummary: emotion,
      needsHuman: false
    }),
    lastSeen: now,
    lastMessage: text,
    ultimaIntencion: intent,
    history: [...(user?.history || []), historyEntry],
    emotionSummary: emotion,
    ultimoIntentHandled: { intent, timestamp: now }
  }

  const tagsSet = new Set([...(user?.tags || [])])
  if (probableCollection === 'Sun Set') tagsSet.add('probable_sun_set')
  if (!['greeting', 'catalog', 'price', 'size', 'order', 'question'].includes(intent)) {
    tagsSet.add('sin_intencion_1')
  } else {
    tagsSet.delete('sin_intencion_1')
  }
  updatedUser.tags = Array.from(tagsSet)

  if (normalized === 'sí' || normalized === 'si' || normalized.includes('quiero promociones')) {
    updatedUser.tags = Array.from(new Set([...updatedUser.tags, 'suscrito_promociones']))
    await saveUser(updatedUser)
    await sock.sendMessage(from, { text: `✅ Suscrito a promociones, ${name}.` })
    return true
  }

  await saveUser(updatedUser)

  const isGreeting = intent === 'greeting'
  const isComercialIntent = ['catalog', 'price', 'size', 'order'].includes(intent)

  if (isGreeting) {
    await handleWelcome(text, sock, from, msg)

    if (detectedProduct) {
      const productosRelacionados = buscarProductosPorKeywords(normalized)
      if (productosRelacionados.length > 0) {
        await sock.sendMessage(from, {
          text: `🛍️ Mira esto:\n${productosRelacionados.join('\n\n')}`
        })
      }
    }
    return true
  }

  if (isComercialIntent && !saludoReciente) {
    if (intent === 'price' || detectedProduct || probableCollection) {
      if (probableCollection === 'Sun Set') {
        await sock.sendMessage(from, {
          text: `☀️ Tenemos conjuntos frescos ideales para clima playero, como la colección *Sun Set*.\n👉 ${empresaConfig.enlaces.catalogo}`
        })
        return true
      }

      const productosRelacionados = buscarProductosPorKeywords(normalized)
      if (productosRelacionados.length > 0) {
        await sock.sendMessage(from, {
          text: productosRelacionados.join('\n\n')
        })
        return true
      } else {
        await sock.sendMessage(from, { text: `No encontré productos relacionados.` })
        return true
      }
    }
    const response = getCatalogResponse(name, normalized, user?.lastSeen)
    await sock.sendMessage(from, { text: response })
    return true
  }

  if (intent === 'tracking') {
    await sock.sendMessage(from, {
      text: `📦 Para rastrear tu pedido, indícame tu número de orden o nombre completo.`
    })
    return true
  }

  if (intent === 'complaint') {
    await sock.sendMessage(from, {
      text: emotion === 'frustrated'
        ? '😣 Lo resolvemos enseguida.'
        : '😔 Te ayudo con eso.'
    })
    return true
  }

  if (intent === 'thank_you') {
    await sock.sendMessage(from, {
      text: `¡Gracias por tu confianza en *${empresaConfig.nombre}*!` })
    return true
  }

  if (intent === 'question') {
    await sock.sendMessage(from, {
      text: `💬 ¿Qué querés saber?\n\n📦 Envíos\n🧾 Pagos\n📍 Ubicación\n📐 Tallas\n💬 Otro`
    })
    return true
  }

  if (intent === 'goodbye') {
    await sock.sendMessage(from, {
      text: `👋 Gracias por visitarnos. ¡Hasta pronto!`
    })
    return true
  }

  if (normalized.includes('cancelar') || normalized.includes('arrepenti') || normalized.includes('ya no lo quiero')) {
    await sock.sendMessage(from, {
      text: `✅ Pedido cancelado. Si pagaste, avisame para gestionar el reembolso.`
    })
    return true
  }

  if (intentosSinIntencion >= 1 && intent !== 'greeting') {
    await sock.sendMessage(from, {
      text: `Veo que no estoy logrando ayudarte bien 😓. ¿Querés que te conecte con alguien de nuestro equipo?`
    })
  } else {
    const fallbackResponse = getCatalogResponse(name, normalized, user?.lastSeen)
    await sock.sendMessage(from, {
      text: fallbackResponse || `🤔 No encontré eso. ¿Querés ver el catálogo?`
    })
  }

  return true
}
