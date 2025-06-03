// 1. Requerir express
const express = require('express');

// 2. Crear una instancia de express.Router()
const router = express.Router();

// 3. Requerir HabitacionController
const HabitacionController = require('../controllers/habitacionController.js');

// 4. Definir rutas
// GET / - Listar todas las habitaciones
router.get('/', HabitacionController.listarHabitaciones);

// GET /nueva - Mostrar formulario para crear una nueva habitación
router.get('/nueva', HabitacionController.mostrarFormularioCrear);

// POST / - Crear una nueva habitación
router.post('/', HabitacionController.crearHabitacion);

// GET /:id/editar - Mostrar formulario para editar una habitación
router.get('/:id/editar', HabitacionController.mostrarFormularioEditar);

// POST /:id/actualizar - Actualizar una habitación
router.post('/:id/actualizar', HabitacionController.actualizarHabitacion);

// POST /:id/eliminar - Eliminar una habitación
router.post('/:id/eliminar', HabitacionController.eliminarHabitacion);

// 5. Exportar el router
module.exports = router;
