// 📁 src/ocr/ocr.validators/pagoMovil.validator.ts
import { empresaConfig } from '../../config/empresaConfig'

export function validatePagoMovil(ocrText: string, montoEsperado: number) {
  const telefonoRegex = /\d{11}/
  const montoRegex = /Bs\s*([\d.,]+)/i

  const telefonoMatch = ocrText.match(telefonoRegex)
  const montoMatch = ocrText.match(montoRegex)

  const telefonoDetectado = telefonoMatch?.[0] || ''
  const montoDetectado = montoMatch ? parseFloat(montoMatch[1].replace(',', '.')) : 0

  const telefonoValido = telefonoDetectado.includes(
    empresaConfig.metodosPago.pagoMovil.telefono.replace(/[^\d]/g, '')
  )
  const montoValido = Math.abs(montoDetectado - montoEsperado) < 1

  return {
    valido: telefonoValido && montoValido,
    telefonoDetectado,
    montoDetectado,
    resumen: `📲 Pago Móvil Detectado\nTeléfono: ${telefonoDetectado}\nMonto: Bs ${montoDetectado}`
  }
}