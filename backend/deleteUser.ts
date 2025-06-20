import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

const uri = process.env.MONGO_URI!
const targetEmail = 'admin@jcavalier.com'

const run = async () => {
  try {
    await mongoose.connect(uri)
    await mongoose.connection.asPromise()

    const db = mongoose.connection.db
    if (!db) throw new Error('❌ No se pudo acceder a la base de datos')

    const result = await db.collection('authusers').deleteMany({ email: targetEmail })
    console.log(`🗑️ Usuarios con email "${targetEmail}" eliminados:`, result.deletedCount)
  } catch (err) {
    console.error('❌ Error:', err)
  } finally {
    await mongoose.disconnect()
  }
}

run()
