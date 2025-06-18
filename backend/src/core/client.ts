/// <reference path="../types/manual.d.ts" />

import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  WASocket,
  proto,
  downloadMediaMessage
} from '@whiskeysockets/baileys'

import qrcode from 'qrcode-terminal'
import { connectMongo } from '../database/mongo'
import {
  getUser,
  logUserInteraction,
  saveConversationToMongo
} from '@memory/memory.mongo'

import { detectIntent, analyzeEmotion, detectarPerfilDeCompra } from '@intelligence/intent.engine'
import { generatePersonalizedReply } from '../intelligence/aiResponder'
import { Emotion, BotIntent, UserMemory } from '@schemas/UserMemory'
import {
  contienePedidoDesdeWeb,
  parseOrderMessage
} from '@intelligence/order.detector'
import { paymentActions } from '@flows/payment.flow'
import { deliveryFlow, runDeliveryFlowManualmente } from '@flows/delivery.flow'
import { handleIntentRouter } from '@flows/intentHandler.flow'
import { detectLanguageFromHistory, maybeTranslateToSpanish } from '@utils/lang'
import { quickReacts } from '@utils/responses'
import { empresaConfig } from '../config/empresaConfig'
import { validarComprobante } from '../ocr/ocr.masterValidator'
import { leerTextoDesdeImagen } from '../ocr/ocr.reader'
import { transcribirNotaDeVoz } from '../utils/whisper.engine'
import fs from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'
import os from 'os' 
import pino from 'pino'

const frustrationCounter: Record<string, number> = {}
const MAX_FRUSTRATION = 2

const silentLogger = process.env.NODE_ENV === 'production'
  ? pino({ level: 'silent' }) // sin transport
  : pino({
      level: 'silent',
      transport: {
        target: 'pino-pretty',
        options: { colorize: true }
      }
    })

const removeAccents = (str: string): string =>
  str.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

function calcularFrecuencia(historial: { timestamp: number }[]): 'ocasional' | 'frecuente' | 'recurrente' {
  const now = Date.now()
  const ultimos7dias = historial.filter(h => now - h.timestamp < 7 * 24 * 60 * 60 * 1000)
  if (ultimos7dias.length >= 10) return 'recurrente'
  if (ultimos7dias.length >= 5) return 'frecuente'
  return 'ocasional'
}

