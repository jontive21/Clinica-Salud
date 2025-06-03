// 1. Requerir express
const express = require('express');

// 2. Crear una instancia de express.Router()
const router = express.Router();

// 3. Requerir EvaluacionMedicaController
const EvaluacionMedicaController = require('../controllers/evaluacionMedicaController.js');

// 4. Definir rutas

// Ruta para mostrar el formulario de nueva evaluación médica para una admisión específica
router.get('/admision/:admision_id/nueva', EvaluacionMedicaController.mostrarFormularioEvaluacionMedica);

// Ruta para enviar el formulario de nueva evaluación médica para una admisión específica
router.post('/admision/:admision_id', EvaluacionMedicaController.registrarEvaluacionMedica);

// Ruta para ver una evaluación médica específica por su propio ID
router.get('/:id', EvaluacionMedicaController.mostrarEvaluacionMedica);

// Ruta para mostrar el formulario para editar una evaluación médica existente
router.get('/:id/editar', EvaluacionMedicaController.mostrarFormularioEditarEvaluacionMedica);

// Ruta para procesar la actualización de una evaluación médica existente
router.post('/:id/actualizar', EvaluacionMedicaController.actualizarEvaluacionMedica);

// TODO: Agregar otras rutas relacionadas con la evaluación médica aquí si es necesario

// 5. Exportar el router
module.exports = router;
