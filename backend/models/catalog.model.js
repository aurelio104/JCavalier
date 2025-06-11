const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Definir el esquema del usuario
const userSchema = new mongoose.Schema({
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
userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password); // Compara la contraseña proporcionada con la cifrada
};

// Método para encriptar la contraseña antes de guardarla en la base de datos
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); // Solo encriptar si la contraseña ha sido modificada

  const salt = await bcrypt.genSalt(10); // Generar un "salt" para encriptar la contraseña
  this.password = await bcrypt.hash(this.password, salt); // Encriptar la contraseña con el "salt"
  next(); // Continuar con la operación de guardado
});

// Exportar el modelo de Usuario
module.exports = mongoose.model('User', userSchema);
