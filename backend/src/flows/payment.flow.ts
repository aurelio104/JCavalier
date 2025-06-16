import { addKeyword, FlowFnProps } from '@bot-whatsapp/bot'
import { saveConversationToMongo } from '@memory/memory.mongo'
import { empresaConfig } from '../config/empresaConfig'
import axios from 'axios'

// 🔤 Elimina acentos
const removeAccents = (str: string): string =>
  str.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

// 💱 Formatea monto en Bs
const formatBs = (monto: number): string =>
  monto.toLocaleString('es-VE', {
    style: 'currency',
    currency: 'VES',
    minimumFractionDigits: 2
  }).replace('Bs', 'Bs')

// 🌐 Obtiene tasa oficial BCV
async function obtenerTasaBCV(): Promise<number> {
  try {
    const res = await axios.get('https://ve.dolarapi.com/v1/dolares')
    const bcv = res.data.find((x: any) => x.fuente.toLowerCase() === 'oficial')
    const tasa = parseFloat(bcv?.promedio)

    if (!bcv || isNaN(tasa) || tasa <= 0) throw new Error('Tasa no válida')
    console.log('✅ Tasa oficial BCV obtenida:', tasa)
    return tasa
  } catch (error: any) {
    console.error('❌ Error obteniendo tasa BCV:', error.message)
    return 0
  }
}

// 🧾 Paso 1: Preguntar por el método de pago
export const pasoMetodoPago = async (
  ctx: FlowFnProps['ctx'],
  { flowDynamic, state }: Omit<FlowFnProps, 'ctx'>
): Promise<void> => {
  const { name = 'cliente' } = await state.getMyState()
  await flowDynamic([
    `¿Cómo prefieres realizar el pago, ${name}?`,
    '',
    '1️⃣ *Pago móvil*',
    '2️⃣ *Transferencia bancaria*',
    '3️⃣ *Zelle*',
    '4️⃣ *Binance*',
    '5️⃣ *Efectivo* (al recibir el producto)'
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
  if (isNaN(total)) total = 0

  let tasaBCV = data.tasaBCV
  let timestamp = data.timestampTasaBCV || 0
  const vencida = Date.now() - timestamp > 3600000

  if (!tasaBCV || tasaBCV <= 0 || vencida) {
    tasaBCV = await obtenerTasaBCV()
    timestamp = Date.now()
  }

  const totalBs = tasaBCV > 0 ? total * tasaBCV : 0
  const totalLine = `\n\n💰 *Total a pagar:* $${total.toFixed(2)}`
  const totalBsLine = totalBs > 0 ? `\n💰 *Total en bolívares:* ${formatBs(totalBs)}` : ''

  type MetodoPago = 'Efectivo' | 'Pago móvil' | 'Transferencia bancaria' | 'Zelle' | 'Binance'
  let metodo: MetodoPago | '' = ''
  let mensajePago = ''

  // 💵 Efectivo
  if (/(\b5\b|efectivo)/.test(respuesta)) {
    metodo = 'Efectivo'
    mensajePago = `Perfecto, ${name} 🙌 Has seleccionado *efectivo al recibir*.

💵 Tu pedido será entregado personalmente y podrás pagar en el momento de la entrega.${totalLine}`
  }

  // 📲 Pago móvil
  else if (/(\b1\b|pago movil|movil)/.test(respuesta)) {
    metodo = 'Pago móvil'
    mensajePago = `Perfecto, ${name} 🙌 Aquí tienes los datos para *Pago Móvil*:

📱 Teléfono: ${empresaConfig.metodosPago.pagoMovil.telefono}  
🆔 Cédula: ${empresaConfig.metodosPago.pagoMovil.cedula}  
🏦 Banco: ${empresaConfig.metodosPago.pagoMovil.banco}${totalLine}${totalBsLine}

🧾 Cuando hagas el pago, envíame el comprobante aquí. 😉`
  }

  // 🏦 Transferencia
  else if (/(\b2\b|transferencia)/.test(respuesta)) {
    metodo = 'Transferencia bancaria'
    mensajePago = `Perfecto, ${name} 🙌 Aquí están los datos para *Transferencia Bancaria*:

🏦 Banco: ${empresaConfig.metodosPago.transferenciaBancaria.banco}  
📄 Cuenta: ${empresaConfig.metodosPago.transferenciaBancaria.cuenta}  
👤 Titular: ${empresaConfig.metodosPago.transferenciaBancaria.titular}${totalLine}${totalBsLine}

🧾 Envía el comprobante por aquí cuando esté listo. 😉`
  }

  // 💸 Zelle
  else if (/(\b3\b|zelle)/.test(respuesta)) {
    metodo = 'Zelle'
    mensajePago = `Perfecto, ${name} 🙌 Puedes pagar vía *Zelle*:

📧 Correo: ${empresaConfig.metodosPago.zelle.correo}${totalLine}

🧾 Luego de transferir, mándame el comprobante. 😉`
  }

  // 🪙 Binance
  else if (/(\b4\b|binance)/.test(respuesta)) {
    metodo = 'Binance'
    mensajePago = `Perfecto, ${name} 🙌 Aquí los datos para *Binance (USDT/BUSD)*:

📧 Correo: ${empresaConfig.metodosPago.binance.correo}${totalLine}

🧾 Cuando completes la transacción, mándame el comprobante por aquí. 😉`
  }

  // ❌ No identificado
  else {
    return void await flowDynamic([
      '❗ No logré identificar el método. Responde con una opción válida:',
      '',
      '1️⃣ Pago móvil',
      '2️⃣ Transferencia bancaria',
      '3️⃣ Zelle',
      '4️⃣ Binance',
      '5️⃣ Efectivo'
    ])
  }

  await state.update({
    metodoPago: metodo,
    esperandoComprobante: metodo !== 'Efectivo',
    tasaBCV,
    timestampTasaBCV: timestamp,
    total,
    totalBs
  })
  await saveConversationToMongo(ctx.from, await state.getMyState())
  await flowDynamic(mensajePago)
}

// 🚀 Flujo principal
export const paymentFlow = addKeyword('TOTAL_CONFIRMADO')
  .addAction(async (ctx, tools) => pasoMetodoPago(ctx, tools))
  .addAction(async (ctx, tools) => pasoProcesarMetodo(ctx, tools))

export const paymentActions = {
  pasoMetodoPago,
  pasoProcesarMetodo
}
