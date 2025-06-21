// ✅ src/flows/pending-payment-reminder.flow.ts

import { addKeyword, EVENTS, FlowFnProps } from '@bot-whatsapp/bot'
import { empresaConfig } from '../config/empresaConfig'

export const pendingPaymentReminderFlow = addKeyword(EVENTS.MESSAGE)
  .addAction(async (ctx: FlowFnProps['ctx'], { state, flowDynamic }) => {
    const data = await state.getMyState()
    if (!data.esperandoComprobante) return

    const ahora = Date.now()
    const ultimaInteraccion = data.timestampTasaBCV || ahora
    const minutosTranscurridos = (ahora - ultimaInteraccion) / (1000 * 60)
    const horasTranscurridas = minutosTranscurridos / 60

    const mensaje = ctx.body.toLowerCase()

    // 💬 Reconocer respuestas típicas del usuario
    if (mensaje.includes('ya pague') || mensaje.includes('ya lo mande')) {
      return await flowDynamic([
        '🔍 Revisaremos si recibimos tu comprobante. Si ya lo enviaste, ¡gracias! Si no, por favor reenvíalo aquí 📎.'
      ])
    }

    if (mensaje.includes('me equivoqué') || mensaje.includes('cambiar metodo') || mensaje.includes('cambiar método')) {
      return await flowDynamic([
        '⚠️ Entendido. Puedes indicarme si deseas reiniciar el proceso de pago o cambiar el método. Estoy aquí para ayudarte.'
      ])
    }

    if (mensaje.includes('no se como') || mensaje.includes('cómo envio') || mensaje.includes('como envio')) {
      return await flowDynamic([
        '🧾 Para enviar el comprobante, haz clic en el clip 📎 y selecciona la imagen del pago desde tu galería o archivos.'
      ])
    }

    // ⏳ Evitar spam si el usuario acaba de escribir o pasó demasiado tiempo
    if (minutosTranscurridos < 10) return
    if (horasTranscurridas > 24) return

    // ⏰ Mensajes progresivos según tiempo
    let mensajeRecordatorio = ''
    if (horasTranscurridas < 1) {
      mensajeRecordatorio = `⏳ Seguimos esperando tu *comprobante de pago*. Envíalo por aquí cuando lo tengas.`
    } else if (horasTranscurridas < 4) {
      mensajeRecordatorio = `📌 Aún no hemos recibido tu *comprobante*. ¿Necesitas ayuda para enviarlo? Estoy aquí.`
    } else {
      mensajeRecordatorio = `⚠️ Han pasado varias horas y aún no hemos recibido tu comprobante. Si tuviste algún problema, escríbeme y te ayudo.`
    }

    await flowDynamic([
      mensajeRecordatorio,
      `✨ Gracias por confiar en *${empresaConfig.nombre}*.`
    ])
  })
