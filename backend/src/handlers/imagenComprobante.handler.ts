// src/handlers/imagenComprobante.handler.ts

import { WASocket, proto, downloadMediaMessage } from '@whiskeysockets/baileys'
import fs from 'fs/promises'
import os from 'os'
import path from 'path'
import { randomUUID } from 'crypto'

import { getUser, saveConversationToMongo } from '@memory/memory.mongo'
import { leerTextoDesdeImagen } from '../ocr/ocr.reader'
import { validarComprobante } from '../ocr/ocr.masterValidator'
import { runDeliveryFlowManualmente } from '@flows/delivery.flow'
import type { UserMemory } from '@schemas/UserMemory'

export async function manejarImagenComprobante({
  sock,
  msg,
  from,
  name
}: {
  sock: WASocket
  msg: proto.IWebMessageInfo
  from: string
  name: string
}): Promise<boolean> {
  if (!msg.message?.imageMessage) return false

  let userMemory: UserMemory | null = await getUser(from)
  if (!userMemory) return false

  const buffer = await downloadMediaMessage(msg, 'buffer', {})

  const tempDir = process.env.NODE_ENV === 'production'
    ? os.tmpdir()
    : path.join(__dirname, '../../temp')
  const tempPath = path.join(tempDir, `${randomUUID()}.jpg`)
  await fs.writeFile(tempPath, buffer)

  await sock.sendMessage(from, {
    text: `📸 Imagen recibida para análisis. Gracias, ${name}.`
  })

  const textoDetectado = await leerTextoDesdeImagen(tempPath)

  if (!textoDetectado || textoDetectado.trim().length < 10) {
    await fs.unlink(tempPath)
    await sock.sendMessage(from, {
      text: `⚠️ No se pudo leer bien el comprobante. Asegúrate de que la imagen sea clara, que incluya el monto y el método de pago, y vuelve a enviarla.`
    })
    return true
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

  await sock.sendMessage(from, { text: resultadoOCR.resumen })

  if (!resultadoOCR.valido) {
    await sock.sendMessage(from, {
      text: '⚠️ El comprobante no coincide con los datos esperados.\n\nPor favor, asegúrate de que:\n\n• El monto sea correcto\n• El número de referencia sea legible\n• Se vea completo y sin recortes\n\n📸 Podés reenviar la imagen cuando estés listo.'
    })
    return true
  }

  userMemory.esperandoComprobante = false
  userMemory.ultimaIntencion = 'delivery'
  userMemory.esperandoMetodoEntrega = true
  userMemory.flujoActivo = 'delivery'
  if (!userMemory.pasoEntrega || userMemory.pasoEntrega < 1) {
    userMemory.pasoEntrega = 1
  }

  await saveConversationToMongo(from, userMemory)

  try {
    await runDeliveryFlowManualmente(
      { from, body: '', pushName: name },
      {
        flowDynamic: async (msg) => {
          await sock.sendMessage(from, {
            text: Array.isArray(msg) ? msg.join('\n\n') : msg
          })
        },
        gotoFlow: async () => {},
        state: {
          getMyState: async () => userMemory!,
          update: async (d) => {
            Object.assign(userMemory!, d)
            await saveConversationToMongo(from, userMemory!)
          },
          clear: async () => {}
        },
        fallBack: async () => {
          await sock.sendMessage(from, {
            text: 'No entendí tu mensaje, ¿podés repetirlo?'
          })
        }
      }
    )
  } catch (err: any) {
    if (err.message !== '__handled_by_delivery_flow__') {
      console.error('❌ Error inesperado en flujo de delivery:', err)
    }
  }

  return true
}
