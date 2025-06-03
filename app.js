// 1. Requerir Módulos
const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config(); // Llamar esto antes de cualquier uso de variables de entorno

const pacienteRoutes = require('./routes/pacienteRoute');
const admisionRoutes = require('./routes/admisionRoute');
const alaRoutes = require('./routes/alaRoute');
const habitacionRoutes = require('./routes/habitacionRoute');
const camaRoutes = require('./routes/camaRoute');
const asignacionCamaRoutes = require('./routes/asignacionCamaRoute');
const evaluacionEnfermeriaRoutes = require('./routes/evaluacionEnfermeriaRoute');
const evaluacionMedicaRoutes = require('./routes/evaluacionMedicaRoute');

// 2. Inicializar Aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// 3. Configuración del Motor de Vistas (Pug)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// 4. Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// 5. Ruta Raíz Básica
app.get('/', (req, res) => {
    res.render('index', { title: 'Inicio - SIH' });
});

// 6. Montar Rutas
app.use('/pacientes', pacienteRoutes);
app.use('/admisiones', admisionRoutes);
app.use('/alas', alaRoutes);
app.use('/habitaciones', habitacionRoutes);
app.use('/camas', camaRoutes);
app.use('/asignaciones-cama', asignacionCamaRoutes);
app.use('/evaluaciones-enfermeria', evaluacionEnfermeriaRoutes);
app.use('/evaluaciones-medicas', evaluacionMedicaRoutes);

// 7. Middleware de Manejo de Errores 404
app.use((req, res, next) => {
    res.status(404).render('404', { title: 'Página No Encontrada' });
});

// 8. Middleware de Manejo de Errores Globales
app.use((err, req, res, next) => {
    console.error(err.stack);
    const statusCode = err.status || 500;
    res.status(statusCode).render('500', {
        title: 'Error del Servidor',
        message: err.message,
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// 9. Iniciar Servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
