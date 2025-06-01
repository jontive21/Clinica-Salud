const express = require('express');
const router = express.Router();
const AlergiaCatalogoController = require('../controllers/alergiaCatalogoController.js');

// Rutas para el CRUD del Catálogo de Alergias

// GET /catalogo-alergias - Listar todas las alergias del catálogo
router.get('/', AlergiaCatalogoController.listarAlergiasCatalogo);

// GET /catalogo-alergias/nueva - Mostrar formulario para crear nueva alergia
router.get('/nueva', AlergiaCatalogoController.mostrarFormularioCrearAlergia);

// POST /catalogo-alergias - Crear una nueva alergia en el catálogo
router.post('/', AlergiaCatalogoController.crearAlergiaCatalogo);

// GET /catalogo-alergias/:id/editar - Mostrar formulario para editar alergia
router.get('/:id/editar', AlergiaCatalogoController.mostrarFormularioEditarAlergia);

// POST /catalogo-alergias/:id/actualizar - Actualizar una alergia existente
router.post('/:id/actualizar', AlergiaCatalogoController.actualizarAlergiaCatalogo);

// POST /catalogo-alergias/:id/eliminar - Eliminar una alergia del catálogo
router.post('/:id/eliminar', AlergiaCatalogoController.eliminarAlergiaCatalogo);

module.exports = router;
