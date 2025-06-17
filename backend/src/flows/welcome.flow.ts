// ✅ src/flows/welcome.flow.ts

import { WASocket, proto } from '@whiskeysockets/baileys'
import { getUser, saveUser } from '@memory/memory.mongo'
import { analyzeEmotion, detectIntent } from '@intelligence/intent.engine'
import { Emotion, BotIntent, UserHistoryEntry } from '@schemas/UserMemory'
import { empresaConfig } from '../config/empresaConfig'

// Función para obtener el saludo adecuado según la hora del día
function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'buenos días'
  if (hour < 19) return 'buenas tardes'
  return 'buenas noches'
}

// Función para extraer el nombre del usuario del mensaje
function extractName(msg: proto.IWebMessageInfo): string {
  return (
    msg.pushName ||
    msg.key.participant?.split('@')[0] ||
    msg.key.remoteJid?.split('@')[0] ||
    'amigo'
  )
}

// Función auxiliar para personalizar el mensaje según la emoción
function getEmocionExtra(emotion: Emotion): string {
  switch (emotion) {
    case 'sad':
      return 'Si necesitás algo, estoy aquí para ayudarte con cariño. 💛'
    case 'frustrated':
      return 'No te preocupes, te voy a ayudar paso a paso. 💪'
    default:
      return 'Contá conmigo para lo que necesités. ✨'
  }
}

// Función para generar el mensaje de bienvenida con emoción
function generateWelcomeMessage(name: string, greeting: string, isNew: boolean, emotion: Emotion): string {
  const emocionExtra = getEmocionExtra(emotion)

  const newUserMessages = [
    `¡Hola ${name}, ${greeting}! 🌟 Bienvenido a ${empresaConfig.nombre}. ${emocionExtra}`,
    `¡Hola ${name}! ${greeting} y bienvenido a ${empresaConfig.nombre}. Si estás buscando algo especial, llegaste al lugar indicado. 🖤`,
    `¡Qué gusto saludarte, ${name}! ${greeting} desde ${empresaConfig.nombre}. Cuéntame qué estás buscando y comenzamos este viaje de estilo.`
  ]

  const returningUserMessages = [
    `¡${name}, qué alegría tenerte de vuelta! ${greeting} 😊 ¿En qué puedo ayudarte hoy?`,
    `¡Hola otra vez ${name}! Siempre es un placer saludarte. ${greeting}`,
    `¡Bienvenido nuevamente, ${name}! Dime cómo puedo asistirte esta vez.`
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

  // Saludos mixtos (Spanglish o emojis)
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

  if (isGroup) {
    await sock.sendMessage(from, {
      text: `¡Hola grupo! 👥 Soy el asistente de ${empresaConfig.nombre}. Escríbanme en privado si quieren ver el catálogo, productos o recibir recomendaciones personalizadas.

También pueden explorar: ${empresaConfig.enlaces.catalogo}`
    })
    return true
  }

  const welcomeMessage = generateWelcomeMessage(name, greeting, isNew, emotion)
  await sock.sendMessage(from, { text: welcomeMessage })

  const historyEntry: UserHistoryEntry = {
    timestamp: now,
    message: text,
    intent: 'greeting',
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
    ultimaIntencion: 'greeting' as BotIntent
  }

  await saveUser(updatedUser)
  return true
}