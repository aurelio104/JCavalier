import { empresaConfig } from '../../config/empresaConfig'

export function validatePagoMovil(ocrText: string, montoEsperado: number) {
  const texto = ocrText.toLowerCase()

  // ❌ Rechazo explícito por transacción fallida
  if (/transacci[oó]n\s+fallida/i.test(texto)) {
    return {
      valido: false,
      telefonoDetectado: undefined,
      titularDetectado: undefined,
      correoDetectado: undefined,
      fechaDetectada: undefined,
      montoDetectado: undefined,
      referenciaDetectada: undefined,
      resumen: '❌ El comprobante indica una transacción fallida. No es válido.'
    }
  }

  // 📱 Teléfono de destino
  const telefonoRegex = /\b0\d{10}\b/
  const telefonoMatch = texto.match(telefonoRegex)
  const telefonoDetectado = telefonoMatch?.[0] || 'No detectado'

  // 🆔 Cédula del receptor
  const cedulaRegex = /v\d{5,10}/i
  const cedulaMatch = texto.match(cedulaRegex)
  const cedulaDetectada = cedulaMatch?.[0].toUpperCase() || 'No detectada'

  // 🏦 Banco receptor
  const bancoLine = ocrText.split('\n').find(l => l.toLowerCase().includes('banco receptor'))
  const bancoDetectado = bancoLine?.split(':')[1]?.trim() || 'No detectado'

  // 🔢 Número de referencia
  const referenciaRegex = /n[úu]mero de referencia[^\d]*(\d{6,20})/i
  const referenciaMatch = ocrText.match(referenciaRegex)
  const referenciaDetectada = referenciaMatch?.[1] || 'No detectada'

  // 🕓 Fecha y hora
  const fechaRegex = /(\d{2}\/\d{2}\/\d{4})\s+(\d{1,2}:\d{2}(?::\d{2})?\s?(?:am|pm)?)/i
  const fechaMatch = texto.match(fechaRegex)
  const fechaDetectada = fechaMatch
    ? `${fechaMatch[1]} ${fechaMatch[2].toUpperCase()}`
    : 'No detectada'

  // 💰 Monto (flexible Bs)
  const montoRegex = /(?:bs|bs\.?)\s*([\d.,]{3,15})/i
  const montoMatch = texto.match(montoRegex)
  const montoDetectado = montoMatch
    ? parseFloat(montoMatch[1].replace(/\./g, '').replace(',', '.'))
    : undefined

  // 📌 Validaciones contra empresaConfig
  const telefonoEsperado = empresaConfig.metodosPago.pagoMovil.telefono.replace(/[^\d]/g, '')
  const cedulaEsperada = empresaConfig.metodosPago.pagoMovil.cedula.replace(/[^\d]/g, '')
  const bancoEsperado = empresaConfig.metodosPago.pagoMovil.banco.toLowerCase()

  const telefonoValido = telefonoDetectado === telefonoEsperado
  const cedulaValida = cedulaDetectada.replace(/[^\d]/g, '') === cedulaEsperada
  const bancoValido = bancoDetectado.toLowerCase().includes(bancoEsperado)
  const montoValido = typeof montoDetectado === 'number' && Math.abs(montoDetectado - montoEsperado) < 1

  const valido = telefonoValido && cedulaValida && bancoValido && montoValido

  return {
    valido,
    telefonoDetectado,
    titularDetectado: `CI ${cedulaDetectada}`,
    correoDetectado: undefined,
    fechaDetectada,
    montoDetectado,
    referenciaDetectada,
    resumen: `📲 *Pago Móvil Detectado*

📱 Teléfono: ${telefonoDetectado}
🆔 Cédula: ${cedulaDetectada}
🏦 Banco: ${bancoDetectado}
🔢 Referencia: ${referenciaDetectada}
🕓 Fecha: ${fechaDetectada}
💰 Monto: ${montoDetectado ? `Bs ${montoDetectado.toFixed(2)}` : 'No detectado'}

${
  valido
    ? '✅ Comprobante válido. ¡Gracias por tu pago!'
    : '❌ El comprobante no coincide con los datos esperados.'
}`
  }
}
