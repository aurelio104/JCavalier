/// <reference path="../types/manual.d.ts" />

import { addKeyword, FlowFnProps } from '@bot-whatsapp/bot'
import { saveConversationToMongo } from '@memory/memory.mongo'
import { thankyouFlow } from '@flows/thankyou.flow'
import { empresaConfig } from '../config/empresaConfig'
import type { UserMemory } from '../schemas/UserMemory'
import { generarPDFPedido } from '../utils/pdf.generator'

const deliveryActions: ((ctx: FlowFnProps['ctx'], tools: Omit<FlowFnProps, 'ctx'>) => Promise<void>)[] = []

const flow = addKeyword(['__delivery'])

const normalizar = (str: string) =>
  str.normalize('NFD').replace(/[^\p{L}\p{N}\s]/gu, '').toLowerCase().trim()

async function mostrarResumenPedido(
  flowDynamic: FlowFnProps['flowDynamic'],
  ctx: FlowFnProps['ctx'],
  tipoEntrega: string,
  detalles?: string
) {
  const mensajes = [
    `📦 *Resumen del pedido:*`,
    `• Método de entrega: ${tipoEntrega}`,
    detalles ? `• Dirección/Detalles: ${detalles}` : null,
    `• Cliente: ${ctx.pushName}`,
    `• Contacto: ${ctx.from}`,
    '',
    `🔍 Gracias por confiar en *${empresaConfig.nombre}*.`
  ].filter(Boolean)

  await flowDynamic(mensajes as string[])
}

// Paso 1 - Mostrar opciones de entrega

deliveryActions.push(
  async (ctx, { flowDynamic, state }) => {
    const userState = await state.getMyState()
    if (!userState.esperandoMetodoEntrega) return

    await flowDynamic([
      `📦 ¿Cómo preferís recibir tu pedido?`,
      '',
      `1⃣️ *Retiro personal*`,
      `2⃣️ *Delivery* (solo Maracay centro)`,
      `3⃣️ *Encomienda nacional*`
    ])
  }
)
flow.addAction(deliveryActions[0])

const opcionesEntrega = [
  {
    claves: [
      '1', 'retiro', 'personal', 'tienda', 'buscar', 'retirar',
      'yo voy', 'voy', 'yo paso', 'paso por la tienda',
      'tomando a buscarlo', 'voy por el', 'lo busco', 'lo buscare',
      'yo retiro personalmente', 'retiro personalmente'
    ],
    tipo: 'Retiro personal',
    mensaje: `🛍️ ¡Genial! Podrás retirar tu pedido en nuestra tienda *${empresaConfig.nombre}*.

📍 Dirección: ${empresaConfig.contacto.direccion}
🌐 Mapa: ${empresaConfig.contacto.ubicacionURL}`,
    requiereDatos: false
  },
  {
    claves: [
      '2', 'delivery', 'envio', 'entrega', 'llevarlo',
      'quiero delivery', 'me lo traen', 'me lo mandan',
      'me lo llevas', 'enviar a maracay', 'reparto local',
      'entrega en maracay', 'delivery maracay', 'mandamelo'
    ],
    tipo: 'Delivery (Maracay centro)',
    mensaje: `🚚 ¡Perfecto! Por favor enviá tu *dirección exacta en Maracay* y un *número de contacto*.

💰 Delivery: Bs. ${empresaConfig.opcionesEntrega.delivery?.costo ?? 'variable según zona'}.`,
    requiereDatos: true
  },
  {
    claves: [
      '3', 'encomienda', 'domicilio', 'ciudad', 'nacional',
      'envio nacional', 'por zoom', 'mrw', 'domesa', 'tealca',
      'soy del interior', 'fuera de maracay', 'en otro estado',
      'mandalo a otra ciudad', 'envialo por encomienda'
    ],
    tipo: 'Encomienda nacional',
    mensaje: `📬 Necesitamos:
• Ciudad y estado
• Dirección completa
• Código postal (si aplica)
• Número de contacto`,
    requiereDatos: true
  }
]

