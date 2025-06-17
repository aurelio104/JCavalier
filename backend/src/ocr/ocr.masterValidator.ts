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
  bancoDetectado?: string
  referenciaDetectada?: string
}

// 💱 Formatear monto en Bs
const formatBs = (monto: number): string =>
  monto.toLocaleString('es-VE', {
    style: 'currency',
    currency: 'VES',
    minimumFractionDigits: 2
  }).replace('Bs', 'Bs')

/**
 * 🧠 Función principal de validación de comprobantes OCR
 */
export function validarComprobante(
  textoOCR: string,
  totalEsperado: number,           // ✅ Ahora puede ser en USD o Bs según el método
  metodoEsperado: string = '',
  tasaBCV: number = 0
): ValidacionResult {
  const lower = textoOCR.toLowerCase()
  const match = (keyword: string) => metodoEsperado.toLowerCase().includes(keyword)

  // 🚫 Mensajes de fallo genérico
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
      bancoDetectado: undefined,
      referenciaDetectada: 'No detectada',
      resumen: '❌ El comprobante indica que la transacción falló. Por favor, intenta nuevamente.'
    }
  }

  // 🔸 Binance
  if (
    /\b(usdt|busd)\b/i.test(textoOCR) ||
    match('binance') ||
    lower.includes('binance') ||
    lower.includes('pago exitoso') ||
    lower.includes('id de orden') ||
    lower.includes('cuenta de fondos')
  ) {
    const resultado = validateBinance(textoOCR, totalEsperado)
    return {
      ...resultado,
      tipo: 'binance',
      resumen: generarResumen('Binance', resultado, true)
    }
  }

  // 🔸 Pago Móvil
  if (
    match('pago movil') ||
    /\b04\d{9}\b/.test(lower) ||
    lower.includes('número celular') ||
    lower.includes('celular de origen') ||
    lower.includes('celular de destino') ||
    lower.includes('al número') ||
    lower.includes('id beneficiario')
  ) {
    const montoEsperadoBs = totalEsperado // ✅ Ya viene en Bs, no multiplicar por tasa
    const resultado = validatePagoMovil(textoOCR, montoEsperadoBs)
    return {
      ...resultado,
      tipo: 'pago_movil',
      resumen: generarResumen('Pago Móvil', resultado, false, tasaBCV, montoEsperadoBs)
    }
  }

  // 🔸 Zelle
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
    const resultado = validateZelle(textoOCR, totalEsperado)
    return {
      ...resultado,
      tipo: 'zelle',
      resumen: generarResumen('Zelle', resultado, true)
    }
  }

  // 🔸 Transferencia
  if (
    match('transferencia') ||
    lower.includes('número de cuenta') ||
    lower.includes('cuenta del banco') ||
    lower.includes('beneficiario') ||
    lower.includes('número de referencia')
  ) {
    const montoEsperadoBs = totalEsperado // ✅ Ya viene en Bs, no multiplicar por tasa
    const resultado = validateTransferencia(textoOCR, montoEsperadoBs)
    return {
      ...resultado,
      tipo: 'transferencia',
      resumen: generarResumen('Transferencia Bancaria', resultado, false, tasaBCV, montoEsperadoBs)
    }
  }

  return {
    tipo: 'desconocido',
    valido: false,
    correoDetectado: 'No detectado',
    montoDetectado: undefined,
    fechaDetectada: undefined,
    telefonoDetectado: undefined,
    titularDetectado: undefined,
    bancoDetectado: undefined,
    referenciaDetectada: 'No detectada',
    resumen: '❌ No se pudo determinar el tipo de comprobante. Asegúrate de enviar una imagen clara y legible.'
  }
}

// 📑 Generador de resumen por tipo
function generarResumen(
  tipo: string,
  result: Omit<ValidacionResult, 'tipo' | 'resumen'>,
  mostrarUSD: boolean = true,
  tasaBCV: number = 0,
  montoEsperadoBs?: number
): string {
  let montoLinea = '💰 Monto: '

  if (mostrarUSD && result.montoDetectado != null) {
    montoLinea += `$${result.montoDetectado.toFixed(2)}`
  } else if (result.montoDetectado != null) {
    montoLinea += formatBs(result.montoDetectado)
  } else {
    montoLinea += 'No detectado'
  }

  const base = [
    `📑 *Análisis de Comprobante (${tipo})*`,
    tipo === 'zelle' || tipo === 'binance'
      ? `📧 Correo: ${result.correoDetectado ?? 'No encontrado'}`
      : null,
    tipo === 'pago_movil'
      ? `📱 Teléfono: ${result.telefonoDetectado ?? 'No detectado'}`
      : null,
    tipo === 'pago_movil'
      ? `🏦 Banco: ${result.bancoDetectado ?? 'No detectado'}`
      : null,
    tipo === 'transferencia'
      ? `👤 Titular: ${result.titularDetectado ?? 'No detectado'}`
      : null,
    tipo === 'transferencia'
      ? `🏦 Banco receptor: ${result.bancoDetectado ?? 'No detectado'}`
      : null,
    tipo === 'binance' && result.titularDetectado && result.titularDetectado !== 'No detectado'
      ? `🏦 Método de pago: ${result.titularDetectado}`
      : null,
    `🔢 Referencia: ${result.referenciaDetectada ?? 'No detectada'}`,
    montoLinea,
    `📅 Fecha: ${result.fechaDetectada ?? 'No detectada'}`,
    '',
    result.valido
      ? '✅ Comprobante válido. ¡Continuamos con tu pedido!'
      : '❌ El comprobante no coincide con los datos esperados.'
  ]

  return base.filter(Boolean).join('\n')
}
