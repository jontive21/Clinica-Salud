// 1. Requerir express
const express = require('express');

// 2. Crear una instancia de express.Router()
const router = express.Router();

// 3. Requerir EvaluacionEnfermeriaController
const EvaluacionEnfermeriaController = require('../controllers/evaluacionEnfermeriaController.js');

// 4. Definir rutas

// Ruta para mostrar el formulario de nueva evaluación para una admisión específica
router.get('/admision/:admision_id/nueva', EvaluacionEnfermeriaController.mostrarFormularioEvaluacion);

// Ruta para enviar el formulario de nueva evaluación para una admisión específica
router.post('/admision/:admision_id', EvaluacionEnfermeriaController.registrarEvaluacion);

// Ruta para ver una evaluación específica por su propio ID
router.get('/:id', EvaluacionEnfermeriaController.mostrarEvaluacion);

// Ruta para mostrar el formulario para editar una evaluación existente
router.get('/:id/edit', EvaluacionEnfermeriaController.mostrarFormularioEditarEvaluacion);

// Ruta para procesar la actualización de una evaluación existente
router.post('/:id/actualizar', EvaluacionEnfermeriaController.actualizarEvaluacion);

// TODO: Agregar otras rutas relacionadas con la evaluación aquí si es necesario

// 5. Exportar el router
module.exports = router;
