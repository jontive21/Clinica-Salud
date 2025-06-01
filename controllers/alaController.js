const Ala = require('../models/alaModel.js'); // Referencia al modelo Ala

const AlaController = {
    /**
     * Lista todas las alas del hospital.
     */
    async listarAlas(req, res, next) {
        try {
            const alas = await Ala.listarTodas();
            res.render('ala/lista', {
                title: 'Alas del Hospital', // Título para la vista
                alas: alas
            });
        } catch (error) {
            console.error('Error al obtener las alas del hospital:', error);
            next(error); // Pasa el error al manejador global
        }
    },

    /**
     * Muestra el formulario para crear una nueva ala.
     */
    mostrarFormularioCrear(req, res, next) {
        res.render('ala/nueva', {
            title: 'Crear Nueva Ala', // Título para la vista
            ala: {} // Objeto vacío para consistencia del formulario si se usa 'ala.nombre' en la vista
        });
    },

    /**
     * Crea una nueva ala de hospital.
     */
    async crearAla(req, res, next) {
        const { nombre, descripcion } = req.body;
        const datosAla = { nombre, descripcion }; // Datos del ala provenientes del formulario

        const errores = []; // Arreglo para almacenar errores de validación
        if (!nombre || nombre.trim() === '') {
            errores.push({ msg: 'El campo Nombre es obligatorio.' });
        }

        if (errores.length > 0) {
            return res.status(400).render('ala/nueva', {
                title: 'Crear Nueva Ala',
                errors: errores, // 'errors' es común, pero 'errores' es la traducción
                ala: datosAla // Devuelve los datos enviados para repoblar el formulario
            });
        }

        try {
            await Ala.crear(datosAla);
            res.redirect('/alas'); // Redirige a la lista de alas
        } catch (error) {
            console.error('Error al crear el ala:', error);
            // Maneja errores potenciales de la base de datos (ej., restricción UNIQUE en nombre)
            errores.push({ msg: 'Error al crear el ala. El nombre del ala ya podría existir o ocurrió un error en la base de datos.' });
            res.status(500).render('ala/nueva', {
                title: 'Crear Nueva Ala',
                errors: errores,
                ala: datosAla
            });
        }
    },

    /**
     * Muestra el formulario para editar un ala existente.
     */
    async mostrarFormularioEditar(req, res, next) {
        const { id } = req.params;
        try {
            const ala = await Ala.obtenerPorId(id);
            if (!ala) {
                const err = new Error('Ala de hospital no encontrada para editar.');
                err.status = 404;
                return next(err); // Pasa al manejador de errores 404
            }
            res.render('ala/editar', {
                title: `Editar Ala: ${ala.nombre}`,
                ala: ala
            });
        } catch (error) {
            console.error('Error al obtener el ala para editar:', error);
            next(error);
        }
    },

    /**
     * Actualiza un ala de hospital existente.
     */
    async actualizarAla(req, res, next) {
        const { id } = req.params;
        const { nombre, descripcion } = req.body;
        const datosAlaForm = { id, nombre, descripcion }; // Incluye id para re-renderizar el formulario

        const errores = [];
        if (!nombre || nombre.trim() === '') {
            errores.push({ msg: 'El campo Nombre es obligatorio.' });
        }

        if (errores.length > 0) {
            return res.status(400).render('ala/editar', {
                title: 'Editar Ala', // Título general ya que ala.nombre específico podría ser inválido
                errors: errores,
                ala: datosAlaForm // Devuelve los datos enviados incluyendo el id
            });
        }

        try {
            // Asume que Ala.actualizar existe y retorna filasAfectadas o similar
            const filasAfectadas = await Ala.actualizar(id, { nombre, descripcion });
            if (filasAfectadas > 0) {
                res.redirect('/alas');
            } else {
                // Podría ser que el ala con ID no fue encontrada, o ningún dato cambió.
                const err = new Error('Ala no encontrada o ningún dato modificado durante la actualización.');
                err.status = 404;
                return next(err);
            }
        } catch (error) {
            console.error('Error al actualizar el ala:', error);
            errores.push({ msg: 'Error al actualizar el ala. El nombre del ala ya podría existir para otra ala o ocurrió un error en la base de datos.' });
            res.status(500).render('ala/editar', {
                title: 'Editar Ala',
                errors: errores,
                ala: datosAlaForm
            });
        }
    },

    /**
     * Elimina un ala de hospital.
     */
    async eliminarAla(req, res, next) {
        const { id } = req.params;
        try {
            // Asume que Ala.eliminar existe y retorna filasAfectadas o similar
            const filasAfectadas = await Ala.eliminar(id);
            if (filasAfectadas > 0) {
                res.redirect('/alas');
            } else {
                const err = new Error('Ala no encontrada para eliminar.');
                err.status = 404;
                return next(err);
            }
        } catch (error) {
            console.error('Error al eliminar el ala:', error);
            // Maneja errores potenciales (ej., restricción de clave foránea si el ala tiene habitaciones)
            // Por ahora, pasa al manejador global de errores. Un mensaje más amigable podría ser necesario.
            next(error);
        }
    }
};

module.exports = AlaController;
