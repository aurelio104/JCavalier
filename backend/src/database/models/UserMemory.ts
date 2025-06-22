import { Schema, model, Document } from 'mongoose'
import {
  UserMemory,
  UserHistoryEntry,
  Pedido
} from '@schemas/UserMemory'

export interface UserMemoryDoc extends Document, Omit<UserMemory, '_id'> {
  _id: string
}

const HistorySchema = new Schema<UserHistoryEntry>(
  {
    timestamp: { type: Number, required: true },
    message: { type: String, required: true },
    emotion: {
      type: String,
      enum: ['positive', 'neutral', 'negative', 'sad', 'frustrated'],
      required: true
    },
    intent: {
      type: String,
      enum: [
        'greeting', 'thank_you', 'goodbye', 'complaint',
        'order', 'catalog', 'price', 'size', 'tracking',
        'question', 'other', 'unknown', 'delivery'
      ],
      required: true
    },
    context: { type: String, default: 'entrada' }
  },
  { _id: false }
)

const PedidoSchema = new Schema<Pedido>(
  {
    id: { type: String, required: true },
    fecha: { type: Number, required: true },
    productos: [String],
    total: String,
    metodoPago: String,
    tipoEntrega: String,
    datosEntrega: String,
    estado: {
      type: String,
      enum: ['pendiente', 'pago_verificado', 'en_fabrica', 'empaquetado', 'enviado', 'en_camino', 'entregado', 'recibido', 'cancelado'],
      default: 'pendiente'
    },
    tasaBCV: Number,
    totalBs: Number,
    codigoSeguimiento: String,
    pdfGenerado: Boolean,
    qrUrl: String
  },
  { _id: false }
)

const UserMemorySchema = new Schema<UserMemoryDoc>(
  {
    _id: { type: String, required: true },
    name: String,
    firstSeen: Number,
    lastSeen: Number,
    lastMessage: String,
    tags: { type: [String], default: [] },
    history: { type: [HistorySchema], default: [] },
    emotionSummary: {
      type: String,
      enum: ['positive', 'neutral', 'negative', 'sad', 'frustrated'],
      default: 'neutral'
    },
    needsHuman: { type: Boolean, default: false },
    ultimaIntencion: String,
    fechaUltimaCompra: Number,
    productos: { type: [String], default: [] },
    total: String,
    metodoPago: String,
    tipoEntrega: String,
    datosEntrega: String,
    preferredStyles: { type: [String], default: [] },
    esperandoComprobante: Boolean,

    // Pagos
    tasaBCV: Number,
    timestampTasaBCV: Number,
    totalBs: Number,

    // Seguimiento inteligente
    pasoEntrega: Number,
    estadoPedido: String,
    codigoSeguimiento: String,
    pdfGenerado: Boolean,
    ultimoIntentoPDF: Number,

    // Flujo e IA
    flujoActivo: String,
    ultimoFlujoEjecutado: String,
    ultimoThankYouShown: Date,
    ultimoWelcomeShown: Date,
    ultimoResumenPedido: Date,
    ultimoIntentHandled: {
      intent: String,
      timestamp: Number
    },

    // Datos del cliente
    telefono: String,
    contactoCliente: String,
    comentarioCliente: String,
    probableCollection: String,
    location: String,
    frequency: String,
    profileType: String,

    // Campañas
    canalEntrada: String,
    campañasRecibidas: { type: [String], default: [] },

    // Comprobantes
    urlComprobante: String,
    imagenComprobante: String,
    datosPago: {
      referencia: String,
      montoBs: Number,
      fecha: String
    },

    // Pedidos completos
    pedidos: { type: [PedidoSchema], default: [] }
  },
  {
    versionKey: false,
    timestamps: false
  }
)

UserMemorySchema.virtual('id').get(function () {
  return this._id
})

UserMemorySchema.set('toObject', { virtuals: true })
UserMemorySchema.set('toJSON', { virtuals: true })

export const UserMemoryModel = model<UserMemoryDoc>('UserMemory', UserMemorySchema)
