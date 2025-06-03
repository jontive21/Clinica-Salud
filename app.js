// 1. Requerir Módulos
const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const session = require('express-session'); // Requerir express-session
const pacienteRoutes = require('./routes/pacienteRoute'); // Requerir rutas de pacientes
const admisionRoutes = require('./routes/admisionRoute'); // Requerir rutas de admisiones
const alaRoutes = require('./routes/alaRoute');           // Requerir rutas de alas
const habitacionRoutes = require('./routes/habitacionRoute'); // Requerir rutas de habitaciones
const camaRoutes = require('./routes/camaRoute');             // Requerir rutas de camas
const asignacionCamaRoutes = require('./routes/asignacionCamaRoute.js'); // Requerir rutas de asignación de camas
const evaluacionEnfermeriaRoutes = require('./routes/evaluacionEnfermeriaRoute.js'); // Requerir rutas de evaluación de enfermería
const evaluacionMedicaRoutes = require('./routes/evaluacionMedicaRoute.js');     // Requerir rutas de evaluación médica
const alergiaCatalogoRoutes = require('./routes/alergiaCatalogoRoute.js'); // Requerir rutas del catálogo de alergias
const authRoutes = require('./routes/authRoute.js'); // Requerir rutas de autenticación
const { ensureAuthenticated } = require('./middleware/authMiddleware.js'); // Requerir middleware de autenticación

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

// Configuración de Sesión (debe ir antes del montaje de rutas que la usen)
app.use(session({
    secret: process.env.SESSION_SECRET || 'un secreto muy pero muy secreto', // Usar variable de entorno; cambiar este default en producción
    resave: false, // No volver a guardar la sesión si no se modificó
    saveUninitialized: false, // No crear sesión hasta que algo se almacene (ej. en login)
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Usar cookies seguras en producción (HTTPS)
        maxAge: 1000 * 60 * 60 * 24 // Duración de la cookie de sesión (ej. 24 horas)
    }
}));

// Middleware para pasar datos de sesión a las vistas (res.locals)
app.use((req, res, next) => {
    if (req.session && req.session.usuario_id) {
        res.locals.usuarioAutenticado = true;
        res.locals.nombreUsuarioSesion = req.session.nombre_usuario;
        // res.locals.idUsuarioSesion = req.session.usuario_id; // Opcional si se necesita el ID en las vistas
    } else {
        res.locals.usuarioAutenticado = false;
    }
    next();
});

// 5. Ruta Raíz Básica
app.get('/', (req, res) => {
    res.render('index', { title: 'Inicio - SIH' }); // Título de la página de inicio
});

// Montar Rutas de Autenticación (públicas)
app.use('/auth', authRoutes);

// 6. Montar Rutas Protegidas de la Aplicación
// Todas las rutas debajo de este punto requerirán autenticación.
app.use('/pacientes', ensureAuthenticated, pacienteRoutes);
app.use('/admisiones', ensureAuthenticated, admisionRoutes);
app.use('/alas', ensureAuthenticated, alaRoutes);
app.use('/habitaciones', ensureAuthenticated, habitacionRoutes);
app.use('/camas', ensureAuthenticated, camaRoutes);
app.use('/asignaciones-cama', ensureAuthenticated, asignacionCamaRoutes);
app.use('/evaluaciones-enfermeria', ensureAuthenticated, evaluacionEnfermeriaRoutes);
app.use('/evaluaciones-medicas', ensureAuthenticated, evaluacionMedicaRoutes);
app.use('/catalogo-alergias', ensureAuthenticated, alergiaCatalogoRoutes);

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
