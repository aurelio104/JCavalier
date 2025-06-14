// ✅ src/ocr/ocr.validators/zelle.validator.ts — Versión refinada para OCR real

import { empresaConfig } from '../../config/empresaConfig'

export function validateZelle(ocrText: string, montoEsperado: number) {
  const correoRegex = /[\w.-]+@[\w.-]+\.\w+/i
  const montoRegex = /(?:\$?\s?)(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/

  const correoMatch = ocrText.match(correoRegex)
  const montoMatch = ocrText.match(montoRegex)

  const correoDetectado = correoMatch?.[0] || ''
  const montoDetectado = montoMatch
    ? parseFloat(montoMatch[1].replace(/\./g, '').replace(',', '.')) // soporta 1.234,56 o 1,234.56
    : 0

  const correoEsperado = empresaConfig.metodosPago.zelle.correo.toLowerCase().trim()
  const correoValido = correoDetectado.toLowerCase().trim() === correoEsperado
  const montoValido = Math.abs(montoDetectado - montoEsperado) < 1 // diferencia menor a $1

  return {
    valido: correoValido && montoValido,
    correoDetectado,
    montoDetectado,
    resumen: `📧 *Zelle Detectado*
Correo: ${correoDetectado || 'No encontrado'}
Monto: ${montoDetectado ? `$${montoDetectado.toFixed(2)}` : 'No detectado'}

${
  correoValido && montoValido
    ? '✅ Comprobante válido. ¡Continuamos con tu pedido!'
    : '❌ El comprobante no coincide con los datos esperados.'
}`
  }
}
