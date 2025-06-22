import express, { Application, Request, Response } from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import * as bcrypt from 'bcryptjs'
import path from 'path'

// Bot y base de datos
import { startBot } from './src/core/client'
import User from './models/authUser.model'

// Rutas API
import catalogRoutes from './routes/catalog.routes'
import trackingRoute from './src/routes/tracking.route'
import adminPedidosRoute from './src/routes/adminPedidos.route'

dotenv.config()

const app: Application = express()
const PORT = process.env.PORT || 5000

// 📄 Motor de vistas (EJS para vistas públicas como seguimiento)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'src', 'views'))

// 🌐 Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json())

// 🧠 Conexión MongoDB
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/jcavalier'
mongoose.connect(mongoURI)
  .then(() => console.log('✅ Conectado a MongoDB Atlas'))
  .catch(err => console.error('❌ Error de conexión a MongoDB:', err))

// 🤖 Iniciar bot de WhatsApp
startBot()

// 🔐 Registro de usuario
app.post('/api/register', async (req: Request, res: Response) => {
  const { email, password } = req.body
  try {
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ error: 'El usuario ya existe' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = new User({ email, password: hashedPassword })
    await newUser.save()

    return res.status(201).json({ message: 'Usuario registrado con éxito' })
  } catch (error) {
    console.error('Error al registrar usuario:', error)
    return res.status(500).json({ error: 'Error al registrar el usuario' })
  }
})

// 🔑 Login
app.post('/api/login', async (req: Request, res: Response) => {
  const { email, password } = req.body
  try {
    const user = await User.findOne({ email })
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'yourSuperSecretKey',
      { expiresIn: '1h' }
    )

    return res.json({ token })
  } catch (error) {
    console.error('Error al iniciar sesión:', error)
    return res.status(500).json({ error: 'Error en el servidor' })
  }
})

// ❌ Eliminar usuario
app.post('/api/deleteUser', async (req: Request, res: Response) => {
  const { email } = req.body
  try {
    const result = await User.deleteOne({ email })
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }
    return res.status(200).json({ message: 'Usuario eliminado exitosamente' })
  } catch (err) {
    console.error('Error al eliminar el usuario:', err)
    return res.status(500).json({ error: 'Error al eliminar el usuario' })
  }
})

// 📦 Rutas API
app.use('/api', catalogRoutes)
app.use('/api', trackingRoute)
app.use('/api', adminPedidosRoute)

// 🌐 Rutas públicas amigables para seguimiento QR (sin /api)
app.use('/seguimiento', trackingRoute)

// ✅ Ruta base de prueba
app.get('/', (_req, res) => res.send('✅ Servidor y bot escuchando correctamente'))

// 🚀 Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor y bot escuchando en el puerto ${PORT}`)
})
