// ✅ src/schemas/UserMemory.ts

// Tipos emocionales detectados por el analizador
export type Emotion = 'positive' | 'neutral' | 'negative'

// Intenciones posibles detectadas por el bot
export type BotIntent =
  // Conversacionales
  | 'greeting'
  | 'thank_you'
  | 'goodbye'
  | 'complaint'

  // Comerciales
  | 'order'
  | 'catalog'
  | 'price'
  | 'size'
  | 'tracking'

  // Técnicas / Otros
  | 'question'
  | 'other'
  | 'unknown'

// Entrada única en el historial del usuario
export interface UserHistoryEntry {
  timestamp: number
  message: string
  emotion: Emotion
  intent: BotIntent
  context?: string
}

// Estado completo del usuario (sin campo 'id', manejado por Mongoose con '_id')
export interface UserMemory {
  name: string
  firstSeen: number
  lastSeen: number
  lastMessage: string
  tags: string[]
  history: UserHistoryEntry[]
  emotionSummary: Emotion
  needsHuman: boolean

  // Campos opcionales para afinidad/emoción futura
  preferredStyles?: string[]
  lastIntent?: BotIntent
}
