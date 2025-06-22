import { WASocket, proto, downloadMediaMessage } from '@whiskeysockets/baileys'
import { detectIntent, getPrimaryIntent, analyzeEmotion } from '@intelligence/intent.engine'
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

function isComercialIntent(intent: BotIntent): boolean {
  return ['catalog', 'price', 'size', 'order'].includes(intent)
}

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

  const intents = detectIntent(normalized)
  const intent = getPrimaryIntent(intents)
  const emotion: Emotion = analyzeEmotion(normalized)
  const detectedProduct = detectProductByKeywords(normalized)

  let probableCollection = user?.tags?.includes('probable_sun_set') ? 'Sun Set' : ''
  if (normalized.includes('conjunto') && normalized.includes('playa')) {
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
  updatedUser.tags = Array.from(tagsSet)

  await saveUser(updatedUser)

  if (intent === 'greeting') {
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

  const response = getCatalogResponse(name, normalized, user?.lastSeen)
  if (response) {
    await sock.sendMessage(from, { text: response })
    return true
  }

  return false
}
