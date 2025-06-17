// ✅ src/flows/delivery.flow.ts

import { addKeyword, FlowFnProps } from '@bot-whatsapp/bot'
import { saveConversationToMongo } from '@memory/memory.mongo'
import { thankyouFlow } from '@flows/thankyou.flow'
import { empresaConfig } from '../config/empresaConfig'

const deliveryActions: ((ctx: FlowFnProps['ctx'], tools: Omit<FlowFnProps, 'ctx'>) => Promise<void>)[] = []

const flow = addKeyword(['__delivery'])

// Paso 1 – Preguntar tipo de entrega
deliveryActions.push(
  async (ctx, { flowDynamic }) => {
    console.log('🚚 deliveryFlow activado para:', ctx.from)
    await flowDynamic([
      `📦 ¿Cómo preferís recibir tu pedido?`,
      '',
      `1️⃣ *Retiro personal*`,
      `2️⃣ *Delivery* (solo Maracay centro)`,
      `3️⃣ *Encomienda nacional*`
    ])
  }
)
flow.addAction(deliveryActions[0])

// Configuración de opciones
const opcionesEntrega = [
  {
    claves: ['1', 'retiro', 'personal', 'tienda', 'buscar', 'voy a buscar', 'retirar', 'recoger', 'yo mismo'],
    tipo: 'Retiro personal',
    mensaje: `🛍️ ¡Genial! Podrás retirar tu pedido personalmente en nuestra tienda de *${empresaConfig.nombre}*.\n\nNos estaremos comunicando contigo para coordinar el mejor horario. 😊`,
    requiereDatos: false
  },
  {
    claves: ['2', 'delivery', 'envío', 'envio', 'entrega', 'enviar a casa', 'hasta mi casa', 'lo traen', 'mandar'],
    tipo: 'Delivery (Maracay centro)',
    mensaje: `🚚 ¡Perfecto! Por favor envíanos tu *dirección exacta en Maracay* y un *número de contacto* para coordinar la entrega.`,
    requiereDatos: true
  },
  {
    claves: ['3', 'encomienda', 'domicilio', 'ciudad', 'estado', 'fuera de maracay', 'otra ciudad', 'envío nacional'],
    tipo: 'Encomienda nacional',
    mensaje: `📮 Vamos a necesitar algunos datos para realizar el envío:\n\n• Ciudad y estado\n• Dirección completa\n• Código postal (si aplica)\n• Número de contacto\n\n📦 Apenas los tengas, mándalos por aquí y seguimos contigo. 😉`,
    requiereDatos: true
  }
]

// Paso 2 – Interpretar selección
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

    // Registrar paso
    await state.update({ tipoEntrega, pasoEntrega: 2 })
    await saveConversationToMongo(ctx.from, { ...userState, tipoEntrega, pasoEntrega: 2 })

    await flowDynamic(mensaje)
    console.log('📦 Tipo de entrega seleccionada:', tipoEntrega)

    if (!requiereDatos) return gotoFlow(thankyouFlow)
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

    // 🧠 Detectar si menciona día de retiro
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
      '✅ ¡Perfecto! Ya tenemos tus datos de entrega registrados.',
      '',
      `🖤 Gracias por confiar en *${empresaConfig.nombre}*. Te mantenemos al tanto del siguiente paso.`
    ])

    console.log('📨 Datos de entrega registrados:', detalle)
    return gotoFlow(thankyouFlow)
  }
)
flow.addAction(deliveryActions[2])

// Exportación principal
export const deliveryFlow = flow

// Función para activarlo manualmente (cuando se detecta desde comprobante por imagen, etc.)
export async function runDeliveryFlowManualmente(ctx: any, tools: Omit<FlowFnProps, 'ctx'>) {
  const state = await tools.state.getMyState()
  const pasoActual = state.pasoEntrega || 0

  const siguienteAccion = deliveryActions[pasoActual]
  if (!siguienteAccion) return

  await siguienteAccion(ctx, tools)
  await tools.state.update({ pasoEntrega: pasoActual + 1 })
}
