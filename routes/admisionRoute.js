// 1. Requerir express
const express = require('express');

// 2. Crear una instancia de express.Router()
const router = express.Router();

// 3. Requerir AdmisionController
const AdmisionController = require('../controllers/admisionController.js');

// 4. Definir rutas
// Ruta para mostrar el formulario de nueva admisión
// Espera ?paciente_id=XYZ en la cadena de consulta (query string)
router.get('/nueva', AdmisionController.mostrarFormularioAdmision);

// Ruta para manejar el envío del formulario de nueva admisión
router.post('/', AdmisionController.registrarAdmision);

// Ruta para listar todas las admisiones
router.get('/', AdmisionController.listarAdmisiones);

// Ruta para ver los detalles de una admisión específica
router.get('/:id', AdmisionController.verAdmision);

// Ruta para actualizar el estado de una admisión
router.post('/:id/actualizar-estado', AdmisionController.actualizarEstadoAdmision);

// TODO: Agregar otras rutas relacionadas con admisiones aquí si es necesario

// 5. Exportar el router
module.exports = router;
