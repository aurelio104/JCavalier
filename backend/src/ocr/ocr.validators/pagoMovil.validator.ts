import { empresaConfig } from '../../config/empresaConfig'

export function validatePagoMovil(ocrText: string, montoEsperado: number) {
  const texto = ocrText.toLowerCase()

  // Regex flexible para teléfono: 11 dígitos seguidos
  const telefonoRegex = /\b\d{11}\b/
  const telefonoMatch = texto.match(telefonoRegex)
  const telefonoDetectado = telefonoMatch?.[0] || ''

  // Regex robusto para montos: Bs 1.234,56 o Bs 1,234.56
  const montoRegex = /(?:bs|bs\.?)\s*([\d.,]{3,15})/i
  const montoMatch = texto.match(montoRegex)
  const montoDetectado = montoMatch
    ? parseFloat(montoMatch[1].replace(/\./g, '').replace(',', '.'))
    : 0

  const telefonoEsperado = empresaConfig.metodosPago.pagoMovil.telefono.replace(/[^\d]/g, '')
  const telefonoValido = telefonoDetectado === telefonoEsperado
  const montoValido = Math.abs(montoDetectado - montoEsperado) < 1

  return {
    valido: telefonoValido && montoValido,
    telefonoDetectado: telefonoDetectado || 'No detectado',
    montoDetectado,
    resumen: `📲 *Pago Móvil Detectado*
Teléfono: ${telefonoDetectado || 'No detectado'}
Monto: ${montoDetectado ? `Bs ${montoDetectado.toFixed(2)}` : 'No detectado'}

${
  telefonoValido && montoValido
    ? '✅ Comprobante válido. ¡Gracias por tu pago!'
    : '❌ El comprobante no coincide con los datos esperados.'
}`
  }
}
