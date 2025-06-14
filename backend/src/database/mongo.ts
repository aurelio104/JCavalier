import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

export async function connectMongo() {
  const uri = process.env.MONGO_URI
  if (!uri) throw new Error('MONGO_URI no definida en .env')

  try {
    await mongoose.connect(uri)
    console.log('✅ Conectado a MongoDB')
  } catch (err) {
    console.error('❌ Error conectando a MongoDB:', err)
  }
}
