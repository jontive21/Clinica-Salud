const Paciente = require('../models/pacienteModel.js'); // Referencia al modelo Paciente
const Admision = require('../models/admisionModel.js'); // Referencia al modelo Admision
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
     * Muestra los detalles de una admisión específica, incluyendo evaluaciones asociadas.
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
            
            const evaluacionEnfermeria = await EvaluacionEnfermeria.obtenerPorIdAdmision(admision.id); // Usa el método renombrado
            const evaluacionesMedicas = await EvaluacionMedica.obtenerPorIdAdmision(admision.id); // Usa el método renombrado

            res.render('admision/detalle', {
                title: `Detalles de Admisión para ${paciente ? paciente.nombre + ' ' + paciente.apellido : 'Paciente Desconocido'} (ID: ${admision.id})`,
                admision: admision,
                paciente: paciente || {}, // Pasa datos del paciente, o un objeto vacío si de alguna manera no se encuentra
                evaluacionEnfermeria: evaluacionEnfermeria, // Pasa la evaluación de enfermería (puede ser null)
                evaluacionesMedicas: evaluacionesMedicas // Pasa las evaluaciones médicas (arreglo, posiblemente vacío)
            });
        } catch (error) {
            console.error('Error al obtener detalles de admisión, evaluación de enfermería o evaluaciones médicas:', error);
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
            // Para un enfoque más amigable, considerar redirigir con un mensaje flash
            // Por ahora, como se indica, pasa el error al manejador global.
            return next(err); 
        }

        try {
            const filasAfectadas = await Admision.actualizarEstado(id, nuevo_estado);
            if (filasAfectadas > 0) {
                res.redirect(`/admisiones/${id}`);
            } else {
                const err = new Error('Admisión no encontrada para actualizar estado.');
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
