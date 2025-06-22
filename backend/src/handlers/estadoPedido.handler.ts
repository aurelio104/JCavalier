import { generarPDFPedido } from '../utils/pdf.generator'
import { UserMemoryModel, UserMemoryDoc, Pedido } from '../schemas/UserMemory'
import { Boom } from '@hapi/boom'

// ✅ Función auxiliar para validar estados
const estadosValidos: Pedido['estado'][] = [
  'pendiente',
  'pago_verificado',
  'en_fabrica',
  'empaquetado',
  'enviado',
  'en_camino',
  'entregado',
  'recibido',
  'cancelado'
]

function esEstadoValido(estado: string): estado is Pedido['estado'] {
  return estadosValidos.includes(estado as Pedido['estado'])
}

/**
 * Cambia el estado de un pedido del usuario
 */
export async function actualizarEstadoPedido({
  telefono,
  pedidoId,
  nuevoEstado,
  sock
}: {
  telefono: string
  pedidoId: string
  nuevoEstado: string
  sock: any
}): Promise<void> {
  try {
    const user: UserMemoryDoc | null = await UserMemoryModel.findOne({ telefono })

    if (!user) {
      throw new Boom(`Usuario con teléfono ${telefono} no encontrado.`)
    }

    if (!user.pedidos || !Array.isArray(user.pedidos)) {
      throw new Boom(`El usuario no tiene ningún pedido registrado.`)
    }

    const pedido: Pedido | undefined = user.pedidos.find((p: Pedido) => p.id === pedidoId)

    if (!pedido) {
      throw new Boom(`Pedido con ID ${pedidoId} no encontrado para este usuario.`)
    }

    if (!esEstadoValido(nuevoEstado)) {
      throw new Boom(`Estado "${nuevoEstado}" no es válido.`)
    }

    pedido.estado = nuevoEstado
    await user.save()

    if (nuevoEstado === 'pago_verificado') {
      const pdfBuffer = await generarPDFPedido(user, pedido)
      const jid = telefono.includes('@s.whatsapp.net') ? telefono : `${telefono}@s.whatsapp.net`

      await sock.sendMessage(jid, {
        document: pdfBuffer,
        mimetype: 'application/pdf',
        fileName: `Pedido-${pedido.id}.pdf`,
        caption: '✅ ¡Pago verificado! Aquí tienes tu confirmación con código QR de seguimiento.'
      })
    }
  } catch (err) {
    console.error('❌ Error al actualizar estado del pedido:', err)
    throw err
  }
}
