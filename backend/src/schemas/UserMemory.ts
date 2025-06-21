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
  /** 🆔 Identificador único del usuario (MongoDB) */
  _id: string

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

  // 🧠 CONTEXTO INTELIGENTE Y OPERATIVO
  lastViewedProduct?: string
  lastOrder?: string
  location?: string
  frequency?: 'ocasional' | 'frecuente' | 'recurrente'
  profileType?: 'explorador' | 'comprador directo' | 'indeciso'
  esperandoMetodoEntrega?: boolean
  ultimoResumenPedido?: Date
  flujoActivo?: string | null
  ultimoThankYouShown?: Date
  ultimoWelcomeShown?: Date

  /** ⏳ Última intención manejada (para prevenir repeticiones) */
  ultimoIntentHandled?: { intent: BotIntent, timestamp: number }

  /** 🚚 Estado del pedido (seguimiento) */
  estadoPedido?: 'pendiente' | 'pago_verificado' | 'en_fabrica' | 'empaquetado' | 'enviado' | 'en_camino' | 'entregado' | 'recibido' | 'cancelado'

  /** 🤖 Contacto real del cliente para notificaciones desde el bot */
  contactoCliente?: string
}

/** 🧠 Versión estricta con todos los campos requeridos */
export type CompleteUserMemory = Required<UserMemory>

/** 🧠 Versión con ID (uso en MongoDB .lean(), etc.) */
export interface UserMemoryWithId extends UserMemory {
  _id: string
}