export async function startBot() {
  await connectMongo()
  const { state, saveCreds } = await useMultiFileAuthState('auth')
  const { version } = await fetchLatestBaileysVersion()

const sock: WASocket = makeWASocket({
  version,
  auth: {
    creds: state.creds,
    keys: makeCacheableSignalKeyStore(state.keys, undefined)
  },
  markOnlineOnConnect: true,
  logger: undefined, // Activar logs de WhatsApp (baileys)
  syncFullHistory: false, // Opcional, para conexiones más rápidas
  connectTimeoutMs: 45000 // Aumenta timeout a 45 segundos
})


  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      console.clear()
      qrcode.generate(qr, { small: true })
    }

    if (connection === 'close') {
      const shouldReconnect =
        (lastDisconnect?.error as any)?.output?.statusCode !== DisconnectReason.loggedOut
      if (shouldReconnect) startBot()
    } else if (connection === 'open') {
      console.clear()
      console.log('✅ Bot conectado a WhatsApp')
    }
  })

  sock.ev.on('messages.upsert', async ({ messages }: { messages: proto.IWebMessageInfo[] }) => {
    const msg = messages[0]
    if (!msg.message || msg.key.fromMe) return

    const from = typeof msg.key.remoteJid === 'string' ? msg.key.remoteJid.trim() : ''
    const name = msg.pushName || from.split('@')[0] || 'cliente'
    const isImage = !!msg.message?.imageMessage
    const isText = !!msg.message?.conversation
    const isAudio = !!msg.message?.audioMessage && !msg.message?.audioMessage?.ptt === false
    let rawText = isText ? msg.message?.conversation?.trim() || '' : ''

    if (!from || (!rawText && !isImage && !isAudio) || from === 'status@broadcast') return

    if (isAudio) {
      const buffer = await downloadMediaMessage(msg, 'buffer', {})
      const tempPath = path.join(__dirname, `../../temp/${randomUUID()}.mp3`)
      await fs.writeFile(tempPath, buffer)

      const transcripcion = await transcribirNotaDeVoz(tempPath)
      await fs.unlink(tempPath)

      if (!transcripcion || transcripcion.length < 3) {
        await sock.sendMessage(from, {
          text: '⚠️ No pude entender bien tu nota de voz. ¿Podés repetirlo por texto o reenviarla?'
        })
        return
      }

      msg.message.conversation = transcripcion
      rawText = transcripcion
    }

    let userMemory: UserMemory | null = await getUser(from)
    const lang = detectLanguageFromHistory(userMemory?.history?.map(h => h.message) || [], rawText)
    const text = await maybeTranslateToSpanish(rawText, lang)
    const lower = text.toLowerCase()
    const normalized = removeAccents(lower)

    const perfil = detectarPerfilDeCompra(lower)
    const frecuencia = calcularFrecuencia(userMemory?.history || [])

    if (userMemory) {
      userMemory.lastSeen = Date.now()
      userMemory.lastMessage = text
      userMemory.profileType = perfil
      userMemory.frequency = frecuencia
      if (!userMemory.tags.includes(perfil)) userMemory.tags.push(perfil)
    }

    if (quickReacts[lower]) {
      void sock.sendMessage(from, { text: quickReacts[lower] })
      return
    }

    if (lower === 'reset') {
      frustrationCounter[from] = 0
      void sock.sendMessage(from, { text: '🔄 Conversación reiniciada manualmente.' })
      return
    }

    if (contienePedidoDesdeWeb(text)) {
      const resultado = parseOrderMessage(text)

      if (!resultado.esPedidoValido) {
        void sock.sendMessage(from, {
          text: resultado.mensajeAlCliente || '⚠️ No pude interpretar correctamente tu pedido. ¿Podés reenviarlo o escribirlo nuevamente, por favor? 🙏'
        })
        return
      }

      const resumen = resultado.productos.map((p, i) =>
        `🛍️ Producto ${i + 1}:
•⁠ Colección: ${p.coleccion}
•⁠ Nombre: ${p.nombre}
•⁠ Talla: ${p.talla}
•⁠ Color: ${p.color}
•⁠ Precio: ${p.precio}`
      ).join('\n\n')

      const total = resultado.productos.reduce((sum, p) => sum + parseFloat(p.precio), 0)

      userMemory = {
        ...(userMemory || {
          _id: from,
          name,
          firstSeen: Date.now(),
          lastSeen: Date.now(),
          lastMessage: text,
          tags: [],
          history: [],
          emotionSummary: 'neutral',
          needsHuman: false
        }),
        productos: resultado.productos.map(p => p.nombre),
        total: total.toFixed(2),
        ultimaIntencion: 'order',
        fechaUltimaCompra: Date.now(),
        esperandoComprobante: true,
        metodoPago: '',
        tasaBCV: 0,
        totalBs: 0,
        lastOrder: resumen,
        profileType: perfil,
        frequency: frecuencia
      }

      await saveConversationToMongo(from, userMemory)

      void sock.sendMessage(from, {
        text: `✨ Perfecto ${name}, ya tengo tu pedido registrado. Aquí está el resumen completo:\n\n${resumen}\n\n💰 *Total a pagar: $${total.toFixed(2)}*`
      })

      setTimeout(() => {
        void sock.sendMessage(from, {
          text: `¿Cómo prefieres realizar el pago?\n\n1️⃣ *Pago móvil*\n2️⃣ *Transferencia bancaria*\n3️⃣ *Zelle*\n4️⃣ *Binance*\n5️⃣ *Efectivo* (al recibir el producto)`
        })
      }, 1200)

      await logUserInteraction(from, text, 'positive', 'order', name)
      return
    }

    const preguntaDePago = /((metodos?|formas?) de pagos?|como (puedo )?pagar|aceptan|quiero pagar|puedo pagar con|cu[aá]les son los m[ée]todos? de pagos?)/i.test(normalized)
    const esSeleccionDeMetodo = ['pago movil', 'transferencia', 'zelle', 'binance', 'efectivo']
      .some(w => normalized.includes(w)) &&
      userMemory?.ultimaIntencion === 'order' &&
      userMemory?.esperandoComprobante === true

    if (preguntaDePago && !esSeleccionDeMetodo) {
      const metodos = Object.keys(empresaConfig.metodosPago)
        .map((metodo: string) =>
          `✅ ${metodo.replace(/([A-Z])/g, ' $1').replace(/^./, l => l.toUpperCase())}`
        ).join('\n')

      void sock.sendMessage(from, {
        text: `💳 Aceptamos estos métodos de pago:\n\n${metodos}\n\nCuando elijas uno, te enviaré los datos para completar tu pago.`
      })
      return
    }

    if (esSeleccionDeMetodo) {
      const fakeCtx = { from, body: text, pushName: name }

      await paymentActions.pasoProcesarMetodo(fakeCtx, {
        flowDynamic: async (msg: string | string[]) => {
          void sock.sendMessage(from, { text: Array.isArray(msg) ? msg.join('\n\n') : msg })
        },
        gotoFlow: async () => {},
        state: {
          getMyState: async () => userMemory!,
          update: async (d: Partial<UserMemory>) => {
            Object.assign(userMemory!, d)
            await saveConversationToMongo(from, userMemory!)
          },
          clear: async () => {}
        },
        fallBack: async () => {
          void sock.sendMessage(from, { text: 'No entendí tu mensaje, ¿podés repetirlo?' })
        }
      })
      return
    }

if (isImage) {
  userMemory = await getUser(from)
  if (!userMemory) return

  const buffer = await downloadMediaMessage(msg, 'buffer', {})

  const tempDir = process.env.NODE_ENV === 'production'
    ? os.tmpdir()
    : path.join(__dirname, '../../temp')
  const tempPath = path.join(tempDir, `${randomUUID()}.jpg`)

  await fs.writeFile(tempPath, buffer)

  void sock.sendMessage(from, {
    text: `📸 Imagen recibida para análisis. Gracias, ${name}.`
  })

  const textoDetectado = await leerTextoDesdeImagen(tempPath)

  if (!textoDetectado || textoDetectado.trim().length < 10) {
    await fs.unlink(tempPath)
    void sock.sendMessage(from, {
      text: `⚠️ No se pudo leer bien el comprobante. Asegúrate de que la imagen sea clara, que incluya el monto y el método de pago, y vuelve a enviarla.`
    })
    return
  }

  const metodo = userMemory.metodoPago || ''
  const tasaBCV = userMemory.tasaBCV || 0
  const totalEsperadoBs = typeof userMemory.totalBs === 'number'
    ? userMemory.totalBs
    : parseFloat(userMemory.totalBs || '0')

  const resultadoOCR = validarComprobante(
    textoDetectado,
    totalEsperadoBs,
    metodo,
    tasaBCV
  )

  await fs.unlink(tempPath)

  void sock.sendMessage(from, { text: resultadoOCR.resumen })

  if (!resultadoOCR.valido) {
    void sock.sendMessage(from, {
      text: `⚠️ El comprobante no coincide con los datos esperados. Por favor, verifica el monto o el correo y vuelve a intentarlo.`
    })
    return
  }

  // ✔️ Comprobante válido: actualizamos estado
  userMemory.esperandoComprobante = false
  userMemory.ultimaIntencion = 'delivery'
  await saveConversationToMongo(from, userMemory)

  await runDeliveryFlowManualmente(
    { from, body: '', pushName: name },
    {
      flowDynamic: async (msg: string | string[]) => {
        void sock.sendMessage(from, { text: Array.isArray(msg) ? msg.join('\n\n') : msg })
      },
      gotoFlow: async () => {},
      state: {
        getMyState: async () => userMemory!,
        update: async (d: Partial<UserMemory>) => {
          Object.assign(userMemory!, d)
          await saveConversationToMongo(from, userMemory!)
        },
        clear: async () => {}
      },
      fallBack: async () => {
        void sock.sendMessage(from, {
          text: 'No entendí tu mensaje, ¿podés repetirlo?'
        })
      }
    }
  )
  return
}

    if (isText && userMemory?.ultimaIntencion === 'delivery') {
      await runDeliveryFlowManualmente(
        { from, body: text, pushName: name },
        {
          flowDynamic: async (msg: string | string[]) => {
            void sock.sendMessage(from, { text: Array.isArray(msg) ? msg.join('\n\n') : msg })
          },
          gotoFlow: async () => {},
          state: {
            getMyState: async () => userMemory!,
            update: async (d: Partial<UserMemory>) => {
              Object.assign(userMemory!, d)
              await saveConversationToMongo(from, userMemory!)
            },
            clear: async () => {}
          },
          fallBack: async () => {
            void sock.sendMessage(from, { text: 'No entendí tu mensaje, ¿podés repetirlo?' })
          }
        }
      )
      return
    }

    const keywordsUbicacion = [
      'ubicacion', 'ubicacion exacta', 'ubicados', 'direccion', 'direcion', 'donde estan',
      'donde estan ubicados', 'donde queda la tienda', 'como llegar', 'mapa', 'punto de venta'
    ]

    if (keywordsUbicacion.some(k => normalized.includes(k))) {
      const { direccion, telefono, correo, ubicacionURL } = empresaConfig.contacto
      void sock.sendMessage(from, {
        text: `🏠 ¡Hola, ${name}! Aquí está la dirección de nuestra tienda:\n\n📍 *Dirección:* ${direccion}\n🔗 Google Maps: ${ubicacionURL}\n📱 Teléfono: ${telefono}\n✉️ Correo: ${correo}`
      })
      return
    }

    const intentHandled = await handleIntentRouter(text, sock, from, msg)
    if (intentHandled) return

    const emotion: Emotion = analyzeEmotion(text)
    const intent: BotIntent = detectIntent(text)

    await logUserInteraction(from, text, emotion, intent, name)

    frustrationCounter[from] = (frustrationCounter[from] || 0) + 1

    if (frustrationCounter[from] >= MAX_FRUSTRATION) {
      void sock.sendMessage(from, {
        text: 'Veo que no estoy logrando ayudarte bien 😓. ¿Quieres que te conecte con alguien de nuestro equipo?'
      })
      frustrationCounter[from] = 0
      return
    }

    const fallback = await generatePersonalizedReply(from, text)
    void sock.sendMessage(from, { text: fallback })

    if (emotion === 'negative' && intent !== 'complaint') {
      void sock.sendMessage(from, {
        text: 'Percibo que algo no está bien 😔. Si quieres, puedo ayudarte o pasarte con alguien del equipo.'
      })
    }
  })
}
