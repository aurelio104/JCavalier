// ✅ src/flows/welcome.flow.ts

import { WASocket, proto } from '@whiskeysockets/baileys'
import { getUser, saveConversationToMongo } from '@memory/memory.mongo'
import { analyzeEmotion, detectIntent, detectarPerfilDeCompra } from '@intelligence/intent.engine'
import { Emotion, BotIntent, UserHistoryEntry, UserMemory } from '@schemas/UserMemory'
import { empresaConfig } from '../config/empresaConfig'

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'buenos días'
  if (hour < 19) return 'buenas tardes'
  return 'buenas noches'
}

function extractName(msg: proto.IWebMessageInfo): string {
  const raw =
    msg.pushName ||
    msg.key.participant?.split('@')[0] ||
    msg.key.remoteJid?.split('@')[0] ||
    'amigo'

  const clean = raw.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]/g, '').trim()
  return clean.length > 0 ? clean : 'cliente'
}

function generateWelcomeMessage(name: string, greeting: string, isNew: boolean): string {
  const newUserMessages = [
    `Hola ${name}, ${greeting} 👋`,
    `Bienvenido ${name} 👋`,
    `Hola ${name} 👋`
  ]

  const returningUserMessages = [
    `Hola ${name}, qué bueno verte.`,
    `Hola ${name}, ¿en qué te ayudo hoy?`,
    `Ey ${name}, bienvenido otra vez 👋`
  ]

  const messages = isNew ? newUserMessages : returningUserMessages
  return messages[Math.floor(Math.random() * messages.length)]
}

export async function handleWelcome(
  text: string,
  sock: WASocket,
  from: string,
  msg: proto.IWebMessageInfo
): Promise<boolean> {
  const normalized = text.toLowerCase().trim()
  const greetingWords = ['hola', 'buenas', 'hello', 'hi', 'hey', '👋', '😊', '🤗']
  const isGreetingLike = greetingWords.some(g => normalized.includes(g))

  const intent: BotIntent = detectIntent(normalized)
  if (intent !== 'greeting' && !isGreetingLike) return false

  const user = await getUser(from)
  const now = Date.now()
  const name = extractName(msg)
  const greeting = getGreeting()
  const isGroup = !!msg.key.participant
  const isNew = !user
  const emotion: Emotion = analyzeEmotion(normalized)
  const perfil = detectarPerfilDeCompra(normalized)
  const frequency: UserMemory['frequency'] = 'ocasional'

  if (isGroup) {
    await sock.sendMessage(from, {
      text: `Hola, soy el asistente de *${empresaConfig.nombre}*.  
Podés escribirme por privado si querés ver productos o consultar el catálogo:  
${empresaConfig.enlaces.catalogo}`
    })
    return true
  }

  const lastShown = user?.ultimoWelcomeShown ? new Date(user.ultimoWelcomeShown).getTime() : 0
  const diffMinutes = (now - lastShown) / 60000
  if (diffMinutes < 5) {
    console.log('⏳ Saludo omitido por ser reciente.')
    return false
  }

  const welcomeMessage = generateWelcomeMessage(name, greeting, isNew)
  await sock.sendMessage(from, { text: welcomeMessage })

  if (isNew) {
    await sock.sendMessage(from, {
      text: `Aquí podés ver todo el catálogo actualizado:
${empresaConfig.enlaces.catalogo}

🖤 También podés preguntarme por camisas, conjuntos, pantalones o lo que estés buscando.`
    })
  }

  const historyEntry: UserHistoryEntry = {
    timestamp: now,
    message: text,
    intent: 'greeting',
    emotion,
    context: isGroup ? 'grupo' : 'privado'
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
    ultimaIntencion: 'greeting',
    profileType: perfil,
    frequency,
    tags: [...new Set([...(user?.tags || []), perfil])],
    history: [...(user?.history || []), historyEntry],
    ultimoWelcomeShown: new Date(now)
  }

  await saveConversationToMongo(from, updatedUser)
  return true
}
