import { validateTransferencia } from './src/ocr/ocr.validators/transferencia.validator'

// Simulación del texto OCR desde imagen
const textoOCR = `
¡Operación Exitosa!
NÚMERO DE REFERENCIA
51648081809
FECHA
13/06/2025 02:13:39PM
DESDE MI CUENTA
****8977
NOMBRE DEL BANCO
BANESCO
BENEFICIARIO
JHONNY SANCHEZ
NÚMERO DE CUENTA
****1212
MONTO DE LA OPERACIÓN
BS 2.553,92
CONCEPTO
Pago de servicio
`

// 💰 Monto esperado exacto (convertido previamente si es en USD)
const montoEsperado = 4397.00

// Ejecutar validación
const resultado = validateTransferencia(textoOCR, montoEsperado)

// Mostrar resultados en consola
console.log('\n🧪 Resultado de testTransferencia.ts:')
console.log('Valido:', resultado.valido)
console.log('Resumen:\n' + resultado.resumen)
console.log('Titular detectado:', resultado.titularDetectado)
console.log('Banco detectado:', resultado.bancoDetectado || 'No detectado')
console.log('Cuenta detectada (últimos 4):', resultado.cuentaDetectada || 'No detectada')
console.log('Beneficiario detectado:', resultado.beneficiarioDetectado || 'No detectado')
console.log('Monto detectado:', resultado.montoDetectado)
console.log('Referencia detectada:', resultado.referenciaDetectada)
