import { Schema, model, Document } from 'mongoose'
import {
  UserMemory,
  UserHistoryEntry,
  Emotion,
  BotIntent
} from '@schemas/UserMemory'

// Interfaz del documento completo de usuario para MongoDB
export interface UserMemoryDoc extends Document {
  _id: string
  id?: string
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
  productos: string[]
  total: string
  metodoPago: string
  tipoEntrega: string
  datosEntrega: string
  preferredStyles?: string[]
  esperandoComprobante?: boolean

  // Campos para pagos
  tasaBCV?: number
  timestampTasaBCV?: number
  totalBs?: number
}

const HistorySchema = new Schema<UserHistoryEntry>(
  {
    timestamp: { type: Number, required: true },
    message: { type: String, required: true },
    emotion: {
      type: String,
      enum: ['positive', 'neutral', 'negative'],
      required: true
    },
    intent: {
      type: String,
      enum: [
        'greeting', 'thank_you', 'goodbye', 'complaint',
        'order', 'catalog', 'price', 'size', 'tracking',
        'question', 'other', 'unknown'
      ],
      required: true
    },
    context: { type: String, default: 'entrada' }
  },
  { _id: false }
)

const UserMemorySchema = new Schema<UserMemoryDoc>(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    firstSeen: { type: Number, required: true },
    lastSeen: { type: Number, required: true },
    lastMessage: { type: String, required: true },
    tags: { type: [String], default: [] },
    history: { type: [HistorySchema], default: [] },
    emotionSummary: {
      type: String,
      enum: ['positive', 'neutral', 'negative'],
      default: 'neutral'
    },
    needsHuman: { type: Boolean, default: false },
    ultimaIntencion: {
      type: String,
      enum: [
        'greeting', 'thank_you', 'goodbye', 'complaint',
        'order', 'catalog', 'price', 'size', 'tracking',
        'question', 'other', 'unknown'
      ],
      default: 'unknown'
    },
    fechaUltimaCompra: { type: Number, default: null },
    productos: { type: [String], default: [] },
    total: { type: String, default: '' },
    metodoPago: { type: String, default: '' },
    tipoEntrega: { type: String, default: '' },
    datosEntrega: { type: String, default: '' },
    preferredStyles: { type: [String], default: [] },
    esperandoComprobante: { type: Boolean, default: false },

    // Campos para pagos
    tasaBCV: { type: Number, default: null },
    timestampTasaBCV: { type: Number, default: null },
    totalBs: { type: Number, default: null }
  },
  {
    versionKey: false,
    timestamps: false
  }
)

// Campo virtual para compatibilidad _id → id
UserMemorySchema.virtual('id').get(function () {
  return this._id
})

// Activar los virtuals al convertir a objeto o JSON
UserMemorySchema.set('toObject', { virtuals: true })
UserMemorySchema.set('toJSON', { virtuals: true })

// Exportar el modelo
export const UserMemoryModel = model<UserMemoryDoc>('UserMemory', UserMemorySchema)
