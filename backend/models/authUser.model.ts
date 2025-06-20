import mongoose, { Schema, Document, CallbackError } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IAuthUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  comparePassword(password: string): Promise<boolean>;
}

const AuthUserSchema = new Schema<IAuthUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// 🔐 Método para comparar contraseñas
AuthUserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  console.log('🧪 Comparando contraseñas...');
  console.log('🔐 Contraseña proporcionada:', password);
  console.log('🧬 Hash guardado:', this.password);

  const result = await bcrypt.compare(password, this.password);
  console.log('📊 Resultado comparación:', result);
  return result;
};

// 🔄 Hook para encriptar contraseña antes de guardar
AuthUserSchema.pre<IAuthUser>('save', async function (next) {
  if (!this.isModified('password')) {
    console.log('⚠️ Contraseña no modificada. No se hasheará.');
    return next();
  }

  // ⚠️ NUEVO: Detectar si ya está hasheada
  if (this.password.startsWith('$2b$')) {
    console.warn('🚨 Contraseña ya parece hasheada. Se evitará re-hashear.');
    return next(); // 👉 evita doble hash
  }

  try {
    console.log('🔒 Hasheando contraseña...');
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log('✅ Contraseña hasheada:', this.password);
    next();
  } catch (err) {
    next(err as CallbackError);
  }
});


export default mongoose.models.AuthUser || mongoose.model<IAuthUser>('AuthUser', AuthUserSchema);
