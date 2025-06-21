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
    const probableCollection = user?.tags?.includes('tag_sunset') ? 'Sun Set' : null

    if (probableCollection === 'Sun Set') {
      await flowDynamic([
        `☀️ Tenemos conjuntos frescos ideales para clima playero, como la colección *Sun Set*.`,
        `👉 ${empresaConfig.enlaces.catalogo}`
      ])
      return
    }

    if (intent === 'catalog') {
      await flowDynamic([
        `🖤 Bienvenido a *${empresaConfig.nombre}*.`,
        `📌 Acá podés ver el catálogo completo:
${empresaConfig.enlaces.catalogo}`,
        'Si ya tenés algo en mente, escribime el producto o estilo que buscás.'
      ])
      return
    }

    if (intent === 'price' || intent === 'order') {
      if (contienePedidoDesdeWeb(normalizedText)) {
        const resultado = parseOrderMessage(normalizedText)

        if (!resultado.esPedidoValido) {
          await flowDynamic([
            '⚠️ No pude interpretar bien el pedido. ¿Podés reenviarlo o escribirlo de nuevo?'
          ])
          return
        }

        const resumen = resultado.productos.map((p: DetectedProduct, i: number) =>
          `🛍️ Producto ${i + 1}:
• Colección: ${p.coleccion}
• Nombre: ${p.nombre}
• Talla: ${p.talla}
• Color: ${p.color}
• Precio: $${p.precio}`
        ).join('\n\n')

        const total = resultado.productos.reduce((sum, p) => sum + parseFloat(p.precio), 0)

        // 🧠 Guardamos en memoria temporal + Mongo
        const memoriaParcial: Partial<UserMemory> = {
          name,
          productos: resultado.productos.map(p => p.nombre),
          total: total.toFixed(2),
          ultimaIntencion: 'order',
          fechaUltimaCompra: Date.now(),
          emotionSummary: emotion,
          flujoActivo: 'payment',
          needsHuman: false,
          ultimoIntentHandled: {
            intent: 'order',
            timestamp: Date.now()
          }
        }

        await saveConversationToMongo(from, memoriaParcial)
        await state.update(memoriaParcial)

        await flowDynamic([
          `✅ Pedido registrado:\n\n${resumen}`,
          `💰 *Total: $${total.toFixed(2)}*`,
          '¿Cómo preferís pagar?',
          '1️⃣ *Pago móvil*',
          '2️⃣ *Transferencia*',
          '3️⃣ *Zelle*',
          '4️⃣ *Binance*',
          '5️⃣ *Efectivo* (contra entrega)'
        ])

        return await gotoFlow(paymentFlow)
      }

      await flowDynamic([
        '📝 Si querés hacer un pedido, podés escribirlo así:',
        'Ejemplo:\nColección: Monarch\nProducto: Pantalón\nTalla: M\nColor: Beige\nPrecio: 28',
        'O simplemente contame qué buscás: estilo, color, talla… y te ayudo 😉'
      ])
      return
    }

    await flowDynamic([
      '👋 Estoy para ayudarte con dudas o pedidos.',
      'Podés ver el catálogo o decirme qué producto querés ver.'
    ])
  })
