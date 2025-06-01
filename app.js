// 1. Requerir Módulos
const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const pacienteRoutes = require('./routes/pacienteRoute'); // Requerir rutas de pacientes
const admisionRoutes = require('./routes/admisionRoute'); // Requerir rutas de admisiones
const alaRoutes = require('./routes/alaRoute');           // Requerir rutas de alas
const habitacionRoutes = require('./routes/habitacionRoute'); // Requerir rutas de habitaciones
const camaRoutes = require('./routes/camaRoute');             // Requerir rutas de camas
const asignacionCamaRoutes = require('./routes/asignacionCamaRoute.js'); // Requerir rutas de asignación de camas
const evaluacionEnfermeriaRoutes = require('./routes/evaluacionEnfermeriaRoute.js'); // Requerir rutas de evaluación de enfermería
const evaluacionMedicaRoutes = require('./routes/evaluacionMedicaRoute.js');     // Requerir rutas de evaluación médica
const alergiaCatalogoRoutes = require('./routes/alergiaCatalogoRoute.js'); // Requerir rutas del catálogo de alergias

// 2. Inicializar Aplicación Express
dotenv.config(); // Llamar esto temprano
const app = express();
const PORT = process.env.PORT || 3000;

// 3. Configuración del Motor de Vistas (Pug)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// 4. Middleware
app.use(express.json()); // para parsear application/json
app.use(express.urlencoded({ extended: false })); // para parsear application/x-www-form-urlencoded
app.use(express.static(path.join(__dirname, 'public'))); // para servir archivos estáticos desde el directorio public

// 5. Ruta Raíz Básica
app.get('/', (req, res) => {
    res.render('index', { title: 'Inicio - SIH' }); // Título de la página de inicio
});

// 6. Montar Rutas de Pacientes
app.use('/pacientes', pacienteRoutes);

// Montar Rutas de Admisiones
app.use('/admisiones', admisionRoutes);

// Montar Rutas de Alas
app.use('/alas', alaRoutes);

// Montar Rutas de Habitaciones
app.use('/habitaciones', habitacionRoutes);

// Montar Rutas de Camas
app.use('/camas', camaRoutes);

// Montar Rutas de Asignación de Camas
app.use('/asignaciones-cama', asignacionCamaRoutes);

// Montar Rutas de Evaluación de Enfermería
app.use('/evaluaciones-enfermeria', evaluacionEnfermeriaRoutes);

// Montar Rutas de Evaluación Médica
app.use('/evaluaciones-medicas', evaluacionMedicaRoutes);

// Montar Rutas del Catálogo de Alergias
app.use('/catalogo-alergias', alergiaCatalogoRoutes);

// 7. Middleware de Manejo de Errores 404
app.use((req, res, next) => {
    res.status(404).render('404', { title: 'Página No Encontrada' }); // Título para la vista 404
});

// 8. Middleware de Manejo de Errores Globales
app.use((err, req, res, next) => {
    console.error(err.stack); // Registra el stack del error para depuración
    const statusCode = err.status || 500;
    res.status(statusCode).render('500', {
        title: 'Error del Servidor', // Título para la vista 500
        message: err.message,     // Provee el mensaje de error a la plantilla
        // Solo filtra el objeto de error detallado en desarrollo
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// 9. Iniciar Servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`); // Mensaje del servidor traducido
});
