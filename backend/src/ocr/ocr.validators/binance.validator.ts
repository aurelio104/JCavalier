// 📁 src/ocr/ocr.validators/binance.validator.ts
import { empresaConfig } from '../../config/empresaConfig'

export function validateBinance(ocrText: string, montoEsperado: number) {
  const correoRegex = /[\w.-]+@[\w.-]+/i
  const montoRegex = /(\d+(\.\d{1,2})?)\s*USDT/

  const correoMatch = ocrText.match(correoRegex)
  const montoMatch = ocrText.match(montoRegex)

  const correoDetectado = correoMatch?.[0] || ''
  const montoDetectado = montoMatch ? parseFloat(montoMatch[1]) : 0

  const correoValido = correoDetectado === empresaConfig.metodosPago.binance.correo
  const montoValido = Math.abs(montoDetectado - montoEsperado) < 1

  return {
    valido: correoValido && montoValido,
    correoDetectado,
    montoDetectado,
    resumen: `🪙 Binance Detectado\nCorreo: ${correoDetectado}\nMonto: ${montoDetectado} USDT`
  }
}