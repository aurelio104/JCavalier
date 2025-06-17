import { empresaConfig } from '../../config/empresaConfig'

export function validateTransferencia(ocrText: string, montoEsperadoBs: number) {
  const texto = ocrText.toLowerCase()
  const textoNormalizado = texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const lineas = ocrText.split(/\r?\n/).map(l =>
    l.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().replace(/\s+/g, ' ')
  )

  console.log('🧾 Texto normalizado:', textoNormalizado)
  console.log('📄 Líneas detectadas:', lineas)

  // ❌ Rechazo si contiene errores evidentes
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
      tipo: 'transferencia',
      titularDetectado: 'No detectado',
      montoDetectado: undefined,
      correoDetectado: undefined,
      telefonoDetectado: undefined,
      fechaDetectada: undefined,
      referenciaDetectada: 'No detectada',
      bancoDetectado: 'No detectado',
      cuentaDetectada: 'No detectada',
      beneficiarioDetectado: 'No detectado',
      resumen: '❌ El comprobante indica que la transacción fue fallida.'
    }
  }

  // 👤 Titular esperado
  const titularEsperado = empresaConfig.metodosPago.transferenciaBancaria.titular
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
  const titularDetectadoOk = textoNormalizado.includes(titularEsperado)
  const titularDetectado = titularDetectadoOk
    ? empresaConfig.metodosPago.transferenciaBancaria.titular
    : 'No detectado'

  // 💰 Monto en Bs
  const montoRegex = /(?:bs\.?|bol[ií]vares)?\s*([\d]{1,3}(?:[.,]\d{3})*(?:[.,]\d{2}))/i
  const montoMatch = texto.match(montoRegex)
  const montoDetectado = montoMatch
    ? parseFloat(montoMatch[1].replace(/\./g, '').replace(',', '.'))
    : undefined

  const montoValido = typeof montoDetectado === 'number' &&
    typeof montoEsperadoBs === 'number' &&
    montoEsperadoBs > 0 &&
    Math.abs(montoDetectado - montoEsperadoBs) < 1

  console.log(`💰 Monto detectado: ${montoDetectado} | Esperado: ${montoEsperadoBs} | Válido: ${montoValido}`)

  // 🔢 Referencia
  let referenciaDetectada = 'No detectada'
  for (let i = 0; i < lineas.length; i++) {
    const l = lineas[i].toLowerCase()
    if (l.includes('referencia')) {
      for (let j = i; j <= i + 3 && j < lineas.length; j++) {
        const match = lineas[j].match(/\d{6,}/)
        if (match) {
          referenciaDetectada = match[0]
          break
        }
      }
    }
    if (referenciaDetectada !== 'No detectada') break
  }
  if (referenciaDetectada === 'No detectada') {
    const fallback = ocrText.match(/\b\d{9,20}\b/)
    if (fallback) referenciaDetectada = fallback[0]
  }

  // 📅 Fecha y hora
  const fechaRegex = /(\d{2}\/\d{2}\/\d{4})[^\d]*(\d{1,2}:\d{2}(?::\d{2})?\s?(?:am|pm)?)/i
  const fechaMatch = ocrText.match(fechaRegex)
  const fechaDetectada = fechaMatch
    ? `${fechaMatch[1]} ${fechaMatch[2].toUpperCase()}`
    : 'No detectada'

  // 🧾 Beneficiario
  const beneficiarioLinea = lineas.find(linea =>
    linea.toLowerCase().includes('beneficiario')
  )
  const beneficiarioDetectado = beneficiarioLinea
    ? lineas[lineas.indexOf(beneficiarioLinea) + 1] ?? 'No detectado'
    : 'No detectado'

  // 🏦 Banco receptor
  const bancoEsperado = empresaConfig.metodosPago.transferenciaBancaria.banco
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  let bancoDetectado = 'No detectado'
  if (beneficiarioLinea) {
    const indexBenef = lineas.indexOf(beneficiarioLinea)
    const window = lineas.slice(indexBenef, indexBenef + 6).join(' ').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    if (window.includes(bancoEsperado)) {
      bancoDetectado = empresaConfig.metodosPago.transferenciaBancaria.banco
    }
  }
  const bancoValido = bancoDetectado !== 'No detectado'
  console.log(`🏦 Banco detectado: ${bancoDetectado} | Esperado: ${empresaConfig.metodosPago.transferenciaBancaria.banco} | Válido: ${bancoValido}`)

  // 💳 Últimos 4 dígitos de cuenta
  const cuentaMatch = ocrText.match(/\*{2,}(\d{4})/)
  const cuentaDetectada = cuentaMatch?.[1] ?? 'No detectado'

  // ✅ Validación final
  const valido = titularDetectadoOk && montoValido && bancoValido
  console.log(`✅ Resultado final válido: ${valido}`)

  return {
    tipo: 'transferencia',
    valido,
    titularDetectado,
    montoDetectado,
    correoDetectado: undefined,
    telefonoDetectado: undefined,
    fechaDetectada,
    referenciaDetectada,
    bancoDetectado,
    cuentaDetectada,
    beneficiarioDetectado,
    resumen: `🏦 *Transferencia Bancaria Detectada*

👤 Titular registrado: ${titularDetectado}
🏛️ Banco receptor: ${bancoDetectado}
💳 Cuenta destino (últimos 4): ${cuentaDetectada}
🧾 Beneficiario: ${beneficiarioDetectado}
🔢 Referencia: ${referenciaDetectada}
📅 Fecha: ${fechaDetectada}
💰 Monto: ${montoDetectado ? `Bs ${montoDetectado.toFixed(2)}` : 'No detectado'}

${valido
  ? '✅ Comprobante válido. ¡Gracias por tu pago!'
  : '❌ El comprobante no coincide con los datos esperados.'}`
  }
}
