import { empresaConfig } from '../../config/empresaConfig'

export function validateTransferencia(ocrText: string, montoEsperado: number) {
  const texto = ocrText.toLowerCase()

  // ❌ Rechazo por mensajes de error comunes
  if (
    texto.includes('transacción fallida') ||
    texto.includes('transaccion fallida') ||
    texto.includes('operación fallida') ||
    texto.includes('rechazada') ||
    texto.includes('no procesado') ||
    texto.includes('error')
  ) {
    return {
      valido: false,
      titularDetectado: 'No detectado',
      montoDetectado: undefined,
      correoDetectado: undefined,
      telefonoDetectado: undefined,
      fechaDetectada: undefined,
      referenciaDetectada: 'No detectada',
      resumen: '❌ El comprobante indica que la transacción fue fallida.'
    }
  }

  // 👤 Titular esperado
  const titularEsperado = empresaConfig.metodosPago.transferenciaBancaria.titular
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
  const textoNormalizado = texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const titularDetectadoOk = textoNormalizado.includes(titularEsperado)
  const titularDetectado = titularDetectadoOk
    ? empresaConfig.metodosPago.transferenciaBancaria.titular
    : 'No detectado'

  // 💰 Monto
  const montoRegex = /(?:bs|bs\.?)\s*([\d.,]{3,15})/i
  const montoMatch = ocrText.match(montoRegex)
  const montoDetectado = montoMatch
    ? parseFloat(montoMatch[1].replace(/\./g, '').replace(',', '.'))
    : undefined
  const montoValido = typeof montoDetectado === 'number' && Math.abs(montoDetectado - montoEsperado) < 1

  // 🔢 Referencia: buscar hasta 4 líneas después de "referencia"
  const lineas = ocrText.split(/\r?\n/).map(l => l.trim())
  let referenciaDetectada = 'No detectada'

  for (let i = 0; i < lineas.length; i++) {
    if (lineas[i].toLowerCase().includes('referencia')) {
      for (let j = i + 1; j <= i + 4 && j < lineas.length; j++) {
        const match = lineas[j].match(/\d{6,20}/)
        if (match) {
          referenciaDetectada = match[0]
          break
        }
      }
      break
    }
  }

  // 🗓️ Fecha
  const fechaRegex = /(\d{2}\/\d{2}\/\d{4})\s+(\d{1,2}:\d{2}(?::\d{2})?\s?(?:am|pm|AM|PM)?)/i
  const fechaMatch = texto.match(fechaRegex)
  const fechaDetectada = fechaMatch
    ? `${fechaMatch[1]} ${fechaMatch[2].toUpperCase()}`
    : 'No detectada'

  // 🏦 Banco receptor
  const bancoEsperado = empresaConfig.metodosPago.transferenciaBancaria.banco.toLowerCase()
  const bancoDetectado = texto.includes(bancoEsperado) ? bancoEsperado : 'No detectado'
  const bancoValido = bancoDetectado !== 'No detectado'

  const valido = titularDetectadoOk && montoValido && bancoValido

  return {
    valido,
    titularDetectado,
    montoDetectado,
    correoDetectado: undefined,
    telefonoDetectado: undefined,
    fechaDetectada,
    referenciaDetectada,
    resumen: `🏦 *Transferencia Bancaria Detectada*

👤 Titular: ${titularDetectado}
🏛️ Banco receptor: ${bancoDetectado}
🔢 Referencia: ${referenciaDetectada}
📅 Fecha: ${fechaDetectada}
💰 Monto: ${montoDetectado ? `Bs ${montoDetectado.toFixed(2)}` : 'No detectado'}

${
  valido
    ? '✅ Comprobante válido. ¡Gracias por tu pago!'
    : '❌ El comprobante no coincide con los datos esperados.'
}`
  }
}
