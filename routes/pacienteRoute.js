// 1. Requerir express
const express = require('express');

// 2. Crear una instancia de express.Router()
const router = express.Router();

// 3. Requerir controllers/pacienteController.js
const PacienteController = require('../controllers/pacienteController.js');

// 4. Definir una ruta GET de prueba simple para /test
router.get('/test', (req, res) => {
    res.status(200).send('Ruta de prueba de Paciente OK - Solicitud GET exitosa');
});

// 5. Definir una ruta POST para /test_post
router.post('/test_post', (req, res) => {
    res.status(200).json({ message: 'Ruta POST de prueba de Paciente OK', data: req.body });
});

// Rutas CRUD reales para Pacientes
router.get('/', PacienteController.listarPacientes);             // Ruta para listar todos los pacientes
router.get('/nuevo', PacienteController.mostrarFormularioNuevo); // Ruta para mostrar el formulario de nuevo paciente
router.post('/', PacienteController.insertar);                   // Ruta para manejar el envío del formulario de nuevo paciente
router.get('/:id', PacienteController.verPaciente);              // Ruta para ver un paciente específico
router.get('/:id/edit', PacienteController.mostrarFormularioEditar); // Ruta para mostrar el formulario de edición de paciente
router.post('/:id/actualizar', PacienteController.actualizarPaciente); // Ruta para procesar la actualización del paciente
router.post('/:id/delete', PacienteController.eliminarPaciente);   // Ruta para procesar la eliminación del paciente

// TODO: Agregar otras rutas para listar, detalle, actualizar, eliminar si es necesario

// 6. Exportar el router
module.exports = router;
