/// <reference path="../types/manual.d.ts" />

import { addKeyword, FlowFnProps } from '@bot-whatsapp/bot'
import { saveConversationToMongo } from '@memory/memory.mongo'
import { thankyouFlow } from '@flows/thankyou.flow'
import { empresaConfig } from '../config/empresaConfig'

const deliveryActions: ((ctx: FlowFnProps['ctx'], tools: Omit<FlowFnProps, 'ctx'>) => Promise<void>)[] = []

const flow = addKeyword(['__delivery'])

// Paso 1 – Preguntar tipo de entrega
// (se activa manualmente o si no se ha respondido aún)
deliveryActions.push(
  async (ctx, { flowDynamic }) => {
    console.log('🚚 deliveryFlow activado para:', ctx.from)
    await flowDynamic([
      `📦 ¿Cómo preferís recibir tu pedido?`,
      '',
      `1️⃣ *Retiro personal*`,
      `2️⃣ *Delivery* (solo Maracay centro)`,
      `3️⃣ *Encomienda nacional`
    ])
  }
)
flow.addAction(deliveryActions[0])

// Configuración de opciones
const opcionesEntrega = [
  {
    claves: ['1', 'retiro', 'personal', 'tienda', 'buscar', 'voy a buscar', 'retirar', 'recoger', 'yo mismo', 'paso buscando'],
    tipo: 'Retiro personal',
    mensaje: `🛍️ ¡Genial! Podrás retirar tu pedido personalmente en nuestra tienda de *${empresaConfig.nombre}*.

📍 Nuestra dirección: ${empresaConfig.contacto.direccion}
🌐 Ubicación: ${empresaConfig.contacto.ubicacionURL}

Nos estaremos comunicando contigo para coordinar el mejor horario. 😊`,
    requiereDatos: false
  },
  {
    claves: ['2', 'delivery', 'envío', 'envio', 'entrega', 'enviar a casa', 'hasta mi casa', 'lo traen', 'mandar', 'cuánto cuesta el delivery', 'precio del delivery', 'cuánto cobran'],
    tipo: 'Delivery (Maracay centro)',
    mensaje: `🚚 ¡Perfecto! Por favor envíanos tu *dirección exacta en Maracay* y un *número de contacto* para coordinar la entrega. 

💰 *Costo del delivery:* Bs. ${empresaConfig.opcionesEntrega.delivery?.costo ?? 'variable según zona'}.`,
    requiereDatos: true
  },
  {
    claves: ['3', 'encomienda', 'domicilio', 'ciudad', 'estado', 'fuera de maracay', 'otra ciudad', 'envío nacional'],
    tipo: 'Encomienda nacional',
    mensaje: `📮 Vamos a necesitar algunos datos para realizar el envío:

• Ciudad y estado
• Dirección completa
• Código postal (si aplica)
• Número de contacto

📦 Apenas los tengas, mándalos por aquí y seguimos contigo. 😉`,
    requiereDatos: true
  }
]

// Paso 2 – Interpretar selección inteligente
deliveryActions.push(
  async (ctx, { state, flowDynamic, gotoFlow }) => {
    const respuesta = ctx.body?.toLowerCase().trim() || ''
    const userState = await state.getMyState()

    let tipoEntrega = null
    let mensaje = ''
    let requiereDatos = false

    for (const opcion of opcionesEntrega) {
      if (opcion.claves.some(c => respuesta.includes(c))) {
        tipoEntrega = opcion.tipo
        mensaje = opcion.mensaje
        requiereDatos = opcion.requiereDatos
        break
      }
    }

    if (!tipoEntrega) {
      await flowDynamic([
        '❗ Por favor seleccioná una opción válida:',
        '',
        '1️⃣ Retiro personal',
        '2️⃣ Delivery (Maracay centro)',
        '3️⃣ Encomienda nacional'
      ])
      return
    }

    await state.update({ tipoEntrega, pasoEntrega: 2 })
    await saveConversationToMongo(ctx.from, { ...userState, tipoEntrega, pasoEntrega: 2 })

    await flowDynamic(mensaje)
    console.log('📦 Tipo de entrega seleccionada:', tipoEntrega)

    if (!requiereDatos) {
      await flowDynamic([
        `📦 *Resumen del pedido:*`,
        `• Método de entrega: ${tipoEntrega}`,
        `• Cliente: ${ctx.pushName}`,
        `• Contacto: ${ctx.from}`,
        '',
        `🖤 Gracias por confiar en *${empresaConfig.nombre}*.`
      ])
      return gotoFlow(thankyouFlow)
    }
  }
)
flow.addAction(deliveryActions[1])

// Paso 3 – Recolectar detalles si aplica
deliveryActions.push(
  async (ctx, { state, flowDynamic, gotoFlow }) => {
    const detalle = ctx.body?.trim() || ''
    if (detalle.length < 10) {
      await flowDynamic('❗ Necesitamos un poco más de detalle para asegurar una entrega sin inconvenientes. ¿Podés enviarlo de nuevo, por favor?')
      return
    }

    const userState = await state.getMyState()
    const lower = detalle.toLowerCase()

    const fechaDeseada = lower.match(/el (lunes|martes|miércoles|jueves|viernes|sábado|domingo)/)?.[0]
    const contactoTercero = lower.includes('otra persona') || lower.includes('mi primo') || lower.includes('mi mamá')

    await state.update({
      datosEntrega: detalle,
      pasoEntrega: 0,
      ...(fechaDeseada && { posibleFechaEntrega: fechaDeseada }),
      ...(contactoTercero && { nombreContactoAlterno: 'pendiente por definir' })
    })

    await saveConversationToMongo(ctx.from, {
      ...userState,
      datosEntrega: detalle,
      pasoEntrega: 0,
      ...(fechaDeseada && { posibleFechaEntrega: fechaDeseada }),
      ...(contactoTercero && { nombreContactoAlterno: 'pendiente por definir' })
    })

    await flowDynamic([
      `📦 *Resumen del pedido:*`,
      `• Método de entrega: ${userState.tipoEntrega}`,
      `• Dirección/Detalles: ${detalle}`,
      `• Cliente: ${ctx.pushName}`,
      `• Contacto: ${ctx.from}`,
      '',
      `✅ ¡Perfecto! Ya tenemos tus datos de entrega registrados.`,
      `🖤 Gracias por confiar en *${empresaConfig.nombre}*. Te mantenemos al tanto del siguiente paso.`
    ])

    console.log('📨 Datos de entrega registrados:', detalle)
    return gotoFlow(thankyouFlow)
  }
)
flow.addAction(deliveryActions[2])

export const deliveryFlow = flow

export async function runDeliveryFlowManualmente(ctx: any, tools: Omit<FlowFnProps, 'ctx'>) {
  const state = await tools.state.getMyState()
  let pasoActual = state.pasoEntrega

  if (pasoActual === undefined || pasoActual === 0) {
    pasoActual = 1
    await tools.state.update({ pasoEntrega: 1 })
  }

  const siguienteAccion = deliveryActions[pasoActual]
  if (!siguienteAccion) return

  await siguienteAccion(ctx, tools)
  await tools.state.update({ pasoEntrega: pasoActual + 1 })
}