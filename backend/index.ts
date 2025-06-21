// index.ts
import { startBot } from './src/core/client'
import express from 'express'
import dotenv from 'dotenv'

// Carga variables de entorno (.env en desarrollo)
dotenv.config()

// Inicializa el bot de WhatsApp
startBot()

// App express para Koyeb y salud local
const app = express()
app.get('/', (_, res) => res.send('✅ Bot activo en Koyeb'))

/**
 * 🧠 Lógica de puerto:
 * - Koyeb define PORT automáticamente (usualmente 3000)
 * - En local puedes definir BOT_PORT en tu .env para evitar conflictos con el server.ts (puerto 5000)
 */
const PORT = process.env.PORT || process.env.BOT_PORT || 3000

app.listen(PORT, () => {
  console.log(`🚀 Servidor HTTP corriendo en puerto ${PORT}`)
})
