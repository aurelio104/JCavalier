import { UserMemoryModel } from '@models/UserMemory'
import {
  UserHistoryEntry,
  BotIntent,
  Emotion,
  UserMemory,
  UserMemoryWithId
} from '@schemas/UserMemory'

const MAX_HISTORY_LENGTH = 100

/** 🧠 Obtener un usuario desde MongoDB */
export async function getUser(id: string): Promise<UserMemoryWithId | null> {
  const result = await UserMemoryModel.findById(id).lean()
  if (!result) return null

  return {
    ...result,
    _id: String(result._id)
  } as UserMemoryWithId
}

/** 🧠 Guardar o actualizar un usuario con validaciones fuertes */
export async function saveUser(user: Partial<UserMemoryWithId>): Promise<void> {
  const safeId = user._id?.trim()
  const safeMessage = user.lastMessage?.trim()

  if (!safeId || !safeMessage) {
    console.warn('[saveUser] Ignorado por datos inválidos:', {
      id: safeId,
      lastMessage: user.lastMessage
    })
    return
  }

  const validHistory: UserHistoryEntry[] = (user.history || []).filter(
    (h) =>
      typeof h.message === 'string' &&
      h.message.trim().length > 0 &&
      typeof h.timestamp === 'number' &&
      typeof h.intent === 'string' &&
      typeof h.emotion === 'string'
  )

  const updatePayload: Partial<UserMemory> = {
    lastMessage: safeMessage,
    history: validHistory,
    emotionSummary: user.emotionSummary ?? 'neutral',
    needsHuman: user.needsHuman ?? false,
    ultimaIntencion: user.ultimaIntencion,
    tags: user.tags,
    fechaUltimaCompra: user.fechaUltimaCompra,
    productos: user.productos,
    total: '',
    metodoPago: '',
    tipoEntrega: '',
    datosEntrega: '',
    lastViewedProduct: user.lastViewedProduct,
    lastOrder: user.lastOrder,
    frequency: user.frequency,
    location: user.location,
    profileType: ['explorador', 'comprador directo', 'indeciso'].includes(user.profileType || '')
      ? user.profileType
      : undefined
  }

  await UserMemoryModel.findByIdAndUpdate(safeId, updatePayload, { upsert: true })
}

/** 🧠 Registrar una nueva interacción del usuario */
export async function logUserInteraction(
  id: string,
  text: string,
  emotion: Emotion,
  intent: BotIntent,
  name: string,
  context: string = 'entrada',
  extraTag?: string
): Promise<void> {
  const now = Date.now()
  const safeId = id.trim()
  const safeText = text.trim()

  if (!safeId || !safeText) {
    console.warn('[logUserInteraction] Ignorado por datos inválidos:', { id, text })
    return
  }

  const historyEntry: UserHistoryEntry = {
    timestamp: now,
    message: safeText,
    emotion,
    intent,
    context
  }

  const existing = await UserMemoryModel.findById(safeId).lean()

  let intentTag: string | null = null
  switch (intent) {
    case 'price':
      intentTag = 'interesado_en_precios'
      break
    case 'size':
      intentTag = 'buscando_talla'
      break
    case 'tracking':
      intentTag = 'interesado_en_envio'
      break
  }

  const newTags: string[] = [intentTag, extraTag].filter((tag): tag is string => typeof tag === 'string')

  if (!existing) {
    const newUser: UserMemoryWithId = {
      _id: safeId,
      name: name || 'Desconocido',
      firstSeen: now,
      lastSeen: now,
      lastMessage: safeText,
      tags: newTags,
      history: [historyEntry],
      emotionSummary: emotion,
      needsHuman: false,
      ultimaIntencion: intent,
      productos: [],
      total: '',
      metodoPago: '',
      tipoEntrega: '',
      datosEntrega: '',
      lastViewedProduct: '',
      lastOrder: '',
      frequency: 'ocasional',
      location: '',
      profileType: undefined
    }

    await UserMemoryModel.create(newUser)
  } else {
    const previousHistory: UserHistoryEntry[] = Array.isArray(existing.history)
      ? existing.history.filter(
          (h) =>
            typeof h.message === 'string' &&
            h.message.trim().length > 0 &&
            typeof h.timestamp === 'number' &&
            typeof h.intent === 'string' &&
            typeof h.emotion === 'string'
        )
      : []

    const trimmedHistory: UserHistoryEntry[] = [...previousHistory, historyEntry].slice(-MAX_HISTORY_LENGTH)

    const updatedTags: string[] = Array.from(
      new Set([...(existing.tags || []), ...newTags])
    )

    const update: Partial<UserMemory> = {
      name: name || existing.name,
      lastSeen: now,
      lastMessage: safeText,
      emotionSummary: emotion,
      ultimaIntencion: intent,
      history: trimmedHistory,
      tags: updatedTags
    }

    await UserMemoryModel.findByIdAndUpdate(safeId, update, { new: true })
  }
}

/** 🧠 Guardar cualquier actualización parcial desde otros flujos */
export async function saveConversationToMongo(
  id: string,
  data: Partial<UserMemory>
): Promise<void> {
  if (!id?.trim()) {
    console.warn('[saveConversationToMongo] ID inválido:', id)
    return
  }

  await UserMemoryModel.findByIdAndUpdate(id.trim(), data, {
    upsert: true,
    new: true
  })
}

/** 🧠 Guardar feedback de usuario en una colección aparte */
export async function saveFeedbackToMongo(data: {
  userId: string
  message: string
  emotion: Emotion
  origin: string
  timestamp: Date
}): Promise<void> {
  try {
    const collection = UserMemoryModel.db.collection('feedback')
    await collection.insertOne(data)
  } catch (error) {
    console.error('[saveFeedbackToMongo] Error al guardar feedback:', error)
  }
}
