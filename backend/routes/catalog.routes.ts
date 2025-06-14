import express, { Request, Response } from 'express';
import { register, login } from '../controllers/catalog.controller';  // Importamos los métodos del controlador

const router = express.Router();

// Ruta para registrar un nuevo usuario
router.post('/register', async (req: Request, res: Response) => {
  await register(req, res);  // Llamamos al controlador de registro
});

// Ruta para iniciar sesión y obtener el token JWT
router.post('/login', async (req: Request, res: Response) => {
  await login(req, res);  // Llamamos al controlador de login
});

export default router;
