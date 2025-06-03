// 1. Requerir express
const express = require('express');

// 2. Crear una instancia de express.Router()
const router = express.Router();

// 3. Requerir controllers/pacienteController.js
const PacienteController = require('../controllers/pacienteController.js');

// Rutas CRUD para Pacientes
router.get('/', PacienteController.listarPacientes);             // Ruta para listar todos los pacientes
router.get('/nuevo', PacienteController.mostrarFormularioNuevo); // Ruta para mostrar el formulario de nuevo paciente
router.post('/', PacienteController.insertar);                   // Ruta para manejar el envío del formulario de nuevo paciente
router.get('/:id', PacienteController.verPaciente);              // Ruta para ver un paciente específico
router.get('/:id/editar', PacienteController.mostrarFormularioEditar); // Ruta para mostrar el formulario de edición de paciente
router.post('/:id/actualizar', PacienteController.actualizarPaciente); // Ruta para procesar la actualización del paciente
router.post('/:id/eliminar', PacienteController.eliminarPaciente);   // Ruta para procesar la eliminación del paciente

// 5. Exportar el router (el número de paso original 6 es ahora 5)
module.exports = router;
```
