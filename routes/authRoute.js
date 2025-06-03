// 1. Requerir express
const express = require('express');

// 2. Crear una instancia de express.Router()
const router = express.Router();

// 3. Requerir AuthController
const AuthController = require('../controllers/authController.js');

// 4. Definir rutas de autenticación

// GET /auth/login - Mostrar el formulario de inicio de sesión
router.get('/login', AuthController.mostrarFormularioLogin);

// POST /auth/login - Procesar el intento de inicio de sesión
router.post('/login', AuthController.loginUsuario);

// GET /auth/logout - Cerrar la sesión del usuario
router.get('/logout', AuthController.logoutUsuario);

// El registro de usuarios no se incluye en esta fase simplificada.
// router.get('/registro', AuthController.mostrarFormularioRegistro);
// router.post('/registro', AuthController.registrarUsuario);

// 5. Exportar el router
module.exports = router;
