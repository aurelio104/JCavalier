// src/handlers/flujoEntregaTexto.handler.ts

import { runDeliveryFlowManualmente } from '@flows/delivery.flow'
import { saveConversationToMongo } from '@memory/memory.mongo'
import type { UserMemory } from '@schemas/UserMemory'
import { WASocket } from '@whiskeysockets/baileys'

const opcionesEntrega = ['retiro personal', 'delivery', 'encomienda', 'maracay', 'nacional']

export async function manejarFlujoEntregaPorTexto({
  sock,
  from,
  name,
  text,
  userMemory
}: {
  sock: WASocket
  from: string
  name: string
  text: string
  userMemory: UserMemory | null
}): Promise<boolean> {
  if (!userMemory || userMemory.flujoActivo !== 'delivery') return false

  const lower = text.toLowerCase()
  const matchEntrega = opcionesEntrega.some(p => lower.includes(p))

  if (!userMemory.esperandoMetodoEntrega && !matchEntrega) return false

  try {
    await runDeliveryFlowManualmente(
      { from, body: text, pushName: name },
      {
        flowDynamic: async (msg: string | string[]) => {
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
            text: '⚠️ No entendí tu mensaje, ¿podés repetirlo?'
          })
        }
      }
    )
    return true
  } catch (err: any) {
    if (err.message === '__handled_by_delivery_flow__') return true
    console.error('❌ Error inesperado en flujo de delivery por texto:', err)
    return false
  }
}
