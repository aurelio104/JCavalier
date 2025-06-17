/** 🧠 Emociones reconocidas */
export type Emotion = 'positive' | 'neutral' | 'negative' | 'sad' | 'frustrated'

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
  | 'delivery'

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
  preferredStyles?: string[]
  esperandoComprobante?: boolean
  tasaBCV?: number
  totalBs?: number
  timestampTasaBCV?: number
  pasoEntrega?: number

  // 🆕 CAMPOS NUEVOS PARA CONTEXTO INTELIGENTE
  lastViewedProduct?: string           // Último producto visto o consultado
  lastOrder?: string                   // Último pedido confirmado (formato corto o string libre)
  location?: string                    // Zona geográfica habitual del cliente
  frequency?: 'ocasional' | 'frecuente' | 'recurrente' // Frecuencia de interacción
  profileType?: 'explorador' | 'comprador directo' | 'indeciso' // Perfil de comportamiento comercial
}

/** 🧠 Versión estricta con todos los campos requeridos */
export type CompleteUserMemory = Required<UserMemory>

/** 🧠 Versión con ID (uso en MongoDB .lean(), etc.) */
export interface UserMemoryWithId extends UserMemory {
  _id: string
}
