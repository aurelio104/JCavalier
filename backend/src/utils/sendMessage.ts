import { getSock } from '../core/client'

export async function sendEstadoUpdateToCliente(
  telefono: string,
  nombre: string,
  nuevoEstado: string
) {
  const sock = getSock()

  const mensaje = generarMensajePorEstado(nombre, nuevoEstado)

  try {
    await sock.sendMessage(`${telefono}@s.whatsapp.net`, {
      text: mensaje
    })
    console.log(`[✔] Mensaje enviado a ${telefono}`)
  } catch (err) {
    console.error(`[✖] Error enviando mensaje a ${telefono}:`, err)
  }
}

// 🧠 Mensajes personalizados según el estado
function generarMensajePorEstado(nombre: string, estado: string): string {
  switch (estado.toLowerCase()) {
    case 'pago verificado':
      return `💵 Hola ${nombre}, tu pago fue verificado con éxito. Pronto comenzaremos a preparar tu pedido.`
    case 'en fábrica':
      return `🏭 Hola ${nombre}, estamos fabricando tu pedido. Gracias por tu paciencia.`
    case 'empaquetado':
      return `🎁 Hola ${nombre}, tu pedido está siendo cuidadosamente empaquetado.`
    case 'enviado':
      return `📦 Hola ${nombre}, tu pedido ya fue enviado. Pronto recibirás más noticias.`
    case 'en camino':
      return `🚚 Hola ${nombre}, tu pedido ya va en camino. Prepárate para recibirlo.`
    case 'entregado':
      return `✅ Hola ${nombre}, tu pedido ha sido *entregado*. ¡Gracias por tu compra!`
    case 'recibido (cliente)':
      return `🙌 ¡Gracias por confirmar la recepción, ${nombre}! Esperamos que lo disfrutes.`
    case 'cancelado':
      return `❌ Hola ${nombre}, tu pedido ha sido *cancelado*. Si fue un error, contáctanos.`
    default:
      return `📢 Hola ${nombre}, el estado de tu pedido cambió a: *${estado}*.`
  }
}
