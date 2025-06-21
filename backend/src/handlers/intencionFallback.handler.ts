// src/handlers/intencionFallback.handler.ts

import { detectIntent, analyzeEmotion } from '@intelligence/intent.engine'
import { generatePersonalizedReply } from '@intelligence/aiResponder'
import { logUserInteraction } from '@memory/memory.mongo'
import type { BotIntent, Emotion, UserMemory } from '@schemas/UserMemory'
import { WASocket } from '@whiskeysockets/baileys'

const MAX_FRUSTRATION = 2
const frustrationCounter: Record<string, number> = {}

export async function manejarFallbackInteligente({
  sock,
  from,
  name,
  text,
  userMemory
}: {
  sock: WASocket
  from: string
  name: string
  text: string
  userMemory: UserMemory | null
}): Promise<boolean> {
  const emotion: Emotion = analyzeEmotion(text)
  const intent: BotIntent = detectIntent(text)

  await logUserInteraction(from, text, emotion, intent, name)

  frustrationCounter[from] = (frustrationCounter[from] || 0) + 1

  const respuesta = await generatePersonalizedReply(from, text)

  await sock.sendMessage(from, { text: respuesta })

  if (emotion === 'negative' && intent !== 'complaint') {
    await sock.sendMessage(from, {
      text: '😔 Percibo que algo no está bien. Si deseas, puedo ayudarte o pasarte con alguien de nuestro equipo.'
    })
  }

  if (frustrationCounter[from] >= MAX_FRUSTRATION) {
    await sock.sendMessage(from, {
      text: 'Veo que no estoy logrando ayudarte bien 😓. ¿Quieres que te conecte con alguien de nuestro equipo?'
    })
    frustrationCounter[from] = 0
  }

  return true
}
