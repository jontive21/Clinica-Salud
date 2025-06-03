const Usuario = require('../models/usuarioModel.js');
const bcrypt = require('bcryptjs'); // Aunque verificarPassword está en el modelo, bcrypt podría usarse aquí si se quisiera. El modelo ya lo usa.

/**
 * Controlador para la autenticación de usuarios.
 * @namespace AuthController
 */
const AuthController = {
    /**
     * Muestra el formulario de inicio de sesión.
     * @param {object} req - Objeto de solicitud Express.
     * @param {object} res - Objeto de respuesta Express.
     * @memberof AuthController
     */
    mostrarFormularioLogin(req, res) {
        res.render('auth/login', { // Vista a crear
            title: 'Iniciar Sesión - SIH',
            errors: [], // Para mostrar errores de validación o de login
            email: ''   // Para repoblar el email en caso de error
        });
    },

    /**
     * Procesa el intento de inicio de sesión de un usuario.
     * @param {object} req - Objeto de solicitud Express.
     * @param {object} res - Objeto de respuesta Express.
     * @param {function} next - Función para pasar el control al siguiente middleware (manejo de errores).
     * @memberof AuthController
     */
    async loginUsuario(req, res, next) {
        const { email, password } = req.body;
        const errores = [];

        // Validación básica
        if (!email || email.trim() === '') {
            errores.push({ msg: 'El campo Email es obligatorio.' });
        }
        if (!password || password.trim() === '') {
            errores.push({ msg: 'El campo Contraseña es obligatorio.' });
        }

        if (errores.length > 0) {
            return res.status(400).render('auth/login', {
                title: 'Iniciar Sesión - SIH',
                errors: errores,
                email: email || '' // Repoblar email si se proporcionó
            });
        }

        try {
            const usuario = await Usuario.buscarPorEmail(email);

            if (!usuario || !usuario.password) {
                // Mensaje genérico para no revelar si el email existe o no
                errores.push({ msg: 'Credenciales incorrectas. Verifique el email y la contraseña.' });
                return res.status(401).render('auth/login', {
                    title: 'Iniciar Sesión - SIH',
                    errors: errores,
                    email: email
                });
            }

            const esMatch = await Usuario.verificarPassword(password, usuario.password);

            if (esMatch) {
                // Establecer sesión
                req.session.usuario_id = usuario.id;
                req.session.nombre_usuario = usuario.nombre_completo; // O usuario.email
                // req.session.rol = usuario.rol_nombre; // Si se implementaran roles y se obtuviera de la BD

                // Redirigir a la página principal o a un dashboard
                // Por ahora, se asume que la página principal es el dashboard o punto de entrada.
                return res.redirect('/');
            } else {
                errores.push({ msg: 'Credenciales incorrectas. Verifique el email y la contraseña.' });
                return res.status(401).render('auth/login', {
                    title: 'Iniciar Sesión - SIH',
                    errors: errores,
                    email: email
                });
            }
        } catch (error) {
            console.error('Error en AuthController.loginUsuario:', error);
            // Pasar el error al manejador de errores global
            // Se podría añadir un mensaje más específico para el usuario si se desea,
            // pero un error aquí usualmente es del servidor.
            next(error);
        }
    },

    /**
     * Cierra la sesión del usuario actual.
     * @param {object} req - Objeto de solicitud Express.
     * @param {object} res - Objeto de respuesta Express.
     * @param {function} next - Función para pasar el control al siguiente middleware.
     * @memberof AuthController
     */
    logoutUsuario(req, res, next) {
        req.session.destroy(err => {
            if (err) {
                console.error('Error al cerrar sesión:', err);
                return next(err); // Pasa el error al manejador global
            }
            // Asegurar que la cookie de sesión se limpie en el navegador
            res.clearCookie('connect.sid'); // 'connect.sid' es el nombre por defecto de la cookie de sesión de express-session
            res.redirect('/auth/login');
        });
    }

    // El registro de usuarios se omitirá para el formulario público en esta fase simplificada.
    // Se asume que los usuarios se crean a través de otros medios (ej. seed, panel de admin futuro).
};

module.exports = AuthController;
