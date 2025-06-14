// ✅ src/flows/delivery.flow.ts

import { addKeyword, FlowFnProps } from '@bot-whatsapp/bot'
import { saveConversationToMongo } from '@memory/memory.mongo'
import { thankyouFlow } from '@flows/thankyou.flow'
import { empresaConfig } from '../config/empresaConfig'

export const deliveryFlow = addKeyword('ENTREGA_OPCIONES')

  // 🧭 Paso 1: Mostrar opciones de entrega
  .addAction(async (
    ctx: FlowFnProps['ctx'],
    { flowDynamic }: Omit<FlowFnProps, 'ctx'>
  ) => {
    await flowDynamic([
      `📦 ¿Cómo preferís recibir tu pedido?`,
      '',
      `1️⃣ *Retiro personal*`,
      `2️⃣ *Delivery* (solo Maracay centro)`,
      `3️⃣ *Encomienda nacional*`
    ])
  })

  // ✅ Paso 2: Procesar la elección
  .addAction(async (
    ctx: FlowFnProps['ctx'],
    { state, flowDynamic, gotoFlow }: Omit<FlowFnProps, 'ctx'>
  ) => {
    const respuesta = ctx.body.toLowerCase().trim()
    const userState = await state.getMyState()

    let tipoEntrega: string | null = null
    let mensaje: string = ''
    let requiereDatos: boolean = false

    if (respuesta.includes('1') || respuesta.includes('retiro')) {
      tipoEntrega = 'Retiro personal'
      mensaje = `🛍️ ¡Genial! Podrás retirar tu pedido personalmente en nuestra tienda de *${empresaConfig.nombre}*.\n\nNos estaremos comunicando contigo para coordinar el mejor horario. 😊`
    } else if (respuesta.includes('2') || respuesta.includes('delivery')) {
      tipoEntrega = 'Delivery (Maracay centro)'
      mensaje = `🚚 ¡Perfecto! Por favor envíanos tu *dirección exacta en Maracay* y un *número de contacto* para coordinar la entrega.`
      requiereDatos = true
    } else if (respuesta.includes('3') || respuesta.includes('encomienda')) {
      tipoEntrega = 'Encomienda nacional'
      mensaje = `📮 Vamos a necesitar algunos datos para realizar el envío:\n\n• Ciudad y estado\n• Dirección completa\n• Código postal (si aplica)\n• Número de contacto\n\n📦 Apenas los tengas, mándalos por aquí y seguimos contigo. 😉`
      requiereDatos = true
    }

    if (!tipoEntrega) {
      await flowDynamic([
        '❗ Por favor seleccioná una opción válida para continuar:',
        '',
        '1️⃣ Retiro personal',
        '2️⃣ Delivery (Maracay centro)',
        '3️⃣ Encomienda nacional'
      ])
      return
    }

    await state.update({ tipoEntrega })
    await saveConversationToMongo(ctx.from, { ...userState, tipoEntrega })

    await flowDynamic(mensaje)

    if (!requiereDatos) {
      return await gotoFlow(thankyouFlow)
    }
  })

  // 📝 Paso 3: Capturar detalles (si se requieren)
  .addAction(async (
    ctx: FlowFnProps['ctx'],
    { state, flowDynamic, gotoFlow }: Omit<FlowFnProps, 'ctx'>
  ) => {
    const detalle = ctx.body.trim()

    if (detalle.length < 10) {
      await flowDynamic('❗ Necesitamos un poco más de detalle para asegurar una entrega sin inconvenientes. ¿Podés enviarlo de nuevo, por favor?')
      return
    }

    const userState = await state.getMyState()
    await state.update({ datosEntrega: detalle })
    await saveConversationToMongo(ctx.from, { ...userState, datosEntrega: detalle })

    await flowDynamic([
      '✅ ¡Perfecto! Ya tenemos tus datos de entrega registrados.',
      '',
      `🖤 Gracias por confiar en *${empresaConfig.nombre}*. Te mantenemos al tanto del siguiente paso.`
    ])

    return gotoFlow(thankyouFlow)
  })
