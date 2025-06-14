// ✅ src/flows/ecommerce.flow.ts

import { addKeyword, FlowFnProps } from '@bot-whatsapp/bot'
import { empresaConfig } from '../config/empresaConfig'  // Importamos la configuración de la empresa
import { detectIntent, analyzeEmotion } from '@intelligence/intent.engine'
import { saveConversationToMongo } from '@memory/memory.mongo'
import { paymentFlow } from './payment.flow'
import { contienePedidoDesdeWeb, parseOrderMessage, DetectedProduct } from '@intelligence/order.detector'
import { Emotion, BotIntent, UserMemory } from '@schemas/UserMemory'

/**
 * 🧠 Este flujo maneja todo lo referente al catálogo y pedidos.
 * Se activa tanto para consultas generales como para procesar pedidos estructurados.
 */
export const ecommerceFlow = addKeyword('welcome')  // Reemplazamos por 'welcome' en lugar de EVENTS.WELCOME

  // Acción que maneja todas las consultas iniciales sobre el catálogo
  .addAction(async (ctx: FlowFnProps['ctx'], { flowDynamic, state, gotoFlow }: Omit<FlowFnProps, 'ctx'>) => { // Asegúrate de que gotoFlow esté disponible aquí
    const { body: text, pushName } = ctx
    const normalizedText = text.toLowerCase().trim()

    const user = await state.getMyState()

    // Detectamos la intención del mensaje
    const intent: BotIntent = detectIntent(normalizedText)
    
    // Manejo de consulta sobre catálogo
    if (intent === 'catalog') {
      await flowDynamic([
        `🖤 ¡Bienvenido a *${empresaConfig.nombre}*!`,
        '✨ Aquí podés ver nuestra colección completa:',
        `🌐 ${empresaConfig.enlaces.catalogo}`,
        'Si estás buscando algo específico, cuéntame qué te gustaría ver y con gusto te ayudo. 😉'
      ])
      return
    }

    // Manejo de un mensaje sobre precios o productos específicos
    if (intent === 'price' || intent === 'order') {
      // Si el mensaje contiene una solicitud de productos
      if (contienePedidoDesdeWeb(normalizedText)) {
        const resultado = parseOrderMessage(normalizedText)

        if (!resultado.esPedidoValido) {
          await flowDynamic([
            '⚠️ No pude interpretar correctamente tu pedido.\n¿Podrías reenviarlo o escribirlo nuevamente, por favor? 🙏'
          ])
          return
        }

        // Confirmación del pedido
        const resumen = resultado.productos
          .map(
            (p: DetectedProduct, i: number) =>
              `🛍️ Producto ${i + 1}:\n•⁠ Colección: ${p.coleccion}\n•⁠ Nombre: ${p.nombre}\n•⁠ Talla: ${p.talla}\n•⁠ Color: ${p.color}\n•⁠ Precio: $${p.precio}`
          )
          .join('\n\n')

        const total = resultado.productos.reduce((sum, p) => sum + parseFloat(p.precio), 0)

        // Guardamos el estado del usuario y el pedido
        await saveConversationToMongo(ctx.from, {
          name: pushName || 'cliente',
          productos: resultado.productos.map((p) => p.nombre),
          total: total.toFixed(2),
          ultimaIntencion: 'order',
          fechaUltimaCompra: Date.now()
        } as Partial<UserMemory>)

        await flowDynamic([
          `✨ Perfecto, ${pushName || 'cliente'}, ya tengo tu pedido registrado. Aquí está el resumen completo:\n\n${resumen}\n\n💰 *Total a pagar: $${total.toFixed(2)}*`,
          '¿Cómo prefieres realizar el pago?',
          '1️⃣ *Pago móvil*',
          '2️⃣ *Transferencia bancaria*',
          '3️⃣ *Zelle*',
          '4️⃣ *Binance*',
          '5️⃣ *Efectivo* (al recibir el producto)'
        ])
        
        // Redirigimos a la etapa de pago
        await flowDynamic('🛒 Dirigiéndote al pago...')
        return await gotoFlow(paymentFlow)  // Aquí, gotoFlow está disponible a través de las herramientas de la acción
      }

      // Si no es un pedido válido, pedimos detalles
      await flowDynamic([
        '⚠️ No pude interpretar correctamente tu mensaje. ¿Podrías confirmar tu pedido o enviarlo de nuevo en un formato claro? 🙏'
      ])
      return
    }

    // Si el mensaje no contiene un pedido estructurado o reconocible
    await flowDynamic([
      `👋 Estoy aquí para ayudarte con cualquier consulta sobre nuestro catálogo o productos.`,
      'Si estás buscando algo específico, cuéntame qué te gustaría ver y con gusto te ayudo. 😉'
    ])
  })

  // Acción que maneja cuando el usuario confirma el pedido
  .addAction(async (ctx: FlowFnProps['ctx'], { flowDynamic, state, gotoFlow }: Omit<FlowFnProps, 'ctx'>) => {
    const user = await state.getMyState()
    if (user?.ultimaIntencion === 'order') {
      await flowDynamic([
        `Tu pedido está confirmado. 💪🏼 El total es de $${user.total}.`,
        '¡Gracias por tu compra! Procederemos al siguiente paso.'
      ])
      return await gotoFlow(paymentFlow)
    }

    await flowDynamic([
      '⚠️ No pude entender correctamente tu pedido. Por favor, intenta nuevamente o contacta a nuestro equipo de soporte si necesitas ayuda.'
    ])
  })
