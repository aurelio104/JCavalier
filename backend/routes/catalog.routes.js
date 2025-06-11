const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/catalog.controller'); // Importamos los métodos del controlador

// Ruta para registrar un nuevo usuario
router.post('/register', register);

// Ruta para iniciar sesión y obtener el token JWT
router.post('/login', login);

module.exports = router;
