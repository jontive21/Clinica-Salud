// routes/asignacionCamaRoute.js
const express = require('express'); // Requerir express
const router = express.Router();    // Crear una instancia de express.Router()
const AsignacionCamaController = require('../controllers/asignacionCamaController.js'); // Requerir AsignacionCamaController

// Ruta para mostrar el formulario de asignación de cama para una admisión específica
router.get('/admision/:admision_id/asignar-cama/ui', AsignacionCamaController.mostrarFormularioAsignarCama);

// Ruta para procesar la asignación de cama
router.post('/admision/:admision_id/asignar-cama', AsignacionCamaController.asignarCama);

// Ruta para procesar la liberación de cama
router.post('/admision/:admision_id/liberar-cama', AsignacionCamaController.liberarCamaAsignada);

module.exports = router; // Exportar el router
