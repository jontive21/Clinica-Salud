const Cama = require('../models/camaModel.js'); // Referencia al modelo Cama
const Habitacion = require('../models/habitacionModel.js'); // Referencia al modelo Habitacion
// const Ala = require('../models/alaModel.js'); // La información del Ala se une en Habitacion.listarTodas()

const ESTADOS_CAMA_VALIDOS = ['Libre', 'Ocupada', 'Mantenimiento', 'Higienizada', 'Reservada']; // Agregar más si es necesario

const CamaController = {
    /**
     * Lista todas las camas del hospital.
     */
    async listarCamas(req, res, next) {
        try {
            const camas = await Cama.listarTodas(); // Este método une con habitaciones y alas
            res.render('cama/lista', {
                title: 'Camas del Hospital', // Título para la vista
                camas: camas
            });
        } catch (error) {
            console.error('Error al obtener las camas del hospital:', error);
            next(error); // Pasa el error al manejador global
        }
    },

    /**
     * Muestra el formulario para crear una nueva cama.
     */
    async mostrarFormularioCrear(req, res, next) {
        try {
            const habitaciones = await Habitacion.listarTodas(); // Incluye ala_nombre para contexto
            res.render('cama/nueva', {
                title: 'Crear Nueva Cama', // Título para la vista
                habitaciones: habitaciones,
                cama: {}, // Objeto vacío para consistencia del formulario
                estadosCama: ESTADOS_CAMA_VALIDOS // Pasa los estados válidos a la vista
            });
        } catch (error) {
            console.error('Error al obtener habitaciones para el formulario de nueva cama:', error);
            next(error);
        }
    },

    /**
     * Crea una nueva cama de hospital.
     */
    async crearCama(req, res, next) {
        const { habitacion_id, codigo_cama, estado_cama } = req.body;
        const datosCama = { habitacion_id, codigo_cama, estado_cama: estado_cama || 'Libre' }; // Datos de la cama

        const errores = []; // Arreglo para almacenar errores de validación
        if (!habitacion_id) errores.push({ msg: 'El campo Habitación es obligatorio.' });
        if (!codigo_cama || codigo_cama.trim() === '') errores.push({ msg: 'El campo Código de Cama es obligatorio.' });
        if (datosCama.estado_cama && !ESTADOS_CAMA_VALIDOS.includes(datosCama.estado_cama)) {
            errores.push({ msg: 'El estado de la cama proporcionado no es válido.' });
        }

        // Si no hay errores de validación básicos, proceder a la validación de capacidad
        if (errores.length === 0 && habitacion_id) {
            try {
                const habitacion = await Habitacion.obtenerPorId(habitacion_id);
                if (!habitacion) {
                    errores.push({ msg: 'La habitación seleccionada no fue encontrada.' });
                } else {
                    const camasExistentes = await Cama.listarPorIdHabitacion(habitacion_id);
                    if (camasExistentes.length >= habitacion.capacidad) {
                        errores.push({ msg: `La habitación ${habitacion.numero_habitacion} (Ala: ${habitacion.ala_nombre || 'N/A'}) ya ha alcanzado su capacidad máxima de ${habitacion.capacidad} cama(s).` });
                    }
                }
            } catch (errorValidacionCapacidad) {
                console.error('Error durante la validación de capacidad de habitación:', errorValidacionCapacidad);
                errores.push({ msg: 'Error al validar la capacidad de la habitación. Intente nuevamente.' });
                // No llamar a next(error) aquí directamente, permitir que se maneje con el bloque de errores.length > 0
            }
        }

        if (errores.length > 0) {
            try {
                const habitaciones = await Habitacion.listarTodas();
                return res.status(400).render('cama/nueva', {
                    title: 'Crear Nueva Cama',
                    errors: errores, 
                    habitaciones: habitaciones,
                    cama: datosCama, 
                    estadosCama: ESTADOS_CAMA_VALIDOS
                });
            } catch (errorAlObtener) { 
                console.error('Error al obtener habitaciones durante la falla de validación de creación de cama:', errorAlObtener);
                // Si falla la obtención de datos para re-renderizar, es un error del servidor.
                // Se podría pasar el error original `errorAlObtener` o un error genérico.
                const err = new Error('Error al procesar la solicitud después de una falla de validación. Por favor, intente de nuevo.');
                err.status = 500;
                return next(err); // Pasa al manejador global
            }
        }

        try {
            await Cama.crear(datosCama);
            res.redirect('/camas'); 
        } catch (error) {
            console.error('Error al crear la cama:', error);
            // Este error es probablemente de la base de datos (ej. DNI duplicado, FK constraint)
            errores.push({ msg: 'Error al crear la cama. El código de cama ya podría existir en la habitación seleccionada o ocurrió un error en la base de datos.' });
            try {
                const habitaciones = await Habitacion.listarTodas();
                res.status(500).render('cama/nueva', {
                    title: 'Crear Nueva Cama',
                    errors: errores,
                    habitaciones: habitaciones,
                    cama: datosCama,
                    estadosCama: ESTADOS_CAMA_VALIDOS
                });
            } catch (errorAlObtener) {
                console.error('Error al obtener habitaciones después de un error de BD en creación de cama:', errorAlObtener);
                next(errorAlObtener);
            }
        }
    },

    /**
     * Muestra el formulario para editar una cama existente.
     */
    async mostrarFormularioEditar(req, res, next) {
        const { id } = req.params;
        try {
            const cama = await Cama.obtenerPorId(id);
            if (!cama) {
                const err = new Error('Cama no encontrada para editar.');
                err.status = 404;
                return next(err); // Pasa al manejador de errores 404
            }
            const habitaciones = await Habitacion.listarTodas();
            res.render('cama/editar', {
                title: `Editar Cama: ${cama.codigo_cama}`, // Título dinámico
                cama: cama,
                habitaciones: habitaciones,
                estadosCama: ESTADOS_CAMA_VALIDOS
            });
        } catch (error) {
            console.error('Error al obtener cama o habitaciones para editar:', error);
            next(error);
        }
    },

    /**
     * Actualiza una cama de hospital existente.
     */
    async actualizarCama(req, res, next) {
        const { id } = req.params;
        const { habitacion_id, codigo_cama, estado_cama } = req.body;
        const datosCamaForm = { id, habitacion_id, codigo_cama, estado_cama }; // Datos del formulario para repoblar si hay error

        const errores = [];
        if (!habitacion_id) errores.push({ msg: 'El campo Habitación es obligatorio.' });
        if (!codigo_cama || codigo_cama.trim() === '') errores.push({ msg: 'El campo Código de Cama es obligatorio.' });
        if (estado_cama && !ESTADOS_CAMA_VALIDOS.includes(estado_cama)) {
            errores.push({ msg: 'El estado de la cama proporcionado no es válido.' });
        }
        
        if (errores.length > 0) {
            try {
                const habitaciones = await Habitacion.listarTodas();
                return res.status(400).render('cama/editar', {
                    title: 'Editar Cama', // Título general
                    errors: errores,
                    habitaciones: habitaciones,
                    cama: datosCamaForm, // Devuelve los datos enviados
                    estadosCama: ESTADOS_CAMA_VALIDOS
                });
            } catch (errorAlObtener) {
                console.error('Error al obtener habitaciones durante la falla de validación de actualización de cama:', errorAlObtener);
                return next(errorAlObtener);
            }
        }
        
        const datosCamaActualizar = { habitacion_id, codigo_cama, estado_cama }; // Datos para el modelo
        try {
            // Asume que Cama.actualizar existe para actualizaciones generales
            const filasAfectadas = await Cama.actualizar(id, datosCamaActualizar); 
            if (filasAfectadas > 0) {
                res.redirect('/camas');
            } else {
                const err = new Error('Cama no encontrada o ningún dato modificado durante la actualización.');
                err.status = 404;
                return next(err);
            }
        } catch (error) {
            console.error('Error al actualizar la cama:', error);
            errores.push({ msg: 'Error al actualizar la cama. El código de cama ya podría existir en la habitación seleccionada o ocurrió un error en la base de datos.' });
            try {
                const habitaciones = await Habitacion.listarTodas();
                res.status(500).render('cama/editar', {
                    title: 'Editar Cama',
                    errors: errores,
                    habitaciones: habitaciones,
                    cama: datosCamaForm,
                    estadosCama: ESTADOS_CAMA_VALIDOS
                });
            } catch (errorAlObtener) {
                console.error('Error al obtener habitaciones después de un error de BD en actualización de cama:', errorAlObtener);
                next(errorAlObtener);
            }
        }
    },

    /**
     * Elimina una cama de hospital.
     */
    async eliminarCama(req, res, next) {
        const { id } = req.params;
        try {
            // Asume que Cama.eliminar existe
            const filasAfectadas = await Cama.eliminar(id); 
            if (filasAfectadas > 0) {
                res.redirect('/camas');
            } else {
                const err = new Error('Cama no encontrada para eliminar.');
                err.status = 404;
                return next(err);
            }
        } catch (error) {
            console.error('Error al eliminar la cama:', error);
            // Maneja errores de FK (ej., si la cama está ocupada o tiene historial)
            next(error); 
        }
    }
};

module.exports = CamaController;
