import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User, { IUser } from '../models/catalog.model';  // Importamos el modelo con el tipo IUser
const secretKey: string = process.env.JWT_SECRET_KEY || 'yourSecretKey';  // Definir el tipo de secretKey

// Registro de usuario
export const register = async (req: Request, res: Response): Promise<Response> => {
  const { email, password }: { email: string; password: string } = req.body;  // Tipamos los datos de entrada

  try {
    // Verificar si el usuario ya existe
    const existingUser: IUser | null = await User.findOne({ email });  // Usamos el tipo IUser para el modelo User
    if (existingUser) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    // Cifrar la contraseña antes de guardarla
    const hashedPassword: string = bcrypt.hashSync(password, 10);  // Cifrado de la contraseña con bcrypt

    // Crear un nuevo usuario
    const user: IUser = new User({ email, password: hashedPassword });  // Crear un usuario tipado
    await user.save();
    
    return res.status(201).json({ message: 'Usuario registrado con éxito' });
  } catch (err) {
    console.error('Error al registrar el usuario:', err);
    return res.status(400).json({ error: 'Error al registrar el usuario' });
  }
};

// Login de usuario
export const login = async (req: Request, res: Response): Promise<Response> => {
  const { email, password }: { email: string; password: string } = req.body;  // Tipamos los datos de entrada

  try {
    // Buscar el usuario por correo
    const user: IUser | null = await User.findOne({ email });  // Buscamos en la base de datos

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Comparar la contraseña proporcionada con la almacenada
    const isMatch: boolean = await bcrypt.compare(password, user.password);  // Comparamos las contraseñas
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Crear y devolver el token JWT si las credenciales son correctas
    const payload: { id: string; email: string } = { id: user._id.toString(), email: user.email };  // Usamos '_id' en lugar de 'id'
    const token: string = jwt.sign(payload, secretKey, { expiresIn: '1h' });  // Generación del token JWT con expiración

    return res.json({ token });  // Devolvemos el token generado
  } catch (err) {
    console.error('Error al iniciar sesión:', err);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
};
