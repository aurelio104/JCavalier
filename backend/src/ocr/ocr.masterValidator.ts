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
}

export function validarComprobante(textoOCR: string, montoEsperado: number): ValidacionResult {
  const lower = textoOCR.toLowerCase()

  // 1. Pago móvil
  if (
    lower.includes('pago movil') ||
    lower.includes('número de celular') ||
    lower.includes('banesco') ||
    lower.includes('mercantil') ||
    lower.includes('venezuela') // casos comunes en OCR
  ) {
    const resultado = validatePagoMovil(textoOCR, montoEsperado)
    return {
      tipo: 'pago_movil',
      ...resultado,
      resumen: generarResumen('Pago Móvil', resultado)
    }
  }

  // 2. Zelle
  if (
    (lower.includes('zelle') || lower.includes('@')) &&
    lower.includes('pago')
  ) {
    const resultado = validateZelle(textoOCR, montoEsperado)
    return {
      tipo: 'zelle',
      ...resultado,
      resumen: generarResumen('Zelle', resultado)
    }
  }

  // 3. Binance / USDT
  if (lower.includes('usdt') || lower.includes('binance')) {
    const resultado = validateBinance(textoOCR, montoEsperado)
    return {
      tipo: 'binance',
      ...resultado,
      resumen: generarResumen('Binance', resultado)
    }
  }

  // 4. Transferencia
  if (
    lower.includes('transferencia') ||
    lower.includes('número de cuenta') ||
    lower.includes('titular') ||
    lower.includes('banco') ||
    lower.includes('bs')
  ) {
    const resultado = validateTransferencia(textoOCR, montoEsperado)
    return {
      tipo: 'transferencia',
      ...resultado,
      resumen: generarResumen('Transferencia Bancaria', resultado)
    }
  }

  // 5. No detectado
  return {
    tipo: 'desconocido',
    valido: false,
    resumen: '❌ No se pudo determinar el tipo de comprobante. Asegúrate de enviar una imagen clara y legible.'
  }
}

function generarResumen(tipo: string, result: Omit<ValidacionResult, 'tipo'>): string {
  return `📑 *Análisis de Comprobante (${tipo})*

📧 Correo: ${result.correoDetectado || 'No encontrado'}
📱 Teléfono: ${result.telefonoDetectado || 'No detectado'}
👤 Titular: ${result.titularDetectado || 'No detectado'}
💰 Monto: ${result.montoDetectado ? `$${result.montoDetectado.toFixed(2)}` : 'No detectado'}
📅 Fecha: ${result.fechaDetectada || 'No detectada'}

${
  result.valido
    ? '✅ Comprobante válido. ¡Continuamos con tu pedido!'
    : '❌ El comprobante no coincide con los datos esperados.'
}`
}
