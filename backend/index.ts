// index.ts (OK)
import { startBot } from './src/core/client'
import express from 'express'

startBot()

const app = express()
app.get('/', (_, res) => res.send('✅ Bot activo en Koyeb'))
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`🚀 Servidor HTTP corriendo en puerto ${PORT}`)
})
