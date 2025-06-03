// middleware/authMiddleware.js

/**
 * Middleware para asegurar que el usuario esté autenticado.
 * Si el usuario está autenticado (es decir, req.session.usuario_id existe),
 * permite que la solicitud continúe hacia la siguiente función en la pila de middleware/ruta.
 * Si el usuario no está autenticado, lo redirige a la página de inicio de sesión.
 *
 * @param {object} req - Objeto de solicitud Express.
 * @param {object} res - Objeto de respuesta Express.
 * @param {function} next - Función callback para pasar el control al siguiente middleware.
 */
function ensureAuthenticated(req, res, next) {
    if (req.session && req.session.usuario_id) {
        // Usuario autenticado, continuar con la solicitud.
        return next();
    }

    // Usuario no autenticado.
    // Opcional: Guardar la URL original a la que el usuario intentaba acceder.
    // Esto permite redirigir al usuario de vuelta a esa página después de un inicio de sesión exitoso.
    // req.session.returnTo = req.originalUrl;

    // Redirigir a la página de inicio de sesión.
    res.redirect('/auth/login');
}

module.exports = {
    ensureAuthenticated
};
