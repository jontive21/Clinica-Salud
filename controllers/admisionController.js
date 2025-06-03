const Paciente = require('../models/pacienteModel.js'); // Referencia al modelo Paciente
const Admision = require('../models/admisionModel.js'); // Referencia al modelo Admision
const Cama = require('../models/camaModel.js'); // <- AÑADIDO: Referencia al modelo Cama
const EvaluacionEnfermeria = require('../models/evaluacionEnfermeriaModel.js'); // Referencia al modelo EvaluacionEnfermeria
const EvaluacionMedica = require('../models/evaluacionMedicaModel.js'); // Referencia al modelo EvaluacionMedica

const ESTADOS_ADMISION_VALIDOS = ['Activa', 'Completada', 'Cancelada']; // Estados válidos para una admisión

const AdmisionController = {
    /**
     * Muestra el formulario para crear una nueva admisión para un paciente específico.
     */
    async mostrarFormularioAdmision(req, res, next) {
        const { paciente_id } = req.query; // Espera paciente_id como parámetro de consulta

        if (!paciente_id) {
            const err = new Error('El ID del paciente es requerido para registrar una admisión.');
            err.status = 400;
            return next(err); // O res.status(400).send(...)
        }

        try {
            const paciente = await Paciente.buscarPorId(paciente_id);
            if (!paciente) {
                const err = new Error('Paciente no encontrado para el registro de admisión.');
                err.status = 404;
                return next(err);
            }
            res.render('admision/nueva', {
                title: `Nueva Admisión para ${paciente.nombre} ${paciente.apellido}`, // Título de la página
                paciente: paciente,
                paciente_id: paciente.id // Pasa explícitamente paciente_id para el formulario
            });
        } catch (error) {
            console.error('Error al obtener datos para el formulario de admisión:', error);
            next(error); // Pasa el error al manejador global
        }
    },

    /**
     * Registra una nueva admisión para un paciente.
     */
    async registrarAdmision(req, res, next) {
        const { paciente_id, tipo_admision, medico_referente, diagnostico_inicial } = req.body;
        const datosAdmision = { paciente_id, tipo_admision, medico_referente, diagnostico_inicial }; // Datos de la admisión

        // Validación básica "no vacío"
        const errores = [];
        if (!paciente_id) errores.push({ msg: 'El ID del paciente es obligatorio.' }); // No debería ocurrir si el formulario es correcto
        if (!tipo_admision) errores.push({ msg: 'El campo Tipo de Admisión es obligatorio.' });

        if (errores.length > 0) {
            try {
                // Necesita obtener datos del paciente nuevamente para re-renderizar el formulario correctamente
                const paciente = await Paciente.buscarPorId(paciente_id);
                if (!paciente && paciente_id) { // Si se proveyó paciente_id pero el paciente no fue encontrado
                     errores.push({msg: 'Paciente especificado para la admisión no fue encontrado.'});
                }
                // Si paciente_id faltaba inicialmente, 'paciente' será null, el formulario podría verse extraño pero los errores se mostrarán
                return res.status(400).render('admision/nueva', {
                    title: `Nueva Admisión para ${paciente ? paciente.nombre + ' ' + paciente.apellido : 'Paciente Desconocido'}`,
                    errors: errores, // Pasa los errores a la vista
                    paciente: paciente, // Pasa los datos del paciente obtenidos
                    paciente_id: paciente_id, // Asegura que paciente_id se pase para la acción del formulario/campo oculto
                    datosAdmision: datosAdmision // Devuelve los datos de admisión enviados
                });
            } catch (errorAlObtener) { // Error al obtener datos para re-renderizar
                console.error('Error al obtener datos del paciente durante la falla de validación de admisión:', errorAlObtener);
                return next(errorAlObtener);
            }
        }

        try {
            const idNuevaAdmision = await Admision.crear(datosAdmision);
            // Redirige a la página de detalles de la nueva admisión
            res.redirect(`/admisiones/${idNuevaAdmision}`);
        } catch (error) {
            console.error('Error al registrar la admisión:', error);
            // Si es un error de base de datos (ej., restricción de clave foránea, etc.)
            // Podría ser mejor pasarlo al manejador de errores global o proveer un error genérico
            // Por ahora, re-renderiza el formulario con un error genérico de BD
            try {
                const paciente = await Paciente.buscarPorId(paciente_id);
                res.status(500).render('admision/nueva', {
                    title: `Nueva Admisión para ${paciente ? paciente.nombre + ' ' + paciente.apellido : 'Paciente Desconocido'}`,
                    errors: [{ msg: 'Error al registrar la admisión. Intente nuevamente.' }],
                    paciente: paciente,
                    paciente_id: paciente_id,
                    datosAdmision: datosAdmision
                });
            } catch (errorAlObtener) {
                 console.error('Error al obtener datos del paciente después de un error de creación de admisión:', errorAlObtener);
                 next(errorAlObtener); // Fallback si falla la obtención de datos del paciente para re-renderizar el error
            }
        }
    },

    /**
     * Muestra los detalles de una admisión específica y su paciente asociado.
     * Las evaluaciones (enfermería, médicas) se acceden a través de enlaces en la vista.
     */
    async verAdmision(req, res, next) {
        const { id } = req.params; // ID de la Admisión
        try {
            const admision = await Admision.buscarPorId(id);
            if (!admision) {
                const err = new Error('Admisión no encontrada.');
                err.status = 404;
                return next(err);
            }

            const paciente = await Paciente.buscarPorId(admision.paciente_id);
            // Es poco probable que paciente sea null si existe una admisión debido a las restricciones FK,
            // pero es bueno manejarlo defensivamente.

            // Simplificación: No se cargan las evaluaciones aquí.
            // La vista 'admision/detalle.pug' deberá mostrar enlaces para ver/crear evaluaciones,
            // que serán manejados por sus respectivos controladores.
            // El controlador de evaluaciones ya pasa 'evaluacionEnfermeria' y 'evaluacionesMedicas' a sus vistas.

            res.render('admision/detalle', {
                title: `Detalles de Admisión para ${paciente ? paciente.nombre + ' ' + paciente.apellido : 'Paciente Desconocido'} (ID: ${admision.id})`,
                admision: admision,
                paciente: paciente || {} // Pasa datos del paciente, o un objeto vacío si de alguna manera no se encuentra
                // Ya no se pasan evaluacionEnfermeria ni evaluacionesMedicas desde aquí.
            });
        } catch (error) {
            console.error('Error al obtener detalles de la admisión y del paciente:', error); // Mensaje de error actualizado
            next(error);
        }
    },

    /**
     * Lista todas las admisiones.
     */
    async listarAdmisiones(req, res, next) {
        try {
            const admisiones = await Admision.listarTodas();
            res.render('admision/lista', {
                title: 'Todas las Admisiones',
                admisiones: admisiones
            });
        } catch (error) {
            console.error('Error al obtener todas las admisiones:', error);
            next(error);
        }
    },

    /**
     * Actualiza el estado de una admisión.
     */
    async actualizarEstadoAdmision(req, res, next) {
        const { id } = req.params; // ID de la Admisión
        const { nuevo_estado } = req.body;

        if (!nuevo_estado || !ESTADOS_ADMISION_VALIDOS.includes(nuevo_estado)) {
            const err = new Error('Estado nuevo inválido o faltante.');
            err.status = 400;
            return next(err);
        }

        let admisionActual;
        try {
            admisionActual = await Admision.buscarPorId(id);
            if (!admisionActual) {
                const err = new Error('Admisión no encontrada para actualizar.');
                err.status = 404;
                return next(err);
            }
        } catch (error) {
            console.error('Error al buscar la admisión antes de actualizar estado:', error);
            return next(error);
        }

        let fechaAltaParaActualizar = null;
        if (nuevo_estado === 'Completada' || nuevo_estado === 'Cancelada') {
            fechaAltaParaActualizar = new Date();
        } else if (nuevo_estado === 'Activa') {
            // Si se reactiva, se limpia la fecha de alta
            fechaAltaParaActualizar = null;
        }
        // Para otros estados, no se modifica la fecha_alta existente a menos que la lógica de negocio lo requiera.
        // El modelo Admision.actualizarEstado está diseñado para tomar fechaAlta como null si no se debe cambiar o se debe limpiar.


        try {
            const filasAfectadas = await Admision.actualizarEstado(id, nuevo_estado, fechaAltaParaActualizar);

            if (filasAfectadas > 0) {
                // Lógica de liberación de cama
                if ((nuevo_estado === 'Completada' || nuevo_estado === 'Cancelada') && admisionActual.cama_asignada_id) {
                    try {
                        await Cama.liberarCama(admisionActual.cama_asignada_id);
                        await Admision.removerCamaAsignada(id); // Limpia el campo en la tabla admisiones
                        console.log(`Cama ${admisionActual.cama_asignada_id} liberada y removida de la admisión ${id}.`);
                    } catch (errorLiberacion) {
                        // Importante: La admisión ya fue actualizada. Registrar este error pero no fallar la operación principal.
                        console.error(`Error al liberar la cama ${admisionActual.cama_asignada_id} para la admisión ${id}:`, errorLiberacion);
                        // Considerar agregar un mensaje al usuario o un log de sistema más robusto aquí.
                        // req.flash('warning_msg', 'El estado de la admisión fue actualizado, pero hubo un problema al liberar la cama asociada.');
                    }
                }
                res.redirect(`/admisiones/${id}`);
            } else {
                // Esto no debería ocurrir si admisionActual fue encontrada previamente, pero se mantiene por seguridad.
                const err = new Error('Admisión no encontrada o ningún cambio realizado durante la actualización de estado.');
                err.status = 404;
                return next(err);
            }
        } catch (error) {
            console.error('Error al actualizar el estado de la admisión:', error);
            next(error);
        }
    }
};

module.exports = AdmisionController;
