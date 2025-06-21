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
    const { body: text, pushName, from } = ctx
    const normalizedText = text.toLowerCase().trim()

    const name = pushName || from.split('@')[0]
    const intent: BotIntent = detectIntent(normalizedText)
    const emotion: Emotion = analyzeEmotion(normalizedText)

    const user = await state.getMyState()

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

        // 🧠 Guardar en memoria temporal y MongoDB
        const memoriaParcial: Partial<UserMemory> = {
          name,
          productos: resultado.productos.map((p) => p.nombre),
          total: total.toFixed(2),
          ultimaIntencion: 'order',
          fechaUltimaCompra: Date.now(),
          needsHuman: false,
          emotionSummary: emotion,
          flujoActivo: 'payment',
          ultimoIntentHandled: {
            intent: 'order',
            timestamp: Date.now()
          }
        }

        await saveConversationToMongo(from, memoriaParcial)
        await state.update(memoriaParcial)

        await flowDynamic([
          `✨ ¡Hermosa elección, ${name}! Aquí tenés el resumen de tu pedido:\n\n${resumen}`,
          `💰 *Total a pagar: $${total.toFixed(2)}*`,
          '¿Cómo preferís realizar el pago?',
          '1️⃣ *Pago móvil*',
          '2️⃣ *Transferencia bancaria*',
          '3️⃣ *Zelle*',
          '4️⃣ *Binance*',
          '5️⃣ *Efectivo* (al recibir el producto)',
          '🛒 Dirigiéndote al pago...'
        ])

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
