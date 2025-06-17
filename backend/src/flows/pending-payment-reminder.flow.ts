// ✅ src/flows/pending-payment-reminder.flow.ts

import { addKeyword, EVENTS, FlowFnProps } from '@bot-whatsapp/bot'
import { empresaConfig } from '../config/empresaConfig'; // Importamos la configuración de la empresa

export const pendingPaymentReminderFlow = addKeyword(EVENTS.MESSAGE)
  .addAction(async (ctx: FlowFnProps['ctx'], { state, flowDynamic }) => {
    const data = await state.getMyState()

    if (!data.esperandoComprobante) return

    const ahora = Date.now()
    const ultimaInteraccion = data.timestampTasaBCV || ahora
    const horasTranscurridas = (ahora - ultimaInteraccion) / (1000 * 60 * 60)

    if (ctx.body.toLowerCase().includes('ya pague') || ctx.body.toLowerCase().includes('ya lo mande')) {
      await flowDynamic([
        '🔍 Revisaremos si recibimos tu comprobante. Si ya lo enviaste, ¡gracias! Si no, por favor reenvíalo aquí 📎.'
      ])
      return
    }

    if (ctx.body.toLowerCase().includes('me equivoque') || ctx.body.toLowerCase().includes('cambiar metodo')) {
      await flowDynamic([
        '⚠️ Entendido. Puedes indicarme si deseas reiniciar el proceso de pago o cambiar el método. Estoy aquí para ayudarte.'
      ])
      return
    }

    if (ctx.body.toLowerCase().includes('no se como') || ctx.body.toLowerCase().includes('como envio')) {
      await flowDynamic([
        '🧾 Para enviar el comprobante, simplemente haz clic en el clip 📎 y selecciona la imagen del pago desde tu galería o archivos.'
      ])
      return
    }

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
