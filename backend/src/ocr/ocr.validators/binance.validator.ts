import { empresaConfig } from '../../config/empresaConfig'

export function validateBinance(ocrText: string, montoEsperado: number) {
  const texto = ocrText.toLowerCase()

  // ❌ Filtro por fallo
  if (
    texto.includes('fallido') ||
    texto.includes('cancelado') ||
    texto.includes('error') ||
    texto.includes('rechazado')
  ) {
    return {
      valido: false,
      correoDetectado: 'No detectado',
      montoDetectado: undefined,
      fechaDetectada: undefined,
      referenciaDetectada: 'No detectada',
      telefonoDetectado: undefined,
      titularDetectado: undefined,
      resumen: '❌ El comprobante indica que la transacción fue fallida.'
    }
  }

  // 📧 Correo electrónico detectado
  const correoRegex = /[\w.-]+@[\w.-]+\.\w+/i
  const correoMatch = ocrText.match(correoRegex)
  const correoDetectado = correoMatch?.[0] || 'No detectado'

  // 💰 Monto: acepta "60 USDT", "60,00 USDT", "Pagado con 60 USDT", etc.
  const montoRegex = /(?:pagado con|pagaste)?\s*\$?\s*([\d.,]{1,10})\s*(usdt|busd)?/i
  const montoMatch = ocrText.match(montoRegex)
  const montoDetectado = montoMatch
    ? parseFloat(montoMatch[1].replace(/,/g, '').replace(/\./g, '.'))
    : undefined

  // 📅 Fecha UTC como "2025-05-30 14:56:33"
  const fechaRegex = /\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}/
  const fechaMatch = ocrText.match(fechaRegex)
  const fechaDetectada = fechaMatch?.[0] || 'No detectada'

  // 🔢 Referencia: ID de orden largo (10 a 25 dígitos)
  const referenciaRegex = /\b\d{10,25}\b/
  const referenciaMatch = ocrText.match(referenciaRegex)
  const referenciaDetectada = referenciaMatch?.[0] || 'No detectada'

  // 🏦 Método de pago (por ejemplo: Cuenta de Fondos)
  const metodoRegex = /m[eé]todo de pago\s*([a-záéíóúü\s]+)/i
  const metodoMatch = ocrText.match(metodoRegex)
  const metodoDetectado = metodoMatch?.[1]?.trim() || 'No detectado'

  // ✅ Validaciones finales
  const correoEsperado = empresaConfig.metodosPago.binance.correo.toLowerCase().trim()
  const correoValido = correoDetectado.toLowerCase().trim() === correoEsperado

  const montoValido = typeof montoDetectado === 'number' &&
    Math.abs(montoDetectado - montoEsperado) < 1

  const valido = correoValido && montoValido

  return {
    valido,
    correoDetectado,
    montoDetectado,
    fechaDetectada,
    referenciaDetectada,
    telefonoDetectado: undefined,
    titularDetectado: metodoDetectado, // usado como método de pago
    resumen: '' // generado en el flujo principal
  }
}
