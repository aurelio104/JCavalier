// src/handlers/metodoPago.handler.ts

import type { UserMemory } from '@schemas/UserMemory'
import { paymentActions } from '@flows/payment.flow'
import { WASocket } from '@whiskeysockets/baileys'

export async function manejarMetodoPago({
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
  if (!userMemory || !userMemory.ultimaIntencion || !userMemory.esperandoComprobante) return false

  const lower = text.toLowerCase()
  const esMetodoPago = ['pago movil', 'transferencia', 'zelle', 'binance', 'efectivo']
    .some(w => lower.includes(w))

  if (!esMetodoPago) return false

  await paymentActions.pasoProcesarMetodo(
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
        update: async (d: Partial<UserMemory>) => {
          Object.assign(userMemory!, d)
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

  return true
}
