const jwt = require('jsonwebtoken'); // Usamos jsonwebtoken para manejar JWT
const User = require('../models/catalog.model'); // Suponiendo que User es tu modelo de usuario
const bcrypt = require('bcryptjs');
const secretKey = process.env.JWT_SECRET_KEY || 'yourSecretKey'; // Usa una clave secreta en producción

// Registro de usuario
exports.register = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send({ error: 'El usuario ya existe' });
    }

    // Cifrar la contraseña antes de guardarla
    const hashedPassword = bcrypt.hashSync(password, 10); // Cifrado de la contraseña con bcrypt

    // Crear un nuevo usuario
    const user = new User({ email, password: hashedPassword });
    await user.save();
    
    res.status(201).send({ message: 'Usuario registrado con éxito' });
  } catch (err) {
    console.error('Error al registrar el usuario:', err);
    res.status(400).send({ error: 'Error al registrar el usuario' });
  }
};

// Login de usuario
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Buscar el usuario por correo
    const user = await User.findOne({ email }); // Buscamos en la base de datos

    if (!user) {
      return res.status(401).send({ error: 'Credenciales inválidas' });
    }

    // Comparar la contraseña proporcionada con la almacenada
    const isMatch = await bcrypt.compare(password, user.password);  // Comparamos las contraseñas
    if (!isMatch) {
      return res.status(401).send({ error: 'Credenciales inválidas' });
    }

    // Crear y devolver el token JWT si las credenciales son correctas
    const payload = { id: user._id, email: user.email }; // Usamos '_id' en lugar de 'id'
    const token = jwt.sign(payload, secretKey, { expiresIn: '1h' }); // Generación del token JWT con expiración

    res.json({ token }); // Devolvemos el token generado
  } catch (err) {
    console.error('Error al iniciar sesión:', err);
    res.status(500).send({ error: 'Error en el servidor' });
  }
};
