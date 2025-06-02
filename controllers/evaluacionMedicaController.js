const EvaluacionMedica = require('../models/evaluacionMedicaModel.js'); // Referencia al modelo EvaluacionMedica
const Admision = require('../models/admisionModel.js'); // Referencia al modelo Admision
const Paciente = require('../models/pacienteModel.js'); // Referencia al modelo Paciente
const EvaluacionEnfermeria = require('../models/evaluacionEnfermeriaModel.js'); // Opcional, para contexto

const EvaluacionMedicaController = {
    /**
     * Muestra el formulario para crear una nueva evaluación médica para una admisión específica.
     */
    async mostrarFormularioEvaluacionMedica(req, res, next) {
        const { admision_id } = req.params; // ID de la admisión desde parámetros de ruta

        try {
            const admision = await Admision.buscarPorId(admision_id);
            if (!admision) {
                const err = new Error('Admisión no encontrada.');
                err.status = 404;
                return next(err);
            }
            if (admision.estado_admision !== 'Activa') {
                const err = new Error(`La admisión (ID: ${admision_id}) no está activa. Estado actual: ${admision.estado_admision}. No se puede crear una nueva evaluación médica.`);
                err.status = 400;
                return next(err);
            }

            const paciente = await Paciente.buscarPorId(admision.paciente_id);
            if (!paciente) {
                const err = new Error(`Paciente (ID: ${admision.paciente_id}) asociado con la admisión no encontrado.`);
                err.status = 404;
                return next(err);
            }

            const evaluacionEnfermeria = await EvaluacionEnfermeria.obtenerPorIdAdmision(admision_id); // Usa el método renombrado
            
            // Nota: La lógica para manejar múltiples evaluaciones médicas (ej., inicial vs. seguimiento)
            // podría requerir obtener evaluaciones médicas existentes aquí y ajustar la vista o el formulario.
            // Por ahora, esto asume crear una nueva cada vez que se accede a este formulario.

            res.render('evaluacion_medica/nueva', {
                title: `Nueva Evaluación Médica para Admisión ${admision.id}`, // Título de la página
                admision: admision,
                paciente: paciente,
                evaluacionEnfermeria: evaluacionEnfermeria || null, // Pasa la evaluación de enfermería (puede ser null)
                evaluacionMedica: {} // Objeto vacío para consistencia del formulario
            });

        } catch (error) {
            console.error('Error al obtener datos para el formulario de evaluación médica:', error);
            next(error); // Pasa el error al manejador global
        }
    },

    /**
     * Registra una nueva evaluación médica para una admisión.
     */
    async registrarEvaluacionMedica(req, res, next) {
        const { admision_id } = req.params; // ID de la admisión desde parámetros de ruta
        const { // Extracción de todos los campos del cuerpo de la solicitud
            medico_id, 
            evaluacion_enfermeria_id, // Opcional, podría estar vinculado
            diagnostico_principal,
            diagnosticos_secundarios,
            tratamiento_farmacologico,
            tratamiento_no_farmacologico,
            procedimientos_medicos,
            interconsultas_solicitadas,
            plan_tratamiento_inicial, 
            observaciones_evolucion,
            recomendaciones_alta_seguimiento,
            solicitud_pruebas_diagnosticas, // Campo añadido en el formulario
            notas_medicas_adicionales // Campo añadido en el formulario
        } = req.body;

        const datosEvaluacionMedica = { // Objeto con los datos de la evaluación médica
            admision_id,
            evaluacion_enfermeria_id: evaluacion_enfermeria_id || null, // Maneja campo opcional
            medico_id, // Asumiendo que esto viene como un texto por ahora
            fecha_evaluacion: new Date(), // Establece la fecha y hora actual
            diagnostico_principal,
            diagnosticos_secundarios,
            tratamiento_farmacologico,
            tratamiento_no_farmacologico,
            procedimientos_medicos,
            interconsultas_solicitadas,
            plan_tratamiento_inicial,
            observaciones_evolucion,
            recomendaciones_alta_seguimiento,
            solicitud_pruebas_diagnosticas,
            notas_medicas_adicionales
        };
        
        const errores = []; // Arreglo para almacenar errores de validación
        if (!medico_id || medico_id.trim() === '') {
            errores.push({ msg: 'El campo Médico ID es obligatorio.' });
        }
        if (!diagnostico_principal || diagnostico_principal.trim() === '') {
            errores.push({ msg: 'El campo Diagnóstico Principal es obligatorio.' });
        }
        if (!plan_tratamiento_inicial || plan_tratamiento_inicial.trim() === '') {
            errores.push({ msg: 'El campo Plan de Tratamiento Inicial es obligatorio.' });
        }

        if (errores.length > 0) {
            try {
                const admision = await Admision.buscarPorId(admision_id);
                const paciente = admision ? await Paciente.buscarPorId(admision.paciente_id) : null;
                const evaluacionEnfermeria = admision ? await EvaluacionEnfermeria.obtenerPorIdAdmision(admision_id) : null;
                
                return res.status(400).render('evaluacion_medica/nueva', {
                    title: `Nueva Evaluación Médica para Admisión ${admision_id}`,
                    errors: errores, // Pasa los errores a la vista
                    admision: admision,
                    paciente: paciente,
                    evaluacionEnfermeria: evaluacionEnfermeria || null,
                    evaluacionMedica: datosEvaluacionMedica // Devuelve los datos enviados para repoblar el formulario
                });
            } catch (errorAlObtener) { // Error al obtener datos para re-renderizar
                console.error('Error al obtener datos para re-renderizar el formulario de evaluación médica:', errorAlObtener);
                return next(errorAlObtener);
            }
        }

        try {
            const idNuevaEvaluacionMedica = await EvaluacionMedica.crear(datosEvaluacionMedica);
            // Por ahora, redirige a los detalles de la admisión. Podría redirigir al detalle de la nueva evaluación médica.
            res.redirect(`/admisiones/${admision_id}`); 
            // O: res.redirect(`/evaluaciones-medicas/${idNuevaEvaluacionMedica}`);
        } catch (error) {
            console.error('Error al registrar la evaluación médica:', error);
            errores.push({ msg: 'Error al registrar la evaluación médica. Verifique los datos e intente nuevamente.' });
            // Ejemplo para restricción UNIQUE: if (error.code === 'ER_DUP_ENTRY') { ... }
            try {
                const admision = await Admision.buscarPorId(admision_id);
                const paciente = admision ? await Paciente.buscarPorId(admision.paciente_id) : null;
                const evaluacionEnfermeria = admision ? await EvaluacionEnfermeria.obtenerPorIdAdmision(admision_id) : null;

                res.status(500).render('evaluacion_medica/nueva', {
                    title: `Nueva Evaluación Médica para Admisión ${admision_id}`,
                    errors: errores,
                    admision: admision,
                    paciente: paciente,
                    evaluacionEnfermeria: evaluacionEnfermeria || null,
                    evaluacionMedica: datosEvaluacionMedica
                });
            } catch (errorAlObtener) {
                console.error('Error al obtener datos para re-renderizar el formulario de evaluación médica después de un error de BD:', errorAlObtener);
                next(errorAlObtener);
            }
        }
    },

    /**
     * Muestra una evaluación médica existente.
     */
    async mostrarEvaluacionMedica(req, res, next) {
        const { id } = req.params; // ID de la Evaluación Médica
        try {
            const evaluacionMedica = await EvaluacionMedica.obtenerPorId(id);
            if (!evaluacionMedica) {
                const err = new Error('Evaluación médica no encontrada.');
                err.status = 404;
                return next(err);
            }

            const admision = await Admision.buscarPorId(evaluacionMedica.admision_id);
            if (!admision) {
                const err = new Error('Admisión asociada no encontrada.'); // Problema de integridad de datos
                err.status = 404; 
                return next(err);
            }

            const paciente = await Paciente.buscarPorId(admision.paciente_id);
            if (!paciente) {
                const err = new Error('Paciente asociado no encontrado.'); // Problema de integridad de datos
                err.status = 404;
                return next(err);
            }
            
            const evaluacionEnfermeria = evaluacionMedica.evaluacion_enfermeria_id 
                ? await EvaluacionEnfermeria.obtenerPorId(evaluacionMedica.evaluacion_enfermeria_id) 
                : null;
            
            res.render('evaluacion_medica/detalle', {
                title: `Evaluación Médica para Admisión ${admision.id}`, // Título de la página
                evaluacionMedica: evaluacionMedica,
                admision: admision,
                paciente: paciente,
                evaluacionEnfermeria: evaluacionEnfermeria || null // Pasa la evaluación de enfermería vinculada (puede ser null)
            });
        } catch (error) {
            console.error('Error al obtener detalles de la evaluación médica:', error);
            next(error);
        }
    },

    /**
     * Muestra el formulario para editar una evaluación médica existente.
     */
    async mostrarFormularioEditarEvaluacionMedica(req, res, next) {
        const { id } = req.params; // ID de la Evaluación Médica
        try {
            const evaluacionMedica = await EvaluacionMedica.obtenerPorId(id);
            if (!evaluacionMedica) {
                const err = new Error('Evaluación médica no encontrada para editar.');
                err.status = 404;
                return next(err);
            }

            const admision = await Admision.buscarPorId(evaluacionMedica.admision_id);
            if (!admision) {
                const err = new Error('Admisión asociada no encontrada.');
                err.status = 404;
                return next(err);
            }

            const paciente = await Paciente.buscarPorId(admision.paciente_id);
            if (!paciente) {
                const err = new Error('Paciente asociado no encontrado.');
                err.status = 404;
                return next(err);
            }
            
            let evaluacionEnfermeria = null;
            if (evaluacionMedica.evaluacion_enfermeria_id) {
                evaluacionEnfermeria = await EvaluacionEnfermeria.obtenerPorId(evaluacionMedica.evaluacion_enfermeria_id);
            }
            
            res.render('evaluacion_medica/editar', {
                title: `Editar Evaluación Médica para Admisión ${admision.id}`, // Título de la página
                evaluacionMedica: evaluacionMedica,
                admision: admision,
                paciente: paciente,
                evaluacionEnfermeria: evaluacionEnfermeria // puede ser null
            });
        } catch (error) {
            console.error('Error al obtener datos para editar la evaluación médica:', error);
            next(error);
        }
    },

    /**
     * Actualiza una evaluación médica existente.
     */
    async actualizarEvaluacionMedica(req, res, next) {
        const { id } = req.params; // ID de la Evaluación Médica
        const { // Extracción de todos los campos del cuerpo de la solicitud
            medico_id,
            evaluacion_enfermeria_id, // Generalmente fijo, pero puede incluirse si el formulario permite cambio
            diagnostico_principal,
            diagnosticos_secundarios,
            tratamiento_farmacologico,
            tratamiento_no_farmacologico,
            procedimientos_medicos,
            interconsultas_solicitadas,
            plan_tratamiento_inicial,
            observaciones_evolucion,
            recomendaciones_alta_seguimiento,
            solicitud_pruebas_diagnosticas, 
            notas_medicas_adicionales 
            // Nota: fecha_evaluacion típicamente no se actualiza manualmente vía formulario.
            // admision_id tampoco es actualizable para una evaluación existente.
        } = req.body;

        const datosEvaluacionMedicaForm = { // Datos del formulario para repoblar si hay error
            medico_id, evaluacion_enfermeria_id: evaluacion_enfermeria_id || null,
            diagnostico_principal, diagnosticos_secundarios, tratamiento_farmacologico,
            tratamiento_no_farmacologico, procedimientos_medicos, interconsultas_solicitadas,
            plan_tratamiento_inicial, observaciones_evolucion, recomendaciones_alta_seguimiento,
            solicitud_pruebas_diagnosticas, notas_medicas_adicionales
        };

        const errores = [];
        if (!medico_id || medico_id.trim() === '') {
            errores.push({ msg: 'El campo Médico ID es obligatorio.' });
        }
        if (!diagnostico_principal || diagnostico_principal.trim() === '') {
            errores.push({ msg: 'El campo Diagnóstico Principal es obligatorio.' });
        }
        if (!plan_tratamiento_inicial || plan_tratamiento_inicial.trim() === '') {
            errores.push({ msg: 'El campo Plan de Tratamiento Inicial es obligatorio.' });
        }
        // Agregar más validaciones específicas según sea necesario

        if (errores.length > 0) {
            try {
                const evaluacionOriginal = await EvaluacionMedica.obtenerPorId(id);
                if (!evaluacionOriginal) { // No debería ocurrir si el formulario se accedió correctamente
                    const err = new Error('Evaluación médica original no encontrada para re-renderizar.');
                    err.status = 404;
                    return next(err);
                }
                const admision = await Admision.buscarPorId(evaluacionOriginal.admision_id);
                const paciente = admision ? await Paciente.buscarPorId(admision.paciente_id) : null;
                const evaluacionEnfermeriaDb = evaluacionOriginal.evaluacion_enfermeria_id 
                    ? await EvaluacionEnfermeria.obtenerPorId(evaluacionOriginal.evaluacion_enfermeria_id) 
                    : null;
                
                return res.status(400).render('evaluacion_medica/editar', {
                    title: `Editar Evaluación Médica para Admisión ${admision ? admision.id : 'N/A'}`,
                    errors: errores,
                    admision: admision,
                    paciente: paciente,
                    evaluacionEnfermeria: evaluacionEnfermeriaDb,
                    evaluacionMedica: { ...evaluacionOriginal, ...datosEvaluacionMedicaForm } // Fusiona para repoblar
                });
            } catch (errorAlObtener) {
                console.error('Error al obtener datos para re-renderizar el formulario de edición de evaluación médica:', errorAlObtener);
                return next(errorAlObtener);
            }
        }

        try {
            // Pasa solo los campos que se pueden actualizar al modelo.
            // El método actualizar del modelo ya excluye admision_id, evaluacion_enfermeria_id, fecha_evaluacion
            const filasAfectadas = await EvaluacionMedica.actualizar(id, datosEvaluacionMedicaForm);
            if (filasAfectadas > 0) {
                res.redirect(`/evaluaciones-medicas/${id}`);
            } else {
                const err = new Error('Evaluación médica no encontrada o ningún dato modificado durante la actualización.');
                err.status = 404;
                return next(err);
            }
        } catch (error) {
            console.error('Error al actualizar la evaluación médica:', error);
            errores.push({ msg: 'Error al actualizar la evaluación médica. Verifique los datos e intente nuevamente.' });
            try {
                const evaluacionOriginal = await EvaluacionMedica.obtenerPorId(id);
                const admision = evaluacionOriginal ? await Admision.buscarPorId(evaluacionOriginal.admision_id) : null;
                const paciente = admision ? await Paciente.buscarPorId(admision.paciente_id) : null;
                const evaluacionEnfermeriaDb = evaluacionOriginal.evaluacion_enfermeria_id 
                    ? await EvaluacionEnfermeria.obtenerPorId(evaluacionOriginal.evaluacion_enfermeria_id) 
                    : null;
                
                res.status(500).render('evaluacion_medica/editar', {
                    title: `Editar Evaluación Médica para Admisión ${admision ? admision.id : 'N/A'}`,
                    errors: errores,
                    admision: admision,
                    paciente: paciente,
                    evaluacionEnfermeria: evaluacionEnfermeriaDb,
                    evaluacionMedica: { ...evaluacionOriginal, ...datosEvaluacionMedicaForm }
                });
            } catch (errorAlObtener) {
                console.error('Error al obtener datos para re-renderizar el formulario de edición de evaluación médica después de un error de BD:', errorAlObtener);
                next(errorAlObtener);
            }
        }
    }
};

module.exports = EvaluacionMedicaController;
