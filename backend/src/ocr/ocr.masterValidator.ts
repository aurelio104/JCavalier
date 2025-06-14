// ✅ src/ocr/ocr.masterValidator.ts

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
}

export function validarComprobante(textoOCR: string, montoEsperado: number): ValidacionResult {
  const lower = textoOCR.toLowerCase()

  // Detectar tipo y llamar al validador correspondiente
  if (lower.includes('pago movil') || lower.includes('numero de celular') || lower.includes('banesco')) {
    const resultado = validatePagoMovil(textoOCR, montoEsperado)
    return {
      tipo: 'pago_movil',
      ...resultado,
      resumen: generarResumen('Pago Móvil', resultado)
    }
  }

  if (lower.includes('zelle') || lower.includes('@')) {
    const resultado = validateZelle(textoOCR, montoEsperado)
    return {
      tipo: 'zelle',
      ...resultado,
      resumen: generarResumen('Zelle', resultado)
    }
  }

  if (lower.includes('usdt') || lower.includes('binance')) {
    const resultado = validateBinance(textoOCR, montoEsperado)
    return {
      tipo: 'binance',
      ...resultado,
      resumen: generarResumen('Binance', resultado)
    }
  }

  if (lower.includes('transferencia') || lower.includes('numero de cuenta') || lower.includes('titular')) {
    const resultado = validateTransferencia(textoOCR, montoEsperado)
    return {
      tipo: 'transferencia',
      ...resultado,
      resumen: generarResumen('Transferencia Bancaria', resultado)
    }
  }

  return {
    tipo: 'desconocido',
    valido: false,
    resumen: '❌ No se pudo determinar el tipo de comprobante. Asegúrate de enviar una imagen clara y legible.'
  }
}

function generarResumen(tipo: string, result: Omit<ValidacionResult, 'tipo'>): string {
  return `📑 *Análisis de Comprobante (${tipo})*

📧 Correo: ${result.correoDetectado || 'No encontrado'}
💰 Monto: ${result.montoDetectado ? `$${result.montoDetectado}` : 'No detectado'}
📅 Fecha: ${result.fechaDetectada || 'No detectada'}

${
    result.valido
      ? '✅ Comprobante válido. ¡Continuamos con tu pedido!'
      : '❌ El comprobante no coincide con el monto esperado. Por favor revisa y vuelve a enviarlo.'
  }`
}
