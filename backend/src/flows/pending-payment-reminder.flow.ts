import { addKeyword, EVENTS, FlowFnProps } from '@bot-whatsapp/bot'
import { empresaConfig } from '../config/empresaConfig'

export const pendingPaymentReminderFlow = addKeyword(EVENTS.MESSAGE)
  .addAction(async (ctx: FlowFnProps['ctx'], { state, flowDynamic }) => {
    const data = await state.getMyState()
    if (!data.esperandoComprobante) return

    const ahora = Date.now()
    const ultimaInteraccion = data.timestampTasaBCV || ahora
    const minutosTranscurridos = (ahora - ultimaInteraccion) / 60000
    const horasTranscurridas = minutosTranscurridos / 60

    const mensaje = ctx.body.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

    // 💬 Respuestas comunes del usuario
    if (/ya pague|ya lo mande/.test(mensaje)) {
      return await flowDynamic([
        '🔍 Revisaremos si recibimos tu comprobante. Si ya lo enviaste, ¡gracias! Si no, por favor reenvíalo aquí 📎.'
      ])
    }

    if (/me equivoque|cambiar metodo|cambiar método/.test(mensaje)) {
      return await flowDynamic([
        '⚠️ Entendido. Puedes indicarme si deseas reiniciar el proceso de pago o cambiar el método. Estoy aquí para ayudarte.'
      ])
    }

    if (/no se como|como envio|cómo envio/.test(mensaje)) {
      return await flowDynamic([
        '🧾 Para enviar el comprobante, haz clic en el clip 📎 y selecciona la imagen del pago desde tu galería o archivos.'
      ])
    }

    // ⏳ Evita respuestas repetidas en menos de 10 min o después de 24h
    if (minutosTranscurridos < 10 || horasTranscurridas > 24) return

    // ⏰ Mensajes según el tiempo de espera
    let recordatorio = ''
    if (horasTranscurridas < 1) {
      recordatorio = `⏳ Seguimos esperando tu *comprobante de pago*. Envíalo por aquí cuando lo tengas.`
    } else if (horasTranscurridas < 4) {
      recordatorio = `📌 Aún no hemos recibido tu *comprobante*. ¿Necesitas ayuda para enviarlo? Estoy aquí.`
    } else {
      recordatorio = `⚠️ Han pasado varias horas y aún no hemos recibido tu comprobante. Si tuviste algún problema, escríbeme y te ayudo.`
    }

    await flowDynamic([
      recordatorio,
      `✨ Gracias por confiar en *${empresaConfig.nombre}*.`
    ])
  })
