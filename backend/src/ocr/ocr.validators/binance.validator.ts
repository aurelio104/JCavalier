import { empresaConfig } from '../../config/empresaConfig'

export function validateBinance(ocrText: string, montoEsperado: number) {
  const texto = ocrText.toLowerCase()

  // Regex robusto para correos
  const correoRegex = /[\w.-]+@[\w.-]+\.\w+/i
  const correoMatch = texto.match(correoRegex)
  const correoDetectado = correoMatch?.[0] || ''

  // Regex robusto para montos con USDT: acepta "12.50 USDT", "12,50USDT", etc.
  const montoRegex = /(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{1,2})?)\s*usdt/i
  const montoMatch = texto.match(montoRegex)

  const montoDetectado = montoMatch
    ? parseFloat(montoMatch[1].replace(/\./g, '').replace(',', '.')) // acepta tanto 1.234,56 como 1,234.56
    : 0

  const correoEsperado = empresaConfig.metodosPago.binance.correo.toLowerCase().trim()
  const correoValido = correoDetectado.toLowerCase().trim() === correoEsperado
  const montoValido = Math.abs(montoDetectado - montoEsperado) < 1

  return {
    valido: correoValido && montoValido,
    correoDetectado: correoDetectado || 'No detectado',
    montoDetectado,
    resumen: `🪙 *Binance Detectado*
Correo: ${correoDetectado || 'No detectado'}
Monto: ${montoDetectado ? `${montoDetectado.toFixed(2)} USDT` : 'No detectado'}

${
  correoValido && montoValido
    ? '✅ Comprobante válido. Gracias por tu pago en Binance.'
    : '❌ El comprobante no coincide con los datos esperados.'
}`
  }
}
