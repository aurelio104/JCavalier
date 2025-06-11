const bcrypt = require('bcryptjs');

// Hash de la contraseña almacenado en la base de datos (copia este valor)
const hashedPassword = '$2b$10$7PSxBC6oTUH9bTUvIIQWQ.QptALLIvRMDZOgPB3g95a5hOQ86nXsW';

// Contraseña proporcionada por el usuario (la que se ingresa en el login)
const inputPassword = 'jcavalier2025'; // La contraseña proporcionada por el usuario

// Compara la contraseña proporcionada con el hash almacenado
bcrypt.compare(inputPassword, hashedPassword).then(isMatch => {
  console.log(isMatch);  // Esto imprimirá 'true' si las contraseñas coinciden, 'false' si no
});
