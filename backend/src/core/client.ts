import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  WASocket,
  proto,
} from '@whiskeysockets/baileys'

import qrcode from 'qrcode-terminal'
import pino from 'pino'

import { connectMongo } from '../database/mongo'
import { getUser, updateUser } from '@memory/memory.mongo'
import { manejarEntradaInformativa } from '@handlers/entradaCliente.handler'
import { manejarPedidoDesdeTexto } from '@handlers/pedidoDesdeTexto.handler'
import { manejarImagenComprobante } from '@handlers/imagenComprobante.handler'
import { manejarMetodoPago as manejarSeleccionMetodoPago } from '@handlers/metodoPago.handler'
import { manejarPreguntaInformativa } from '@handlers/preguntaInformativa.handler'
import { manejarFlujoEntregaPorTexto } from '@handlers/flujoEntregaTexto.handler'

// ✅ Instancia global del socket de WhatsApp
let botStarted = false
let globalSock: WASocket | null = null

export const getSock = (): WASocket => {
  if (!globalSock) throw new Error('El socket de WhatsApp aún no está inicializado')
  return globalSock
}

export async function startBot() {
  if (botStarted) return
  botStarted = true

  await connectMongo()
  const { state, saveCreds } = await useMultiFileAuthState(process.env.AUTH_FOLDER || 'auth')
  const { version } = await fetchLatestBaileysVersion()

  const sock: WASocket = makeWASocket({
    version,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, undefined)
    },
    markOnlineOnConnect: true,
    logger: pino({ level: 'silent' }),
    syncFullHistory: false,
    connectTimeoutMs: 45000
  })

  // ✅ Guardar la instancia global del socket
  globalSock = sock

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      console.clear()
      qrcode.generate(qr, { small: true })
    }

    if (connection === 'close') {
      const reasonCode = (lastDisconnect?.error as any)?.output?.statusCode
      console.warn(`⚠️ Desconexión detectada. Código: ${reasonCode}`)
      const shouldReconnect = reasonCode !== DisconnectReason.loggedOut
      if (shouldReconnect) {
        botStarted = false
        console.log('🔄 Reintentando conexión...')
        setTimeout(() => startBot(), 3000)
      } else {
        console.log('🛑 No se reintentará la conexión automáticamente.')
      }
    } else if (connection === 'open') {
      console.clear()
      console.log('✅ Bot conectado a WhatsApp')
    }
  })

  sock.ev.on('messages.upsert', async ({ messages }: { messages: proto.IWebMessageInfo[] }) => {
    try {
      const msg = messages[0]
      if (!msg.message || msg.key.fromMe) return

      const from = typeof msg.key.remoteJid === 'string' ? msg.key.remoteJid.trim() : ''
      const name = msg.pushName || from.split('@')[0] || 'cliente'

      const isImage = !!msg.message?.imageMessage
      const isText = !!msg.message?.conversation

      let rawText = isText ? msg.message.conversation?.trim() || '' : ''

      if (!from || (!rawText && !isImage) || from === 'status@broadcast') return

      const userMemory = await getUser(from)

      const context = { sock, msg, from, name, text: rawText, userMemory }

      const handlers = [
        manejarEntradaInformativa,
        manejarPedidoDesdeTexto,
        manejarImagenComprobante,
        manejarSeleccionMetodoPago,
        manejarPreguntaInformativa,
        manejarFlujoEntregaPorTexto
      ]

      for (const handler of handlers) {
        const result = await handler(context)

        // ✅ Detecta resultado de PDF generado
        if (rawText === '/pago verificado' && result) {
          console.log('✅ PDF generado y enviado a cliente')
          if (userMemory) {
            await updateUser(userMemory._id, { pdfGenerado: true })
          }
        }

        if (result) return
      }
    } catch (err: any) {
      if (err?.message?.includes('Bad MAC')) {
        console.warn('🔐 Bad MAC detectado. El mensaje no pudo ser desencriptado correctamente.')
      } else {
        console.error('❌ Error inesperado en message.upsert:', err)
      }
    }
  })
}
