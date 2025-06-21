// index.ts
import { startBot } from './src/core/client'
import express from 'express'
import dotenv from 'dotenv'

// ✅ Carga variables de entorno desde .env
dotenv.config()

// ✅ Inicia el bot de WhatsApp
startBot()

// ✅ Crea app Express para healthcheck o pruebas en local
const app = express()
app.get('/', (_, res) => res.send('✅ Bot activo y corriendo'))

/**
 * 🧠 Prioridad de puertos:
 * - En desarrollo local, usa BOT_PORT (para no chocar con server.ts que usa PORT)
 * - En Koyeb (producción), se define automáticamente PORT
 */
const PORT = process.env.BOT_PORT || process.env.PORT || 3000

// ✅ Inicia el servidor HTTP
app.listen(PORT, () => {
  console.log(`🚀 Bot WhatsApp corriendo en puerto ${PORT}`)
})
