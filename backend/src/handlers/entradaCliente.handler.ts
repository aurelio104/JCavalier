import { WASocket, proto } from '@whiskeysockets/baileys'
import { empresaConfig } from '../config/empresaConfig'
import { obtenerTasaBCV } from '@flows/payment.flow'
import { getUser, updateUser } from '@memory/memory.mongo'
import { generarPDFPedido } from '../utils/pdf.generator'
import { Pedido } from '@schemas/UserMemory'
import { notificarEstadoPedido } from '@utils/notificaciones'

const removeAccents = (str: string): string =>
  str.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()

export async function manejarEntradaInformativa({
  sock,
  msg,
  from,
  text,
  name
}: {
  sock: WASocket
  msg: proto.IWebMessageInfo
  from: string
  text: string
  name: string
}): Promise<boolean> {
  const normalized = removeAccents(text)
  const comando = text.trim().toLowerCase()
  const botNumber = sock.user?.id?.split(':')[0]
  const userMemory = await getUser(from)
  if (!userMemory) return false

  const displayName = userMemory?.name || name || from.split('@')[0]

  // 🗂️ Ver pedidos recientes
  if (comando === '/ver pedidos') {
    if (!Array.isArray(userMemory.pedidos) || userMemory.pedidos.length === 0) {
      await sock.sendMessage(from, {
        text: '📭 No tienes pedidos registrados todavía. Cuando hagas uno, aparecerá aquí.'
      })
      return true
    }

    const pedidosOrdenados = [...userMemory.pedidos].sort((a, b) => (b.fecha || 0) - (a.fecha || 0))
    const resumen = pedidosOrdenados.slice(0, 5).map((p, i) => {
      const estado = p.estado || 'pendiente'
      return `${i + 1}️⃣ Pedido #${p.id || 'sin ID'} – $${p.total} – ${estado}`
    }).join('\n')

    await sock.sendMessage(from, {
      text: `📋 *Pedidos recientes:*\n${resumen}`
    })
    return true
  }

  // ⚙️ Comandos internos del bot (solo desde el número del bot)
  if (from === botNumber) {
    const estados: Record<string, Pedido['estado']> = {
      '/en fabrica': 'en_fabrica',
      '/empaquetado': 'empaquetado',
      '/enviado': 'enviado',
      '/en camino': 'en_camino',
      '/entregado': 'entregado',
      '/cancelado': 'cancelado'
    }

    if (comando === '/pago verificado') {
      if (!Array.isArray(userMemory.pedidos) || userMemory.pedidos.length === 0) return true

      const ultimoPedido = [...userMemory.pedidos].reverse().find(p =>
        p.estado === 'pendiente' || p.estado === 'pago_verificado'
      )
      if (!ultimoPedido) {
        await sock.sendMessage(from, {
          text: '❗ No se encontró un pedido pendiente para verificar.'
        })
        return true
      }

      if (ultimoPedido.pdfGenerado) {
        await sock.sendMessage(from, {
          text: '✅ Ya se ha generado el comprobante de este pedido.'
        })
        return true
      }

      if (ultimoPedido.id) {
        ultimoPedido.qrUrl = `https://jcavalier.com/seguimiento/${ultimoPedido.id}`
      }

      const pdfBuffer = await generarPDFPedido(userMemory, ultimoPedido)

      await sock.sendMessage(from, {
        text: '💵 Tu pago fue verificado. Tu pedido será preparado.'
      })

      await sock.sendMessage(from, {
        document: pdfBuffer,
        fileName: 'resumen-pedido.pdf',
        mimetype: 'application/pdf'
      })

      ultimoPedido.estado = 'pago_verificado'
      ultimoPedido.pdfGenerado = true

      await updateUser(userMemory._id, { pedidos: userMemory.pedidos })
      await notificarEstadoPedido(sock, from, ultimoPedido)
      return true
    }

    if (comando in estados) {
      const estadoElegido = estados[comando]
      const ultimoPedido = [...(userMemory.pedidos || [])].reverse().find(p => p.estado && p.estado !== 'entregado')
      if (ultimoPedido) {
        ultimoPedido.estado = estadoElegido
        await updateUser(userMemory._id, { pedidos: userMemory.pedidos })
        await notificarEstadoPedido(sock, from, ultimoPedido)
      }

      await sock.sendMessage(from, { text: `ℹ️ Estado actualizado a *${estadoElegido}*.` })

      if (comando === '/entregado') {
        await sock.sendMessage(from, {
          text: '✅ Cuando recibas tu pedido, responde con *recibido* para confirmar. ¡Gracias por tu compra!'
        })
      }

      return true
    }
  }

  // 📍 Ubicación
  if (normalized.includes('ubicacion') || normalized.includes('donde estan')) {
    await sock.sendMessage(from, {
      text: `📍 Nuestra ubicación: ${empresaConfig.ubicacion}`
    })
    return true
  }

  // 🕒 Horario
  if (normalized.includes('horario')) {
    await sock.sendMessage(from, {
      text: `🕒 Nuestro horario de atención es:\n${empresaConfig.horario}`
    })
    return true
  }

  // 💵 Pagos en bolívares
  if (normalized.includes('aceptan bolivares') || normalized.includes('pagar en bs')) {
    const tasa = await obtenerTasaBCV()
    await sock.sendMessage(from, {
      text: `💰 Sí, aceptamos bolívares. ${
        tasa ? `La tasa actual del BCV es *${tasa} Bs/USD*.` : ''
      }`
    })
    return true
  }

  // 🙏 Agradecimientos
  const expresionesAgradecimiento = [
    'gracias', 'muchas gracias', 'agradecido', 'le agradezco',
    'thank you', 'thanks', 'thanks a lot', 'i appreciate it',
    'muy amable', 'mil gracias', 'te lo agradezco',
    'gracias hermano', 'gracias pana'
  ]
  if (expresionesAgradecimiento.some(exp => normalized.includes(exp))) {
    await sock.sendMessage(from, {
      text: `¡Con gusto! Gracias a ti por confiar en *${empresaConfig.nombre}*. 🖤 Si necesitas algo más, aquí estoy.`
    })
    return true
  }

  // 👋 Saludos (resetean frustración y fallback)
  const saludos = ['hola', 'buen dia', 'buenos dias', 'buenas', 'saludos', 'aló']
  if (saludos.some(s => normalized.startsWith(s))) {
    userMemory.intentosSinIntencion = 0
    userMemory.ultimaIntencion = 'greeting'
    userMemory.needsHuman = false

    await updateUser(userMemory._id, {
      intentosSinIntencion: 0,
      ultimaIntencion: 'greeting',
      needsHuman: false
    })

    await sock.sendMessage(from, {
      text: `👋 ¡Hola ${displayName}! ¿En qué puedo ayudarte hoy?`
    })
    return true
  }


  return false
}
