// ✅ src/utils/audio.transcriber.ts

import fs from 'fs'
import { OpenAI } from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

/**
 * Transcribe un archivo de audio (.mp3, .m4a, .ogg, etc.) usando Whisper API.
 * @param filePath Ruta absoluta del archivo de audio.
 * @returns Texto transcrito del audio.
 */
export async function transcribirAudio(filePath: string): Promise<string> {
  const file = fs.createReadStream(filePath)

  const response = await openai.audio.transcriptions.create({
    model: 'whisper-1',
    file,
    language: 'es', // Sugerimos que los usuarios hablen español, pero Whisper detecta automáticamente
    response_format: 'text'
  })

  return response
}
