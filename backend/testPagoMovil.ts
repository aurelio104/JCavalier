import { validatePagoMovil } from './src/ocr/ocr.validators/pagoMovil.validator'

// Simulación del texto OCR detectado desde la imagen
const textoOCR = `
¡Operación Exitosa!
NÚMERO DE REFERENCIA
051477432834
FECHA
16/06/2025 05:45 PM
NÚMERO CELULAR DE ORIGEN
04**-***2703
NÚMERO CELULAR DE DESTINO
04128966414
IDENTIFICACIÓN RECEPTOR
BANESCO BANCO UNIVERSAL S.A.C.A.
BANCO EMISOR
BANESCO BANCO UNIVERSAL S.A.C.A.
MONTO DE LA OPERACIÓN
BS 2.553,92
CONCEPTO
PAGO
`

// Monto esperado (USD convertido a Bs) — se asume ya calculado
const montoEsperado = 2553.92 // Bs exactos

// Ejecutar validación
const resultado = validatePagoMovil(textoOCR, montoEsperado)

// Mostrar resultado en consola
console.log('\n🧪 Resultado de testPagoMovil.ts:')
console.log('Valido:', resultado.valido)
console.log('Resumen:\n' + resultado.resumen)
console.log('Teléfono detectado:', resultado.telefonoDetectado)
console.log('Banco detectado:', resultado.bancoDetectado) // ✅ ahora correcto
console.log('Monto detectado:', resultado.montoDetectado)
console.log('Referencia detectada:', resultado.referenciaDetectada)
