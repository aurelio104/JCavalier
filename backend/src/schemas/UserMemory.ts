/** 🧠 Emociones reconocidas */
export type Emotion = 'positive' | 'neutral' | 'negative'

/** 🧠 Intenciones del usuario reconocidas por el bot */
export type BotIntent =
  | 'greeting'
  | 'thank_you'
  | 'goodbye'
  | 'complaint'
  | 'order'
  | 'catalog'
  | 'price'
  | 'size'
  | 'tracking'
  | 'question'
  | 'other'
  | 'unknown'

/** 🧠 Entrada individual del historial de un usuario */
export interface UserHistoryEntry {
  timestamp: number
  message: string
  emotion: Emotion
  intent: BotIntent
  context?: string
}

/** 🧠 Memoria principal de un usuario */
export interface UserMemory {
  name: string
  firstSeen: number
  lastSeen: number
  lastMessage: string
  tags: string[]
  history: UserHistoryEntry[]
  emotionSummary: Emotion
  needsHuman: boolean

  ultimaIntencion?: BotIntent
  fechaUltimaCompra?: number
  productos?: string[]
  total?: string
  metodoPago?: string
  tipoEntrega?: string
  datosEntrega?: string
  preferredStyles?: string[]       // <-- AGREGADO AQUÍ
  esperandoComprobante?: boolean   // ✅ NUEVO CAMPO
}

/** 🧠 Versión estricta con todos los campos requeridos */
export type CompleteUserMemory = Required<UserMemory>

/** 🧠 Versión con ID (uso en MongoDB .lean(), etc.) */
export interface UserMemoryWithId extends UserMemory {
  _id: string
}
