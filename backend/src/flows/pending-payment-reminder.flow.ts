// ✅ src/flows/pending-payment-reminder.flow.ts

import { addKeyword, EVENTS, FlowFnProps } from '@bot-whatsapp/bot'
import { empresaConfig } from '../config/empresaConfig'; // Importamos la configuración de la empresa

export const pendingPaymentReminderFlow = addKeyword(EVENTS.MESSAGE)
  .addAction(async (ctx: FlowFnProps['ctx'], { state, flowDynamic }) => {
    const data = await state.getMyState()

    // Si estamos esperando el comprobante, recordamos al usuario
    if (data.esperandoComprobante) {
      await flowDynamic([
        `⏳ Seguimos esperando tu *comprobante de pago* para poder avanzar con la entrega.`,
        `Por favor, envíalo por aquí en cuanto lo tengas. 😊`,
        '',
        `📲 Si necesitas más información sobre los métodos de pago o ayuda adicional, no dudes en escribirme. Estoy aquí para ayudarte.`,
        `✨ Gracias por confiar en *${empresaConfig.nombre}*.` // Usamos el nombre de la empresa desde empresaConfig
      ])
    }
  })
