import { empresaConfig } from '../../config/empresaConfig'

export function validateBinance(ocrText: string, montoEsperado: number) {
  const texto = ocrText.toLowerCase()

  // ❌ Rechazo por texto explícito de fallo
  if (
    texto.includes('fallido') ||
    texto.includes('cancelado') ||
    texto.includes('error') ||
    texto.includes('rechazado')
  ) {
    return {
      valido: false as boolean,
      correoDetectado: 'No detectado',
      montoDetectado: undefined,
      fechaDetectada: undefined,
      referenciaDetectada: 'No detectada',
      telefonoDetectado: undefined,
      titularDetectado: undefined,
      resumen: '❌ El comprobante indica que la transacción fue fallida.'
    }
  }

  // 📧 Correo electrónico
  const correoRegex = /[\w.-]+@[\w.-]+\.\w+/i
  const correoMatch = ocrText.match(correoRegex)
  const correoDetectado = correoMatch?.[0] || 'No detectado'

  // 💰 Monto: "60 USDT" o "60,00 USDT"
  const montoRegex = /(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)\s*(usdt|busd)/i
  const montoMatch = ocrText.match(montoRegex)
  const montoDetectado = montoMatch
    ? parseFloat(montoMatch[1].replace(/\./g, '').replace(',', '.'))
    : undefined

  // 📅 Fecha (formato UTC: "2025-05-30 14:56:33")
  const fechaRegex = /\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}/
  const fechaMatch = ocrText.match(fechaRegex)
  const fechaDetectada = fechaMatch?.[0]

  // 🔢 ID de orden como referencia
  const referenciaRegex = /\b\d{10,25}\b/
  const referenciaMatch = ocrText.match(referenciaRegex)
  const referenciaDetectada = referenciaMatch?.[0] || 'No detectada'

  // 🏦 Método de pago (opcional)
  const metodoRegex = /método de pago\s+([a-záéíóúü\s]+)/i
  const metodoMatch = ocrText.match(metodoRegex)
  const metodoDetectado = metodoMatch?.[1]?.trim()

  // ✅ Validaciones
  const correoEsperado = empresaConfig.metodosPago.binance.correo.toLowerCase().trim()
  const correoValido: boolean = correoDetectado.toLowerCase().trim() === correoEsperado

  const montoValido: boolean =
    typeof montoDetectado === 'number' &&
    Math.abs(montoDetectado - montoEsperado) < 1

  const valido: boolean = correoValido && montoValido

  return {
    valido,
    correoDetectado,
    montoDetectado,
    fechaDetectada,
    referenciaDetectada,
    telefonoDetectado: undefined,
    titularDetectado: metodoDetectado || 'No detectado', // usamos el campo para mostrar el método de pago
    resumen: '' // generado externamente
  }
}
