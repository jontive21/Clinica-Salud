const Alergia = require('../models/alergiaModel.js');

const AlergiaCatalogoController = {
    /**
     * Lista todas las alergias del catálogo.
     */
    async listarAlergiasCatalogo(req, res, next) {
        try {
            const alergias = await Alergia.listarTodas();
            // Pasar un objeto de errores vacío si no hay errores específicos que mostrar en la lista.
            // Si se quisiera mostrar un error general aquí (ej. de eliminación fallida), se necesitaría otro mecanismo.
            res.render('alergia_catalogo/lista', {
                title: 'Catálogo de Alergias',
                alergias: alergias,
                errors: [] // Inicializar errors por si la vista lo espera
            });
        } catch (error) {
            console.error('Error al listar alergias del catálogo:', error);
            next(error);
        }
    },

    /**
     * Muestra el formulario para crear una nueva alergia en el catálogo.
     */
    async mostrarFormularioCrearAlergia(req, res, next) {
        res.render('alergia_catalogo/nueva', {
            title: 'Crear Nueva Alergia en Catálogo',
            alergia: {},
            errors: [] // Inicializar errors para el formulario
        });
    },

    /**
     * Crea una nueva alergia en el catálogo.
     */
    async crearAlergiaCatalogo(req, res, next) {
        const { nombre_alergia, descripcion_alergia } = req.body;
        const datosAlergia = { nombre_alergia, descripcion_alergia };
        const errores = [];

        if (!nombre_alergia || nombre_alergia.trim() === '') {
            errores.push({ msg: 'El nombre de la alergia es obligatorio.' });
        }

        if (errores.length > 0) {
            return res.status(400).render('alergia_catalogo/nueva', {
                title: 'Crear Nueva Alergia en Catálogo',
                errors: errores,
                alergia: datosAlergia
            });
        }

        try {
            await Alergia.crear(datosAlergia);
            // No hay mensaje flash de éxito, la redirección es suficiente.
            res.redirect('/catalogo-alergias');
        } catch (error) {
            console.error('Error al crear alergia en el catálogo:', error);
            if (error.code === 'ER_DUP_ENTRY') {
                errores.push({ msg: `El nombre de alergia '${nombre_alergia}' ya existe en el catálogo.` });
            } else {
                errores.push({ msg: 'Error al guardar la alergia. Intente nuevamente.' });
            }
            res.status(500).render('alergia_catalogo/nueva', {
                title: 'Crear Nueva Alergia en Catálogo',
                errors: errores,
                alergia: datosAlergia
            });
        }
    },

    /**
     * Muestra el formulario para editar una alergia existente del catálogo.
     */
    async mostrarFormularioEditarAlergia(req, res, next) {
        const { id } = req.params;
        try {
            const alergia = await Alergia.obtenerPorId(id);
            if (!alergia) {
                // Considerar pasar un error a next o renderizar la lista con un error.
                // Por simplicidad, redirigir a la lista. La vista lista podría manejar un query param de error.
                return res.redirect('/catalogo-alergias'); // O next({ status: 404, message: 'Alergia no encontrada' });
            }
            res.render('alergia_catalogo/editar', {
                title: `Editar Alergia: ${alergia.nombre_alergia}`,
                alergia: alergia,
                errors: [] // Inicializar errors para el formulario
            });
        } catch (error) {
            console.error('Error al obtener alergia para editar:', error);
            next(error);
        }
    },

    /**
     * Actualiza una alergia existente en el catálogo.
     */
    async actualizarAlergiaCatalogo(req, res, next) {
        const { id } = req.params;
        const { nombre_alergia, descripcion_alergia } = req.body;
        const datosAlergia = { nombre_alergia, descripcion_alergia };
        const errores = [];

        if (!nombre_alergia || nombre_alergia.trim() === '') {
            errores.push({ msg: 'El nombre de la alergia es obligatorio.' });
        }

        if (errores.length > 0) {
            datosAlergia.id = id;
            return res.status(400).render('alergia_catalogo/editar', {
                title: `Editar Alergia: ${nombre_alergia || 'Inválida'}`,
                errors: errores,
                alergia: datosAlergia
            });
        }

        try {
            const filasAfectadas = await Alergia.actualizar(id, datosAlergia);
            if (filasAfectadas > 0) {
                res.redirect('/catalogo-alergias');
            } else {
                // Si no se afectaron filas, la alergia podría no existir o los datos eran iguales.
                const alergiaExistente = await Alergia.obtenerPorId(id);
                if (!alergiaExistente) {
                     // Si no existe, no se puede editar. Podría redirigir o mostrar error 404.
                    return next({ status: 404, message: 'Alergia no encontrada para actualizar.'});
                }
                // Si existe pero no hubo cambios, simplemente redirigir. O mostrar un mensaje si se desea.
                errores.push({ msg: 'No se modificaron datos o la alergia no fue encontrada.' });
                datosAlergia.id = id; // Para repoblar el formulario correctamente
                res.status(400).render('alergia_catalogo/editar', { // O 200 si no es estrictamente un error del cliente
                    title: `Editar Alergia: ${alergiaExistente.nombre_alergia}`,
                    alergia: datosAlergia, // Pasar los datos que se intentaron guardar
                    errors: errores
                });
            }
        } catch (error) {
            console.error('Error al actualizar alergia en el catálogo:', error);
            if (error.code === 'ER_DUP_ENTRY') {
                errores.push({ msg: `El nombre de alergia '${nombre_alergia}' ya existe para otra entrada.` });
            } else {
                errores.push({ msg: 'Error al actualizar la alergia. Intente nuevamente.' });
            }
            datosAlergia.id = id;
            res.status(500).render('alergia_catalogo/editar', {
                title: `Editar Alergia: ${nombre_alergia || 'Inválida'}`,
                errors: errores,
                alergia: datosAlergia
            });
        }
    },

    /**
     * Elimina una alergia del catálogo.
     */
    async eliminarAlergiaCatalogo(req, res, next) {
        const { id } = req.params;
        try {
            const filasAfectadas = await Alergia.eliminar(id);
            // No hay mensaje flash, la redirección es suficiente.
            // Si filasAfectadas es 0, la alergia no fue encontrada, pero la redirección a la lista es el mismo resultado.
            res.redirect('/catalogo-alergias');
        } catch (error) {
            console.error('Error al eliminar alergia del catálogo:', error);
            // ER_ROW_IS_REFERENCED_2 es el código de error de MySQL para FK constraint violation
            if (error.code === 'ER_ROW_IS_REFERENCED_2') {
                // Este error debería ser manejado por el manejador global de errores.
                // Se puede enriquecer el error con un mensaje más amigable.
                error.friendlyMessage = 'No se puede eliminar la alergia porque está siendo utilizada en una o más evaluaciones de enfermería.';
                return next(error);
            }
            next(error); // Para otros errores
        }
    }
};

module.exports = AlergiaCatalogoController;
