import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import AuthUser, { IAuthUser } from '../models/authUser.model';

const secretKey: string = process.env.JWT_SECRET || 'yourSuperSecretKey'; // ✅ Usa variable correcta

// 🔐 Registro de usuario
export const register = async (req: Request, res: Response): Promise<Response> => {
  const { email, password }: { email: string; password: string } = req.body;

  try {
    const existingUser: IAuthUser | null = await AuthUser.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    const newUser = new AuthUser({ email, password }); // el pre-save hook se encarga del hash
    await newUser.save();

    return res.status(201).json({ message: 'Usuario registrado con éxito' });
  } catch (err) {
    console.error('❌ Error al registrar el usuario:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// 🔑 Login de usuario
export const login = async (req: Request, res: Response): Promise<Response> => {
  const { email, password }: { email: string; password: string } = req.body;

  try {
    const user: IAuthUser | null = await AuthUser.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const isMatch: boolean = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const payload = {
      id: user._id.toString(),
      email: user.email,
    };

    const token: string = jwt.sign(payload, secretKey, { expiresIn: '1h' });

    return res.status(200).json({ token });
  } catch (err) {
    console.error('❌ Error al iniciar sesión:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};
