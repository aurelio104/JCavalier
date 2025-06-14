import express, { Application, Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors'; // Middleware para CORS
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken'; // Librería para manejar autenticación JWT
import bcrypt from 'bcryptjs'; // Librería para cifrar contraseñas
import User from './models/catalog.model'; // Modelo de usuario
import catalogRoutes from './routes/catalog.routes'; // Rutas del catálogo

// Cargar variables de entorno desde el archivo .env
dotenv.config();

const app: Application = express();
const PORT: string | number = process.env.PORT || 5000; // El puerto es de tipo string o número

// Configuración de CORS: Permitimos solicitudes desde cualquier origen (idealmente deberías restringir en producción)
app.use(cors({
  origin: '*', // Cambia esto en producción por un dominio específico
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Conexión a la base de datos MongoDB usando la URI definida en el archivo .env
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/jcavalier'; // MongoDB Atlas o local
mongoose.connect(mongoURI)
  .then(() => console.log('Conectado a la base de datos'))
  .catch((err: Error) => console.log('Error de conexión a la base de datos:', err));

// Middleware para parsear las solicitudes con cuerpos en formato JSON
app.use(express.json());

// Ruta para registrar un nuevo usuario
app.post('/api/register', async (req: Request, res: Response): Promise<Response> => {
  const { email, password }: { email: string; password: string } = req.body;

  try {
    // Verificar si el usuario ya existe en la base de datos
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    // Cifrar la contraseña antes de guardarla
    const hashedPassword: string = bcrypt.hashSync(password, 10); // Se utiliza bcrypt para cifrar la contraseña

    // Crear un nuevo usuario
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    return res.status(201).json({ message: 'Usuario registrado con éxito' });
  } catch (error) {
    console.error('Error al registrar el usuario:', error);
    return res.status(500).json({ error: 'Error al registrar el usuario' });
  }
});

// Ruta para el login (autenticación)
app.post('/api/login', async (req: Request, res: Response): Promise<Response> => {
  const { email, password }: { email: string; password: string } = req.body;

  try {
    // Verificar si el usuario existe en la base de datos
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Comparar la contraseña proporcionada con la almacenada en la base de datos
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar un token JWT si las credenciales son correctas
    const token: string = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'yourSuperSecretKey',  // Se usa JWT_SECRET desde el archivo .env
      { expiresIn: '1h' }  // El token expira en 1 hora
    );

    return res.json({ token });  // Devolver el token como respuesta
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Ruta para eliminar un usuario
app.post('/api/deleteUser', async (req: Request, res: Response): Promise<Response> => {
  const { email }: { email: string } = req.body;

  try {
    // Eliminar el usuario basado en el email
    const result = await User.deleteOne({ email });

    // Si no se encontró ningún usuario para eliminar
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    return res.status(200).json({ message: 'Usuario eliminado exitosamente' });
  } catch (err) {
    console.error('Error al eliminar el usuario:', err);
    return res.status(500).json({ error: 'Error al eliminar el usuario' });
  }
});

// Usar las rutas definidas para el catálogo
app.use('/api', catalogRoutes);

// Iniciar el servidor y escuchar en el puerto definido
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
