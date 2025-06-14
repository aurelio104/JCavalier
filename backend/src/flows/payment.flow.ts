// ✅ src/flows/payment.flow.ts

import { addKeyword, FlowFnProps } from '@bot-whatsapp/bot'
import { saveConversationToMongo } from '@memory/memory.mongo'
import { empresaConfig } from '../config/empresaConfig'

// 🔤 Elimina acentos
const removeAccents = (str: string): string =>
  str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

// 🧾 Paso 1: Preguntar por el método de pago
export const pasoMetodoPago = async (
  ctx: FlowFnProps['ctx'],
  { flowDynamic, state }: Omit<FlowFnProps, 'ctx'>
): Promise<void> => {
  const data = await state.getMyState()
  const name = data.name ?? 'cliente'

  await flowDynamic([
    `¿Cómo prefieres realizar el pago, ${name}?`,
    '',
    `1️⃣ *Pago móvil*`,
    `2️⃣ *Transferencia bancaria*`,
    `3️⃣ *Zelle*`,
    `4️⃣ *Binance*`,
    `5️⃣ *Efectivo* (al recibir el producto)`
  ])
}

// 💳 Paso 2: Procesar el método de pago
export const pasoProcesarMetodo = async (
  ctx: FlowFnProps['ctx'],
  { state, flowDynamic }: Omit<FlowFnProps, 'ctx'>
): Promise<void> => {
  const respuesta = removeAccents(ctx.body.trim())
  const data = await state.getMyState()
  const name = data.name ?? 'cliente'

  let total = parseFloat(data.total ?? '0')
  if (isNaN(total)) total = 0.0

  type MetodoPago = 'Efectivo' | 'Pago móvil' | 'Transferencia bancaria' | 'Zelle' | 'Binance'
  let metodo: MetodoPago | '' = ''
  let mensajePago = ''
  const totalLine = `\n\n💰 *Total a pagar:* $${total.toFixed(2)}\n`

  switch (true) {
    case /(^|\b)(5|efectivo)(\b|$)/.test(respuesta):
      metodo = 'Efectivo'
      mensajePago = `Perfecto, ${name} 🙌 Has seleccionado *efectivo al recibir*.

💵 Tu pedido será entregado personalmente, y podrás pagar en el momento de la entrega.${totalLine}

Si tienes alguna otra duda, aquí estoy. 😊`
      await state.update({ metodoPago: metodo, esperandoComprobante: false })
      await saveConversationToMongo(ctx.from, await state.getMyState())
      await flowDynamic(mensajePago)
      return

    case /(^|\b)(1|pago movil|movil)(\b|$)/.test(respuesta):
      metodo = 'Pago móvil'
      mensajePago = `Perfecto, ${name} 🙌 Aquí tienes los datos para *Pago Móvil*:

📱 *Teléfono:* ${empresaConfig.metodosPago.pagoMovil.telefono}  
🆔 *Cédula:* ${empresaConfig.metodosPago.pagoMovil.cedula}  
🏦 *Banco:* ${empresaConfig.metodosPago.pagoMovil.banco}${totalLine}

🧾 Cuando hagas el pago, envíame el comprobante aquí. 😉`
      break

    case /(^|\b)(2|transferencia)(\b|$)/.test(respuesta):
      metodo = 'Transferencia bancaria'
      mensajePago = `Perfecto, ${name} 🙌 Aquí están los datos para *Transferencia Bancaria*:

🏦 *Banco:* ${empresaConfig.metodosPago.transferenciaBancaria.banco}  
📄 *Cuenta:* ${empresaConfig.metodosPago.transferenciaBancaria.cuenta}  
👤 *Titular:* ${empresaConfig.metodosPago.transferenciaBancaria.titular}${totalLine}

🧾 Envía el comprobante por aquí cuando esté listo. 😉`
      break

    case /(^|\b)(3|zelle)(\b|$)/.test(respuesta):
      metodo = 'Zelle'
      mensajePago = `Perfecto, ${name} 🙌 Puedes pagar vía *Zelle*:

📧 *Correo:* ${empresaConfig.metodosPago.zelle.correo}${totalLine}

🧾 Luego de transferir, mándame el comprobante. 😉`
      break

    case /(^|\b)(4|binance)(\b|$)/.test(respuesta):
      metodo = 'Binance'
      mensajePago = `Perfecto, ${name} 🙌 Estos son los datos para *Binance (USDT/BUSD)*:

📧 *Correo:* ${empresaConfig.metodosPago.binance.correo}${totalLine}

🧾 Cuando completes la transacción, mándame el comprobante por aquí. 😉`
      break

    default:
      await flowDynamic([
        '❗ No logré identificar el método. Por favor respondé con una opción válida:',
        '',
        '1️⃣ Pago móvil',
        '2️⃣ Transferencia bancaria',
        '3️⃣ Zelle',
        '4️⃣ Binance',
        '5️⃣ Efectivo'
      ])
      return
  }

  // Guardar método de pago y activar recepción de comprobante
  await state.update({ metodoPago: metodo, esperandoComprobante: true })
  await saveConversationToMongo(ctx.from, await state.getMyState())
  await flowDynamic(mensajePago)
}

// 🚀 Flujo principal
export const paymentFlow = addKeyword('TOTAL_CONFIRMADO')
  .addAction(async (ctx, tools) => pasoMetodoPago(ctx, tools))
  .addAction(async (ctx, tools) => pasoProcesarMetodo(ctx, tools))

// 🔁 Exportar acciones
export const paymentActions = {
  pasoMetodoPago,
  pasoProcesarMetodo
}
