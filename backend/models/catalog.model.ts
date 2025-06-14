import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

// Definir la interfaz para el modelo de Usuario
export interface IUser extends Document {
  email: string;
  password: string;
  _id: mongoose.Types.ObjectId;  // Añadir la propiedad _id de tipo ObjectId
  comparePassword(password: string): Promise<boolean>;  // Firma del método comparePassword
}

// Definir el esquema del usuario
const userSchema: Schema<IUser> = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true, // Convertir a minúsculas para asegurar unicidad
  },
  password: {
    type: String,
    required: true,
  },
});

// Método para comparar las contraseñas
userSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password); // Compara la contraseña proporcionada con la cifrada
};

// Método para encriptar la contraseña antes de guardarla en la base de datos
userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next(); // Solo encriptar si la contraseña ha sido modificada

  const salt: string = await bcrypt.genSalt(10); // Generar un "salt" para encriptar la contraseña
  this.password = await bcrypt.hash(this.password, salt); // Encriptar la contraseña con el "salt"
  next(); // Continuar con la operación de guardado
});

// Exportar el modelo de Usuario
export default mongoose.model<IUser>('User', userSchema);
