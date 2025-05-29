// 1. Requerir express
const express = require('express');

// 2. Crear una instancia de express.Router()
const router = express.Router();

// 3. Requerir AlaController
const AlaController = require('../controllers/alaController.js');

// 4. Definir rutas
// GET / - Listar todas las alas
router.get('/', AlaController.listarAlas);

// GET /nueva - Mostrar formulario para crear una nueva ala
router.get('/nueva', AlaController.mostrarFormularioCrear);

// POST / - Crear una nueva ala
router.post('/', AlaController.crearAla);

// GET /:id/edit - Mostrar formulario para editar un ala
router.get('/:id/edit', AlaController.mostrarFormularioEditar);

// POST /:id/actualizar - Actualizar un ala
router.post('/:id/actualizar', AlaController.actualizarAla);

// POST /:id/delete - Eliminar un ala
router.post('/:id/delete', AlaController.eliminarAla);

// 5. Exportar el router
module.exports = router;
