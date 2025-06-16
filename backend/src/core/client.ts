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

import { detectIntent, analyzeEmotion } from '@intelligence/intent.engine'
import { generatePersonalizedReply } from '../intelligence/aiResponder'
import { Emotion, BotIntent, UserMemory } from '@schemas/UserMemory'
import {
  contienePedidoDesdeWeb,
  parseOrderMessage
} from '@intelligence/order.detector'
import { paymentActions } from '@flows/payment.flow'
import { deliveryFlow } from '@flows/delivery.flow'
import { handleIntentRouter } from '@flows/intentHandler.flow'
import { detectLanguageFromHistory, maybeTranslateToSpanish } from '@utils/lang'
import { quickReacts } from '@utils/responses'
import { empresaConfig } from '../config/empresaConfig'
import { validarComprobante } from '../ocr/ocr.masterValidator'
import { leerTextoDesdeImagen } from '../ocr/ocr.reader'
import fs from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'

const frustrationCounter: Record<string, number> = {}
const MAX_FRUSTRATION = 2

const silentLogger = {
  level: 'fatal',
  info: () => {},
  error: () => {},
  warn: () => {},
  debug: () => {},
  trace: () => {},
  child: () => silentLogger
}

const removeAccents = (str: string): string =>
  str.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

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
    logger: silentLogger
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
    const rawText = isText ? msg.message?.conversation?.trim() || '' : ''

    if (!from || (!rawText && !isImage) || from === 'status@broadcast') return

    let userMemory: UserMemory | null = await getUser(from)
    const lang = detectLanguageFromHistory(userMemory?.history?.map(h => h.message) || [], rawText)
    const text = await maybeTranslateToSpanish(rawText, lang)
    const lower = text.toLowerCase()

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
          text: '⚠️ No pude interpretar correctamente tu pedido.\n¿Podés reenviarlo o escribirlo nuevamente, por favor? 🙏'
        })
        return
      }

      const resumen = resultado.productos.map((p, i) =>
        `🛍️ Producto ${i + 1}:\n•⁠ Colección: ${p.coleccion}\n•⁠ Nombre: ${p.nombre}\n•⁠ Talla: ${p.talla}\n•⁠ Color: ${p.color}\n•⁠ Precio: ${p.precio}`
      ).join('\n\n')

      const total = resultado.productos.reduce((sum, p) => sum + parseFloat(p.precio), 0)

      userMemory = {
        ...(userMemory || {}),
        name,
        productos: resultado.productos.map(p => p.nombre),
        total: total.toFixed(2),
        ultimaIntencion: 'order',
        fechaUltimaCompra: Date.now(),
        esperandoComprobante: true,
        tasaBCV: 0,
        metodoPago: ''
      } as UserMemory

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

    const esMetodoPago = ['pago', 'transferencia', 'zelle', 'binance', 'efectivo'].some(w =>
      lower.includes(w)
    )

    if (esMetodoPago && userMemory?.ultimaIntencion === 'order') {
      const fakeCtx = { from, body: text, pushName: name }

      await paymentActions.pasoProcesarMetodo(fakeCtx, {
        flowDynamic: async (msg: string | string[]) => {
          void sock.sendMessage(from, { text: Array.isArray(msg) ? msg.join('\n\n') : msg })
        },
        gotoFlow: async () => {},
        state: {
          getMyState: async () => userMemory!,
          update: async (d) => {
            await saveConversationToMongo(from, { ...userMemory!, ...d })
            userMemory = await getUser(from)
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

      const buffer = await downloadMediaMessage(msg, 'buffer', {})
      const tempPath = path.join(__dirname, `../../temp/${randomUUID()}.jpg`)
      await fs.writeFile(tempPath, buffer)

      void sock.sendMessage(from, {
        text: `📸 Imagen recibida para análisis. Gracias, ${name}.`
      })

      const textoDetectado = await leerTextoDesdeImagen(tempPath)
      const totalEsperado = parseFloat(userMemory?.total || '0')
      const tasaBCV = (userMemory as any)?.tasaBCV || 0
      const metodo = (userMemory as any)?.metodoPago || ''
      const resultadoOCR = validarComprobante(textoDetectado, totalEsperado, metodo, tasaBCV)
      await fs.unlink(tempPath)

      void sock.sendMessage(from, { text: resultadoOCR.resumen })

      if (!resultadoOCR.valido) {
        void sock.sendMessage(from, {
          text: `⚠️ El comprobante no coincide con los datos esperados. Por favor, verifica el monto o el correo y vuelve a intentarlo.`
        })
        return
      }

      const fakeCtx = { from, body: '', pushName: name }

      if (typeof (deliveryFlow as any)?.__run === 'function') {
        await (deliveryFlow as any).__run(fakeCtx, {
          flowDynamic: async (msg: string | string[]) => {
            void sock.sendMessage(from, { text: Array.isArray(msg) ? msg.join('\n\n') : msg })
          },
          gotoFlow: async () => {},
          state: {
            getMyState: async () => ({ ...userMemory!, esperandoComprobante: false }),
            update: async () => {
              await saveConversationToMongo(from, {
                ...userMemory!,
                esperandoComprobante: false
              })
            },
            clear: async () => {}
          },
          fallBack: async () => {
            void sock.sendMessage(from, { text: 'No entendí tu mensaje, ¿podés repetirlo?' })
          }
        })
      }

      return
    }

    if (isText && userMemory?.esperandoComprobante) {
      void sock.sendMessage(from, {
        text: '⏳ Seguimos esperando tu *comprobante de pago* para avanzar con la entrega.\nPor favor, envíalo por aquí en cuanto lo tengas. 😊'
      })
      return
    }

    const normalized = removeAccents(lower)
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
