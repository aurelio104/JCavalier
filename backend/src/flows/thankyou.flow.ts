import { addKeyword, FlowFnProps } from '@bot-whatsapp/bot'
import { empresaConfig } from '../config/empresaConfig'
import { getUser, saveConversationToMongo } from '@memory/memory.mongo'

export const thankyouFlow = addKeyword('FLUJO_FINAL').addAction(
  async (ctx: FlowFnProps['ctx'], { flowDynamic }) => {
    const name = ctx.pushName?.trim() || 'cliente'
    const from = ctx.from
    const user = await getUser(from)

    const now = Date.now()
    const ultimaVez = user?.ultimoThankYouShown ? new Date(user.ultimoThankYouShown).getTime() : 0
    const hanPasado5Min = now - ultimaVez > 5 * 60 * 1000

    if (!hanPasado5Min) {
      console.log('⏳ Mensaje de agradecimiento ya fue mostrado recientemente. No se repite.')
      return
    }

    const tipoEntrega = user?.tipoEntrega || ''
    const emocion = user?.emotionSummary || 'neutral'
    const perfil = user?.profileType || 'explorador'

    const recomendaciones: string[] = []

    let mensajeFinal = ''
    switch (emocion) {
      case 'positive':
        mensajeFinal = '¡Gracias por tu buena vibra! Nos encanta tener clientes como tú. 💖'
        break
      case 'negative':
        mensajeFinal = 'Gracias por tu compra, esperamos que todo mejore pronto. Aquí estamos para ayudarte. 🙏'
        break
      default:
        mensajeFinal = 'Gracias por elegirnos. Siempre estamos para servirte. 😊'
    }

    switch (perfil) {
      case 'explorador':
        recomendaciones.push('✨ No te pierdas nuestras piezas nuevas cada semana.')
        break
      case 'indeciso':
        recomendaciones.push('👉 Si aún no estás seguro, puedo ayudarte a elegir lo mejor para ti.')
        break
      case 'comprador directo':
        recomendaciones.push('🚀 Ya estás a un paso de aprovechar nuestra próxima promoción exclusiva.')
        break
    }

    let mensajeEntrega = ''
    if (tipoEntrega.includes('Retiro')) {
      mensajeEntrega = '📍 Recordá que tu pedido te espera para retirar en tienda. ¡No olvides traer tu comprobante si aplica!'
    } else if (tipoEntrega.includes('Delivery')) {
      mensajeEntrega = '🚚 Estamos preparando tu envío en Maracay. Te contactaremos en breve para coordinar la entrega.'
    } else if (tipoEntrega.includes('Encomienda')) {
      mensajeEntrega = '📦 Tu encomienda será enviada pronto. Te mantendremos al tanto del número de guía.'
    }

    await flowDynamic([
      `🎉 *¡Gracias por tu compra, ${name}!*`,
      '',
      '🧾 Tu pedido fue registrado con éxito y ya está siendo preparado con mucho cariño.',
      '',
      mensajeEntrega,
      '',
      mensajeFinal,
      '',
      ...recomendaciones,
      '',
      `🖤 *¿Querés seguir explorando nuestra colección?*`,
      `Descubrí piezas exclusivas aquí:`,
      `🌐 ${empresaConfig.enlaces.catalogo}`,
      '',
      `📲 Si necesitás ayuda, modificar algo o hacer otro pedido, escribime cuando quieras. Estoy para vos.`,
      '',
      `✨ Gracias por confiar en *${empresaConfig.nombre}*.`,
      '',
      '¿Querés recibir promociones y descuentos por WhatsApp?',
      '📩 Responde *SÍ* para suscribirte. 🖤',
      '',
      '¡Hasta pronto y que disfrutes tu compra! 💖'
    ])

    await saveConversationToMongo(from, {
      ...user,
      ultimoThankYouShown: new Date()
    })
  }
)
