// ✅ src/ocr/ocr.reader.ts — OCR multilingüe (español + inglés)

import { createWorker } from 'tesseract.js'
import path from 'path'
import fs from 'fs/promises'

let worker: any = null
let workerInitialized = false

async function inicializarWorker() {
  if (workerInitialized) return
  worker = await createWorker('spa+eng') // 🧠 Idiomas combinados: español + inglés
  workerInitialized = true
}

export async function leerTextoDesdeImagen(rutaImagen: string): Promise<string> {
  try {
    await inicializarWorker()

    const imagePath = path.resolve(rutaImagen)
    const exists = await fs.stat(imagePath).then(() => true).catch(() => false)
    if (!exists) throw new Error(`❌ Imagen no encontrada en la ruta: ${imagePath}`)

    const { data } = await worker.recognize(imagePath)
    let texto = data.text.trim()

    // 🧽 Limpieza básica del texto OCR
    texto = texto.replace(/\s{2,}/g, ' ').replace(/\n+/g, '\n').trim()

    console.log('🧾 Texto detectado OCR:')
    console.log(texto)
    return texto
  } catch (error: any) {
    console.error('❌ Error al leer imagen con OCR:', error.message || error)
    return ''
  }
}
