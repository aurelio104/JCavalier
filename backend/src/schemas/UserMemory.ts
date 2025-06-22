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
  | 'payment'
  | 'cancel'
  | 'repeat_order'

/** 🧠 Entrada individual del historial de un usuario */
export interface UserHistoryEntry {
  timestamp: number
  message: string
  emotion: Emotion
  intent: BotIntent
  context?: string
}

/** 💼 Representación individual de un pedido */
export interface Pedido {
  id: string
  fecha: number
  productos: string[]
  total: string
  metodoPago: string
  tipoEntrega?: string
  datosEntrega?: string
  estado:
    | 'pendiente'
    | 'pago_verificado'
    | 'en_fabrica'
    | 'empaquetado'
    | 'enviado'
    | 'en_camino'
    | 'entregado'
    | 'recibido'
    | 'cancelado'
  tasaBCV?: number
  totalBs?: number
  codigoSeguimiento?: string
  pdfGenerado?: boolean
  qrUrl?: string
  comentario?: string
  urlComprobante?: string
  datosPago?: {
    referencia?: string
    montoBs?: number
    fecha?: string
  }
  creadoDesde?: 'whatsapp' | 'web' | 'admin' | 'api'
  canalOrigen?: string
  nombreCliente?: string
  telefonoCliente?: string
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
  ultimoIntentHandled?: { intent: BotIntent, timestamp: number }

  estadoPedido?: Pedido['estado']
  contactoCliente?: string
  probableCollection?: string
  intentosSinIntencion?: number
  telefono?: string
  codigoSeguimiento?: string
  comentarioCliente?: string
  urlComprobante?: string
  imagenComprobante?: string

  datosPago?: {
    referencia?: string
    montoBs?: number
    fecha?: string
  }

  ultimoIntentoPDF?: number
  ultimoFlujoEjecutado?: string
  pdfGenerado?: boolean

  pedidos?: Pedido[]

  // 📲 Interacciones externas (redes sociales, Instagram, email...)
  canalEntrada?: 'whatsapp' | 'instagram' | 'web' | 'email' | 'tiktok'
  referenciasExternas?: {
    instagramUser?: string
    email?: string
    handle?: string
  }

  // 🎯 Personalización futura para campañas de remarketing
  intereses?: string[]
  carritoTemporal?: string[]
  campañasRecibidas?: string[]
}

/** 🧠 Versión estricta con todos los campos requeridos */
export type CompleteUserMemory = Required<UserMemory>

/** 🧠 Versión con ID (uso en MongoDB .lean(), etc.) */
export interface UserMemoryWithId extends UserMemory {
  _id: string
}

//
// ✅ SCHEMA + MODEL para Mongoose
//
import { Schema, model, Document } from 'mongoose'

export interface UserMemoryDoc extends Document, Omit<UserMemory, '_id'> {}

const UserMemorySchema = new Schema<UserMemoryDoc>({
  telefono: { type: String, required: true },
  name: { type: String },
  pedidos: { type: Array, default: [] }
  // puedes extender esto con más campos si deseas persistirlos
})

export const UserMemoryModel = model<UserMemoryDoc>('UserMemory', UserMemorySchema)
