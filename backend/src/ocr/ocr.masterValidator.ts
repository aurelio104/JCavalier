import { validatePagoMovil } from './ocr.validators/pagoMovil.validator'
import { validateZelle } from './ocr.validators/zelle.validator'
import { validateBinance } from './ocr.validators/binance.validator'
import { validateTransferencia } from './ocr.validators/transferencia.validator'

export interface ValidacionResult {
  tipo: 'pago_movil' | 'transferencia' | 'zelle' | 'binance' | 'desconocido'
  valido: boolean
  montoDetectado?: number
  correoDetectado?: string
  fechaDetectada?: string
  resumen: string
  telefonoDetectado?: string
  titularDetectado?: string
  referenciaDetectada?: string
}

// 💱 Formatear monto en Bs
const formatBs = (monto: number): string =>
  monto.toLocaleString('es-VE', {
    style: 'currency',
    currency: 'VES',
    minimumFractionDigits: 2
  }).replace('Bs', 'Bs')

// 🧠 Función principal de validación
export function validarComprobante(
  textoOCR: string,
  totalEsperadoUSD: number,
  metodoEsperado: string = '',
  tasaBCV: number = 0
): ValidacionResult {
  const lower = textoOCR.toLowerCase()
  const match = (keyword: string) => metodoEsperado.toLowerCase().includes(keyword)

  // ❌ Filtro universal para comprobantes rechazados
  if (
    lower.includes('transacción fallida') ||
    lower.includes('transaccion fallida') ||
    lower.includes('pago fallido') ||
    lower.includes('error en la transacción') ||
    lower.includes('no fue posible procesar') ||
    lower.includes('rechazada') ||
    lower.includes('operación fallida')
  ) {
    return {
      tipo: 'desconocido',
      valido: false,
      correoDetectado: 'No detectado',
      montoDetectado: undefined,
      fechaDetectada: undefined,
      telefonoDetectado: undefined,
      titularDetectado: undefined,
      referenciaDetectada: 'No detectada',
      resumen: '❌ El comprobante indica que la transacción falló. Por favor, intenta nuevamente.'
    }
  }

  // 📲 Pago Móvil (detectado por número celular)
  if (
    match('pago movil') ||
    lower.includes('número celular') ||
    lower.includes('celular de origen') ||
    lower.includes('celular de destino')
  ) {
    const resultado = validatePagoMovil(textoOCR, totalEsperadoUSD)
    return {
      tipo: 'pago_movil',
      ...resultado,
      resumen: generarResumen('Pago Móvil', resultado, true, tasaBCV)
    }
  }

  // 💸 Zelle
  if (
    match('zelle') ||
    lower.includes('zelle') ||
    (lower.includes('@') && lower.includes('.com')) ||
    lower.includes('enviado a') ||
    lower.includes('inscrito como') ||
    lower.includes('adv plus banking') ||
    lower.includes('cantidad') ||
    lower.includes('confirmación') ||
    lower.includes('$')
  ) {
    const resultado = validateZelle(textoOCR, totalEsperadoUSD)
    return {
      tipo: 'zelle',
      ...resultado,
      resumen: generarResumen('Zelle', resultado, false)
    }
  }

  // 🪙 Binance
  if (
    match('binance') ||
    lower.includes('usdt') ||
    lower.includes('binance') ||
    lower.includes('pago exitoso') ||
    lower.includes('id de orden') ||
    lower.includes('fondos')
  ) {
    const resultado = validateBinance(textoOCR, totalEsperadoUSD)
    return {
      tipo: 'binance',
      ...resultado,
      resumen: generarResumen('Binance', resultado, false)
    }
  }

  // 🏦 Transferencia (detectado por cuenta bancaria)
  if (
    match('transferencia') ||
    lower.includes('número de cuenta') ||
    lower.includes('cuenta del banco') ||
    lower.includes('beneficiario')
  ) {
    const resultado = validateTransferencia(textoOCR, totalEsperadoUSD)
    return {
      tipo: 'transferencia',
      ...resultado,
      resumen: generarResumen('Transferencia Bancaria', resultado, true, tasaBCV)
    }
  }

  // ❌ No detectado
  return {
    tipo: 'desconocido',
    valido: false,
    correoDetectado: 'No detectado',
    montoDetectado: undefined,
    fechaDetectada: undefined,
    telefonoDetectado: undefined,
    titularDetectado: undefined,
    referenciaDetectada: 'No detectada',
    resumen:
      '❌ No se pudo determinar el tipo de comprobante. Asegúrate de enviar una imagen clara y legible.'
  }
}

// 📑 Genera el resumen del análisis
function generarResumen(
  tipo: string,
  result: Omit<ValidacionResult, 'tipo' | 'resumen'>,
  mostrarBs: boolean,
  tasaBCV: number = 0
): string {
  const montoUSD = result.montoDetectado != null
    ? `$${result.montoDetectado.toFixed(2)}`
    : 'No detectado'

  const montoBs = mostrarBs && result.montoDetectado != null && tasaBCV > 0
    ? ` | ${formatBs(result.montoDetectado * tasaBCV)}`
    : ''

  const lineaMonto = `💰 Monto: ${montoUSD}${montoBs}`

  const base = [
    `📑 *Análisis de Comprobante (${tipo})*`,
    tipo === 'zelle' || tipo === 'binance' ? `📧 Correo: ${result.correoDetectado ?? 'No encontrado'}` : null,
    tipo === 'pago_movil' ? `📱 Teléfono: ${result.telefonoDetectado ?? 'No detectado'}` : null,
    tipo === 'transferencia' || tipo === 'pago_movil' ? `👤 Titular: ${result.titularDetectado ?? 'No detectado'}` : null,
    tipo === 'binance' && result.titularDetectado && result.titularDetectado !== 'No detectado'
      ? `🏦 Método de pago: ${result.titularDetectado}`
      : null,
    `🔢 Referencia: ${result.referenciaDetectada ?? 'No detectada'}`,
    lineaMonto,
    `📅 Fecha: ${result.fechaDetectada ?? 'No detectada'}`,
    '',
    result.valido
      ? '✅ Comprobante válido. ¡Continuamos con tu pedido!'
      : '❌ El comprobante no coincide con los datos esperados.'
  ]

  return base.filter(Boolean).join('\n')
}
