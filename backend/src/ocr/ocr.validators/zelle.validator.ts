// 📁 src/ocr/ocr.validators/zelle.validator.ts
import { empresaConfig } from '../../config/empresaConfig'

export function validateZelle(ocrText: string, montoEsperado: number) {
  const correoRegex = /[\w.-]+@[\w.-]+/i
  const montoRegex = /\$\s?([\d.,]+)/

  const correoMatch = ocrText.match(correoRegex)
  const montoMatch = ocrText.match(montoRegex)

  const correoDetectado = correoMatch?.[0] || ''
  const montoDetectado = montoMatch ? parseFloat(montoMatch[1].replace(',', '.')) : 0

  const correoValido = correoDetectado === empresaConfig.metodosPago.zelle.correo
  const montoValido = Math.abs(montoDetectado - montoEsperado) < 1

  return {
    valido: correoValido && montoValido,
    correoDetectado,
    montoDetectado,
    resumen: `📧 Zelle Detectado\nCorreo: ${correoDetectado}\nMonto: $${montoDetectado}`
  }
}
