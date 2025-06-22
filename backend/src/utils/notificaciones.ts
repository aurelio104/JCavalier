// src/utils/notificaciones.ts

import { WASocket } from '@whiskeysockets/baileys'
import { Pedido } from '@schemas/UserMemory'

export async function notificarEstadoPedido(
  sock: WASocket,
  from: string,
  pedido: Pedido
): Promise<void> {
  const estado = pedido.estado?.replace(/_/g, ' ') ?? 'actualizado'
  const id = pedido.id ?? 'sin ID'
  const seguimiento = pedido.qrUrl
    ? `\n🔍 Puedes hacer seguimiento aquí: ${pedido.qrUrl}`
    : ''

  await sock.sendMessage(from, {
    text: `📦 Tu pedido *#${id}* ahora está *${estado}*.${seguimiento}`
  })
}
