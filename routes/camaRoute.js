// 1. Requerir express
const express = require('express');

// 2. Crear una instancia de express.Router()
const router = express.Router();

// 3. Requerir CamaController
const CamaController = require('../controllers/camaController.js');

// 4. Definir rutas
// GET / - Listar todas las camas
router.get('/', CamaController.listarCamas);

// GET /nueva - Mostrar formulario para crear una nueva cama
router.get('/nueva', CamaController.mostrarFormularioCrear);

// POST / - Crear una nueva cama
router.post('/', CamaController.crearCama);

// GET /:id/edit - Mostrar formulario para editar una cama
router.get('/:id/edit', CamaController.mostrarFormularioEditar);

// POST /:id/actualizar - Actualizar una cama
router.post('/:id/actualizar', CamaController.actualizarCama);

// POST /:id/delete - Eliminar una cama
router.post('/:id/delete', CamaController.eliminarCama);

// 5. Exportar el router
module.exports = router;
