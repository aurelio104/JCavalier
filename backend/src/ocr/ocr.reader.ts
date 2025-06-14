// ✅ src/ocr/ocr.reader.ts — Versión funcional sin errores de tipo

import { createWorker } from 'tesseract.js'
import path from 'path'

let worker: any = null
let workerInitialized = false

async function inicializarWorker() {
  if (workerInitialized) return

  worker = await createWorker({
    // 👇 Esta opción es válida, pero TypeScript no lo reconoce salvo con `any`
    // Alternativamente puedes quitarla si no deseas ver logs del OCR
    // logger: (m: any) => console.log('[OCR]', m)
  } as any) // 👈 Evita el error "logger no existe" con `as any`

  await worker.load()
  await worker.loadLanguage('spa') // 👈 Esto sí existe en tiempo de ejecución
  await worker.initialize('spa')

  workerInitialized = true
}

export async function leerTextoDesdeImagen(rutaImagen: string): Promise<string> {
  try {
    await inicializarWorker()

    const imagePath = path.resolve(rutaImagen)
    const { data } = await worker.recognize(imagePath)
    const texto = data.text.trim()

    console.log('🧾 Texto detectado OCR:', texto)
    return texto
  } catch (error) {
    console.error('❌ Error al leer imagen con OCR:', error)
    return ''
  }
}
