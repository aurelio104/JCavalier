import { empresaConfig } from '../../config/empresaConfig'

export function validatePagoMovil(ocrText: string, montoEsperadoBs: number) {
  const texto = ocrText
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')

  const lineas = texto.split(/\r?\n/).map(l =>
    l.normalize('NFD').replace(/[̀-\u036f]/g, '').trim().replace(/\s+/g, ' ')
  )

  // ❌ Verifica si la transacción falló
  if (/fallida|error|rechazada|no fue posible procesar|no procesado/.test(texto)) {
    return {
      valido: false,
      telefonoDetectado: undefined,
      bancoDetectado: undefined,
      titularDetectado: undefined,
      correoDetectado: undefined,
      fechaDetectada: undefined,
      montoDetectado: undefined,
      referenciaDetectada: undefined,
      resumen: '❌ El comprobante indica una transacción fallida.'
    }
  }

  // 📱 Teléfono
  const telefonoRegex = /destino[^0-9]*(0\d{10})/
  const telefonoMatch = texto.match(telefonoRegex)
  const telefonoDetectado = telefonoMatch?.[1] ?? 'No detectado'
  const telefonoEsperado = empresaConfig.metodosPago.pagoMovil.telefono.replace(/[^\d]/g, '')
  const telefonoValido = telefonoDetectado === telefonoEsperado

  // 🏦 Banco
  const bancoEsperado = empresaConfig.metodosPago.pagoMovil.banco
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
  const bancoDetectado = lineas.find(linea =>
    linea.includes(bancoEsperado)
  ) ?? 'No detectado'
  const bancoValido = bancoDetectado !== 'No detectado'

  // 🔢 Referencia
  const refRegex = /referencia[^0-9]*(\d{6,20})/
  const refMatch = texto.match(refRegex)
  const referenciaDetectada = refMatch?.[1] ?? 'No detectado'

  // 📅 Fecha
  const fechaRegex = /(\d{2}\/\d{2}\/\d{4})[^\d]*(\d{1,2}:\d{2}(?::\d{2})?\s?(?:am|pm)?)/i
  const fechaMatch = ocrText.match(fechaRegex)
  const fechaDetectada = fechaMatch
    ? `${fechaMatch[1]} ${fechaMatch[2].toUpperCase()}`
    : 'No detectada'

  // 💰 Monto
  const montoRegex = /bs[^0-9]*([\d.,]+)/i
  const montoMatch = texto.match(montoRegex)
  const montoDetectado = montoMatch
    ? parseFloat(montoMatch[1].replace(/\./g, '').replace(',', '.'))
    : undefined
  const montoValido = typeof montoDetectado === 'number' &&
    typeof montoEsperadoBs === 'number' &&
    montoEsperadoBs > 0 &&
    Math.abs(montoDetectado - montoEsperadoBs) < 1

  const valido = telefonoValido && bancoValido && montoValido
  console.log(`[1] ✅ Resultado final válido: ${valido}`)

  return {
    valido,
    telefonoDetectado,
    bancoDetectado: bancoValido ? empresaConfig.metodosPago.pagoMovil.banco : 'No detectado',
    titularDetectado: undefined,
    correoDetectado: undefined,
    fechaDetectada,
    montoDetectado,
    referenciaDetectada,
    resumen: `📲 *Pago Móvil Detectado*

📱 Teléfono: ${telefonoDetectado}
🏦 Banco: ${bancoValido ? empresaConfig.metodosPago.pagoMovil.banco : 'No detectado'}
🔢 Referencia: ${referenciaDetectada}
📅 Fecha: ${fechaDetectada}
💰 Monto: ${montoDetectado ? `Bs ${montoDetectado.toFixed(2)}` : 'No detectado'}

${valido
  ? '✅ Comprobante válido. ¡Gracias por tu pago!'
  : '❌ El comprobante no coincide con los datos esperados.'}`
  }
}
