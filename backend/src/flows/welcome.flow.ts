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
    'amigo'  // Valor por defecto si no se puede extraer el nombre
  )
}

// Función para generar el mensaje de bienvenida
function generateWelcomeMessage(name: string, greeting: string, isNew: boolean): string {
  const newUserMessages = [
    `¡Hola ${name}, ${greeting}! 🌟 Bienvenido a ${empresaConfig.nombre}. Estoy aquí para ayudarte con lo que necesites. Pregúntame con confianza.`,
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
  const intent: BotIntent = detectIntent(normalized)

  // Si no es un saludo, retornamos false para que el flujo continúe con otro manejador
  if (intent !== 'greeting') return false

  const user = await getUser(from)
  const now = Date.now()
  const name = extractName(msg) // Extraemos el nombre del usuario
  const greeting = getGreeting() // Aquí llamamos a la función para obtener el saludo dependiendo de la hora.
  const isGroup = !!msg.key.participant
  const isNew = !user // Verificamos si el usuario es nuevo o recurrente

  // 👥 Manejo de grupos
  if (isGroup) {
    await sock.sendMessage(from, {
      text: `¡Hola grupo! 👥 Soy el asistente de ${empresaConfig.nombre}. Escríbanme en privado si quieren ver el catálogo, productos o recibir recomendaciones personalizadas.\n\nTambién pueden explorar: ${empresaConfig.enlaces.catalogo}`
    })
    return true
  }

  // 👋 Enviar saludo emocional
  const welcomeMessage = generateWelcomeMessage(name, greeting, isNew)
  await sock.sendMessage(from, { text: welcomeMessage })

  // 🧠 Registro en memoria del usuario
  const emotion: Emotion = analyzeEmotion(normalized)
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
    ultimaIntencion: intent
  }

  await saveUser(updatedUser)
  return true
}
