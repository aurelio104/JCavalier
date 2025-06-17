import fs from 'fs'
import path from 'path'
import axios from 'axios'
import FormData from 'form-data'
import { config } from 'dotenv'

config() // Carga las variables del archivo .env

/**
 * Transcribe una nota de voz usando la API de Whisper de OpenAI.
 * @param filePath Ruta local al archivo .mp3 de la nota de voz
 * @returns Texto transcrito o null si falla
 */
export async function transcribirNotaDeVoz(filePath: string): Promise<string | null> {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      console.error('❌ Falta la clave de API de OpenAI (OPENAI_API_KEY)')
      return null
    }

    const audioStream = fs.createReadStream(filePath)

    const form = new FormData()
    form.append('file', audioStream)
    form.append('model', 'whisper-1')
    form.append('language', 'es') // Opcional: fuerza español

    const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', form, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        ...form.getHeaders()
      },
      maxBodyLength: Infinity
    })

    return response.data.text?.trim() || null
  } catch (error: any) {
    console.error('❌ Error al transcribir audio:', error.response?.data || error.message)
    return null
  }
}
