// 📁 src/ocr/ocr.validators/transferencia.validator.ts
import { empresaConfig } from '../../config/empresaConfig'

export function validateTransferencia(ocrText: string, montoEsperado: number) {
  const titularRegex = new RegExp(empresaConfig.metodosPago.transferenciaBancaria.titular, 'i')
  const montoRegex = /Bs\s*([\d.,]+)/i

  const titularValido = titularRegex.test(ocrText)
  const montoMatch = ocrText.match(montoRegex)
  const montoDetectado = montoMatch ? parseFloat(montoMatch[1].replace(',', '.')) : 0
  const montoValido = Math.abs(montoDetectado - montoEsperado) < 1

  return {
    valido: titularValido && montoValido,
    titularDetectado: titularValido ? empresaConfig.metodosPago.transferenciaBancaria.titular : '',
    montoDetectado,
    resumen: `🏦 Transferencia Detectada\nTitular: ${empresaConfig.metodosPago.transferenciaBancaria.titular}\nMonto: Bs ${montoDetectado}`
  }
}