deliveryActions.push(
  async (ctx, { state, flowDynamic, gotoFlow }) => {
    const respuesta = normalizar(ctx.body || '')
    const userState = await state.getMyState()

    const esPrimerIntento = !userState.intentoEntregaFallido

    if (!respuesta || respuesta.length < 2) {
      await flowDynamic([
        esPrimerIntento
          ? '📦 ¿Cómo preferís recibir tu pedido?'
          : '❗ Necesitamos que elijas una opción válida:',
        '',
        '1⃣️ Retiro personal',
        '2⃣️ Delivery (Maracay centro)',
        '3⃣️ Encomienda nacional'
      ])
      await state.update({ intentoEntregaFallido: true })
      return
    }

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
        '❗ Elegí una opción válida:',
        '',
        '1⃣️ Retiro personal',
        '2⃣️ Delivery (Maracay centro)',
        '3⃣️ Encomienda nacional'
      ])
      await state.update({ intentoEntregaFallido: true })
      return
    }

    const ahora = new Date()

    await state.update({
      tipoEntrega,
      pasoEntrega: requiereDatos ? 2 : 0,
      esperandoMetodoEntrega: requiereDatos,
      flujoActivo: requiereDatos ? 'delivery' : null,
      ultimoResumenPedido: ahora,
      intentoEntregaFallido: false
    })

    await saveConversationToMongo(ctx.from, {
      ...userState,
      tipoEntrega,
      pasoEntrega: requiereDatos ? 2 : 0,
      esperandoMetodoEntrega: requiereDatos,
      flujoActivo: requiereDatos ? 'delivery' : null,
      ultimoResumenPedido: ahora
    } as UserMemory)

    await flowDynamic([mensaje])

    if (!requiereDatos) {
      await mostrarResumenPedido(flowDynamic, ctx, tipoEntrega)
      await gotoFlow(thankyouFlow)
      throw new Error('__handled_by_delivery_flow__')
    }
  }
)
flow.addAction(deliveryActions[1])

deliveryActions.push(
  async (ctx, { state, flowDynamic, gotoFlow }) => {
    const detalle = ctx.body?.trim() || ''
    if (detalle.length < 10) {
      await flowDynamic('❗ Necesitamos un poco más de detalle.')
      return
    }

    const userState = await state.getMyState()
    const lower = detalle.toLowerCase()
    const fechaDeseada = lower.match(/el (lunes|martes|miércoles|jueves|viernes|sábado|domingo)/)?.[0]
    const contactoTercero = lower.includes('otra persona')

    await state.update({
      datosEntrega: detalle,
      pasoEntrega: 0,
      flujoActivo: null,
      ...(fechaDeseada && { posibleFechaEntrega: fechaDeseada }),
      ...(contactoTercero && { nombreContactoAlterno: 'pendiente por definir' })
    })

    await saveConversationToMongo(ctx.from, {
      ...userState,
      datosEntrega: detalle,
      pasoEntrega: 0,
      flujoActivo: null,
      ...(fechaDeseada && { posibleFechaEntrega: fechaDeseada }),
      ...(contactoTercero && { nombreContactoAlterno: 'pendiente por definir' })
    })

    await mostrarResumenPedido(flowDynamic, ctx, userState.tipoEntrega, detalle)
    await gotoFlow(thankyouFlow)
    throw new Error('__handled_by_delivery_flow__')
  }
)
flow.addAction(deliveryActions[2])

export const deliveryFlow = flow

export async function runDeliveryFlowManualmente(ctx: any, tools: Omit<FlowFnProps, 'ctx'>) {
  const state = await tools.state.getMyState()
  let pasoActual = state.pasoEntrega

  if (!pasoActual || pasoActual < 1 || pasoActual > 2) {
    pasoActual = 1
    await tools.state.update({ pasoEntrega: 1 })
  }

  const siguienteAccion = deliveryActions[pasoActual]
  if (!siguienteAccion) return

  await siguienteAccion(ctx, tools)

  const nuevoState = await tools.state.getMyState()
  if (nuevoState.pasoEntrega === pasoActual) {
    await tools.state.update({ pasoEntrega: pasoActual + 1 })
  }

  throw new Error('__handled_by_delivery_flow__')
}
