// ✅ src/flows/ecommerce.flow.ts

import { addKeyword, FlowFnProps } from '@bot-whatsapp/bot'
import { empresaConfig } from '../config/empresaConfig'
import { detectIntent, analyzeEmotion } from '@intelligence/intent.engine'
import { saveConversationToMongo } from '@memory/memory.mongo'
import { paymentFlow } from './payment.flow'
import {
  contienePedidoDesdeWeb,
  parseOrderMessage,
  DetectedProduct
} from '@intelligence/order.detector'
import { Emotion, BotIntent, UserMemory } from '@schemas/UserMemory'

export const ecommerceFlow = addKeyword('welcome')
  .addAction(async (ctx: FlowFnProps['ctx'], { flowDynamic, state, gotoFlow }) => {
    const { body: text, pushName } = ctx
    const normalizedText = text.toLowerCase().trim()

    const user = await state.getMyState()
    const intent: BotIntent = detectIntent(normalizedText)
    const emotion: Emotion = analyzeEmotion(normalizedText)

    if (intent === 'catalog') {
      await flowDynamic([
        `🖤 ¡Bienvenido a *${empresaConfig.nombre}*!`,
        '✨ Aquí podés ver nuestra colección completa:',
        `🌐 ${empresaConfig.enlaces.catalogo}`,
        'Si estás buscando algo específico, contame qué te gustaría ver y con gusto te ayudo. 😉'
      ])
      return
    }

    if (intent === 'price' || intent === 'order') {
      if (contienePedidoDesdeWeb(normalizedText)) {
        const resultado = parseOrderMessage(normalizedText)

        if (!resultado.esPedidoValido) {
          await flowDynamic([
            '⚠️ No pude interpretar correctamente tu pedido. ¿Podés reenviarlo o escribirlo nuevamente, por favor? 🙏'
          ])
          return
        }

        const resumen = resultado.productos.map((p: DetectedProduct, i: number) =>
          `🛍️ Producto ${i + 1}:
•⁠ Colección: ${p.coleccion}
•⁠ Nombre: ${p.nombre}
•⁠ Talla: ${p.talla}
•⁠ Color: ${p.color}
•⁠ Precio: $${p.precio}`
        ).join('\n\n')

        const total = resultado.productos.reduce((sum, p) => sum + parseFloat(p.precio), 0)

        await saveConversationToMongo(ctx.from, {
          name: pushName || 'cliente',
          productos: resultado.productos.map((p) => p.nombre),
          total: total.toFixed(2),
          ultimaIntencion: 'order',
          fechaUltimaCompra: Date.now(),
          needsHuman: false,
          emotionSummary: emotion
        } as Partial<UserMemory>)

        await flowDynamic([
          `✨ ¡Hermosa elección, ${pushName || 'cliente'}! Aquí tenés el resumen de tu pedido:

${resumen}

💰 *Total a pagar: $${total.toFixed(2)}*`,
          '¿Cómo preferís realizar el pago?',
          '1️⃣ *Pago móvil*',
          '2️⃣ *Transferencia bancaria*',
          '3️⃣ *Zelle*',
          '4️⃣ *Binance*',
          '5️⃣ *Efectivo* (al recibir el producto)'
        ])

        await flowDynamic('🛒 Dirigiéndote al pago...')
        return await gotoFlow(paymentFlow)
      }

      await flowDynamic([
        '📝 Para ayudarte mejor, podés escribir tu pedido así:',
        'Ejemplo: "Colección: Sun Set\nProducto: Camisa\nTalla: M\nColor: Negro\nPrecio: 25"',
        'O también podés contarme qué estás buscando: estilo, color, talla… ¡y lo busco por vos! 🕵️‍♀️'
      ])
      return
    }

    await flowDynamic([
      '👋 Estoy aquí para ayudarte con cualquier consulta sobre nuestro catálogo o productos.',
      'Si estás buscando algo específico, contame qué te gustaría ver y con gusto te ayudo. 😉'
    ])
  })

  .addAction(async (ctx: FlowFnProps['ctx'], { flowDynamic, state, gotoFlow }) => {
    const user = await state.getMyState()
    if (user?.ultimaIntencion === 'order') {
      await flowDynamic([
        `Tu pedido está confirmado. 💪🏼 El total es de $${user.total}.`,
        '¡Gracias por tu compra! Procederemos al siguiente paso.'
      ])
      return await gotoFlow(paymentFlow)
    }

    await flowDynamic([
      '⚠️ No pude entender correctamente tu pedido. Por favor, intentá nuevamente o escribí "quiero ayuda" para asistencia personalizada.'
    ])
  })
