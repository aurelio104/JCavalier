import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import catalogRoutes from './routes/catalog.routes';  // Rutas de catálogo

// Cargar variables de entorno desde el archivo .env
dotenv.config();

const app: Application = express();  // Tipamos la aplicación como de tipo Application

// Middleware
app.use(cors());  // Habilitar CORS para permitir solicitudes desde otros dominios
app.use(express.json());  // Permite que Express maneje el cuerpo de las solicitudes como JSON

// Rutas de la API
app.use('/api/catalog', catalogRoutes);  // Definir las rutas para /api/catalog

// Exportar la aplicación para que pueda ser utilizada en otros archivos (como server.ts)
export default app;
