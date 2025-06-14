import { empresaConfig } from '../../config/empresaConfig'

export function validateTransferencia(ocrText: string, montoEsperado: number) {
  const texto = ocrText.toLowerCase()

  // Detectar titular (ignora acentos, mayúsculas y espacios adicionales)
  const titularEsperado = empresaConfig.metodosPago.transferenciaBancaria.titular.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const titularDetectado = texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(titularEsperado)

  // Detectar monto en bolívares: Bs 1.234,56 o Bs 1,234.56
  const montoRegex = /(?:bs|bs\.?)\s*([\d.,]{3,15})/i
  const montoMatch = ocrText.match(montoRegex)
  const montoDetectado = montoMatch
    ? parseFloat(montoMatch[1].replace(/\./g, '').replace(',', '.')) // elimina miles y ajusta decimales
    : 0
  const montoValido = Math.abs(montoDetectado - montoEsperado) < 1

  return {
    valido: titularDetectado && montoValido,
    titularDetectado: titularDetectado ? empresaConfig.metodosPago.transferenciaBancaria.titular : 'No detectado',
    montoDetectado,
    resumen: `🏦 *Transferencia Bancaria Detectada*
Titular: ${titularDetectado ? empresaConfig.metodosPago.transferenciaBancaria.titular : 'No detectado'}
Monto: ${montoDetectado ? `Bs ${montoDetectado.toFixed(2)}` : 'No detectado'}

${
  titularDetectado && montoValido
    ? '✅ Comprobante válido. ¡Gracias por tu pago!'
    : '❌ El comprobante no coincide con los datos esperados.'
}`
  }
}
