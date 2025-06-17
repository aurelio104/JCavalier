import { empresaConfig } from '../../config/empresaConfig'

export function validateZelle(ocrText: string, montoEsperado: number) {
  const texto = ocrText.toLowerCase()

  // ❌ Filtro por error
  if (
    texto.includes('payment failed') ||
    texto.includes('transaction failed') ||
    texto.includes('error') ||
    texto.includes('cancelled')
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

  // 📧 Correo
  const correoRegex = /[\w.-]+@[\w.-]+\.\w+/i
  const correoMatch = ocrText.match(correoRegex)
  const correoDetectado = correoMatch?.[0] || 'No detectado'

  // 👤 Titular receptor
  const nombreRegex = /inscrito como\s+([A-Z\s]+)/i
  const nombreMatch = ocrText.match(nombreRegex)
  const receptorDetectado = nombreMatch?.[1]?.trim() || 'No detectado'

  // 💰 Monto en USD
  const montoRegex = /\$\s?([\d.,]{1,10})/
  const montoMatch = ocrText.match(montoRegex)
  const montoDetectado = montoMatch
    ? parseFloat(montoMatch[1].replace(/,/g, '').replace(/\./g, '.'))
    : undefined

  // 📅 Fecha
  const fechaRegex = /\b(?:[a-z]{3,9} \d{1,2},? \d{4}|\d{1,2}\/\d{1,2}\/\d{4})\b/i
  const fechaMatch = ocrText.match(fechaRegex)
  const fechaDetectada = fechaMatch?.[0] || 'No detectada'

  // 🔢 Referencia: mejora para detectar cuando aparece "número de <código>" con "confirmación" después
  let referenciaDetectada = 'No detectada'
  const referenciaBloque = ocrText.match(/n[uú]mero de\s+([A-Z0-9]{6,20})/i)
  if (referenciaBloque) {
    const pos = ocrText.indexOf(referenciaBloque[0])
    const after = ocrText.slice(pos, pos + 100).toLowerCase()
    if (after.includes('confirmación')) {
      referenciaDetectada = referenciaBloque[1]
    }
  }

  // 📌 Validaciones cruzadas
  const correoEsperado = empresaConfig.metodosPago.zelle.correo.toLowerCase().trim()
  const receptorEsperado = empresaConfig.metodosPago.zelle.titular?.toLowerCase().trim()

  const correoValido = correoDetectado.toLowerCase().trim() === correoEsperado

  const receptorValido = receptorEsperado
    ? receptorDetectado.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .includes(
          receptorEsperado.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        )
    : false

  const montoValido =
    typeof montoDetectado === 'number' &&
    Math.abs(montoDetectado - montoEsperado) < 1

  const valido = montoValido && (correoValido || receptorValido)

  return {
    valido,
    correoDetectado,
    montoDetectado,
    fechaDetectada,
    referenciaDetectada,
    telefonoDetectado: undefined,
    titularDetectado: receptorDetectado,
    resumen: '' // Se genera desde el flujo principal
  }
}
