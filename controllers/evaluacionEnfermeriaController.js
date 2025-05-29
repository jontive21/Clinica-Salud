const EvaluacionEnfermeria = require('../models/evaluacionEnfermeriaModel.js'); // Referencia al modelo EvaluacionEnfermeria
const Admision = require('../models/admisionModel.js'); // Referencia al modelo Admision
const Paciente = require('../models/pacienteModel.js'); // Referencia al modelo Paciente

const EvaluacionEnfermeriaController = {
    /**
     * Muestra el formulario para crear una nueva evaluación de enfermería para una admisión específica.
     */
    async mostrarFormularioEvaluacion(req, res, next) {
        const { admision_id } = req.params; // ID de la admisión desde parámetros de ruta

        try {
            const admision = await Admision.buscarPorId(admision_id);
            if (!admision) {
                const err = new Error('Admisión no encontrada.');
                err.status = 404;
                return next(err);
            }
            if (admision.estado_admision !== 'Activa') {
                const err = new Error(`La admisión (ID: ${admision_id}) no está activa. Estado actual: ${admision.estado_admision}. No se puede crear una nueva evaluación.`);
                err.status = 400;
                return next(err);
            }

            const paciente = await Paciente.buscarPorId(admision.paciente_id);
            if (!paciente) {
                const err = new Error(`Paciente (ID: ${admision.paciente_id}) asociado con la admisión no encontrado.`);
                err.status = 404;
                return next(err);
            }

            const evaluacionExistente = await EvaluacionEnfermeria.obtenerPorIdAdmision(admision_id); // Usa el método renombrado del modelo
            if (evaluacionExistente) {
                // Redirige a la página de detalles de la evaluación existente.
                console.log(`Ya existe una evaluación para la admisión ${admision_id}, redirigiendo.`);
                // req.flash('info_msg', 'Ya existe una evaluación para esta admisión.'); // Si se implementan mensajes flash
                return res.redirect(`/evaluaciones-enfermeria/${evaluacionExistente.id}`);
            }

            res.render('evaluacion_enfermeria/nueva', {
                title: `Evaluación Inicial de Enfermería para Admisión ${admision.id}`, // Título de la página
                admision: admision,
                paciente: paciente,
                evaluacion: {} // Objeto vacío para consistencia del formulario
            });

        } catch (error) {
            console.error('Error al obtener datos para el formulario de evaluación de enfermería:', error);
            next(error); // Pasa el error al manejador global
        }
    },

    /**
     * Registra una nueva evaluación de enfermería para una admisión.
     */
    async registrarEvaluacion(req, res, next) {
        const { admision_id } = req.params; // ID de la admisión desde parámetros de ruta
        const { // Extracción de todos los campos del cuerpo de la solicitud
            enfermero_id, 
            motivo_internacion_actual,
            antecedentes_personales,
            antecedentes_familiares,
            historial_medico_previo,
            alergias,
            medicacion_actual,
            evaluacion_fisica, 
            signos_vitales_ta,
            signos_vitales_fc,
            signos_vitales_fr,
            signos_vitales_temp,
            signos_vitales_sato2,
            nivel_conciencia,
            estado_piel_mucosas,
            movilidad,
            necesidades_basicas_alimentacion,
            necesidades_basicas_higiene,
            necesidades_basicas_eliminacion,
            necesidades_basicas_descanso_sueno,
            valoracion_dolor_escala,
            valoracion_dolor_localizacion,
            valoracion_dolor_caracteristicas,
            observaciones_adicionales,
            plan_cuidados_inicial
        } = req.body;

        const datosEvaluacion = { // Objeto con los datos de la evaluación
            admision_id,
            enfermero_id, // Asumiendo que esto viene como un texto por ahora
            fecha_evaluacion: new Date(), // Establece la fecha y hora actual
            motivo_internacion_actual,
            antecedentes_personales,
            antecedentes_familiares,
            historial_medico_previo,
            alergias,
            medicacion_actual,
            evaluacion_fisica, // Observaciones generales
            signos_vitales_ta,
            signos_vitales_fc,
            signos_vitales_fr,
            signos_vitales_temp,
            signos_vitales_sato2,
            nivel_conciencia,
            estado_piel_mucosas,
            movilidad,
            necesidades_basicas_alimentacion,
            necesidades_basicas_higiene,
            necesidades_basicas_eliminacion,
            necesidades_basicas_descanso_sueno,
            valoracion_dolor_escala,
            valoracion_dolor_localizacion,
            valoracion_dolor_caracteristicas,
            observaciones_adicionales,
            plan_cuidados_inicial
        };
        
        const errores = []; // Arreglo para almacenar errores de validación
        if (!motivo_internacion_actual || motivo_internacion_actual.trim() === '') {
            errores.push({ msg: 'El campo Motivo de Internación Actual es obligatorio.' });
        }
        if (!enfermero_id || enfermero_id.trim() === '') { // Verificación básica por ahora
            errores.push({ msg: 'El campo Enfermero ID es obligatorio.' });
        }
        // Agregar más validaciones específicas según sea necesario, ej., para que los signos vitales sean números

        if (errores.length > 0) {
            try {
                const admision = await Admision.buscarPorId(admision_id);
                const paciente = admision ? await Paciente.buscarPorId(admision.paciente_id) : null;
                return res.status(400).render('evaluacion_enfermeria/nueva', {
                    title: `Evaluación Inicial de Enfermería para Admisión ${admision_id}`,
                    errors: errores, // Pasa los errores a la vista
                    admision: admision,
                    paciente: paciente,
                    evaluacion: datosEvaluacion // Devuelve los datos enviados para repoblar el formulario
                });
            } catch (errorAlObtener) { // Error al obtener datos para re-renderizar
                console.error('Error al obtener datos para re-renderizar el formulario de evaluación:', errorAlObtener);
                return next(errorAlObtener);
            }
        }

        try {
            const idNuevaEvaluacion = await EvaluacionEnfermeria.crear(datosEvaluacion);
            res.redirect(`/evaluaciones-enfermeria/${idNuevaEvaluacion}`); // Redirige al detalle de la nueva evaluación
        } catch (error) {
            console.error('Error al registrar la evaluación de enfermería:', error);
             errores.push({ msg: 'Error al registrar la evaluación de enfermería. Verifique los datos e intente nuevamente.' });
            if (error.code === 'ER_DUP_ENTRY' || error.message.includes('UNIQUE constraint failed')) { // Ejemplo: Captura violación de restricción UNIQUE si admision_id debe ser único
                errores.push({msg: 'Ya existe una evaluación para esta admisión.'});
            }
            try {
                const admision = await Admision.buscarPorId(admision_id);
                const paciente = admision ? await Paciente.buscarPorId(admision.paciente_id) : null;
                res.status(500).render('evaluacion_enfermeria/nueva', {
                    title: `Evaluación Inicial de Enfermería para Admisión ${admision_id}`,
                    errors: errores,
                    admision: admision,
                    paciente: paciente,
                    evaluacion: datosEvaluacion
                });
            } catch (errorAlObtener) {
                console.error('Error al obtener datos para re-renderizar el formulario de evaluación después de un error de BD:', errorAlObtener);
                next(errorAlObtener);
            }
        }
    },

    /**
     * Muestra una evaluación de enfermería existente.
     */
    async mostrarEvaluacion(req, res, next) {
        const { id } = req.params; // ID de la Evaluación
        try {
            const evaluacion = await EvaluacionEnfermeria.obtenerPorId(id);
            if (!evaluacion) {
                const err = new Error('Evaluación de enfermería no encontrada.');
                err.status = 404;
                return next(err);
            }

            const admision = await Admision.buscarPorId(evaluacion.admision_id);
            if (!admision) {
                // Problema de integridad de datos si esto ocurre
                const err = new Error('Admisión asociada no encontrada.');
                err.status = 404; 
                return next(err);
            }

            const paciente = await Paciente.buscarPorId(admision.paciente_id);
            if (!paciente) {
                 // Problema de integridad de datos
                const err = new Error('Paciente asociado no encontrado.');
                err.status = 404;
                return next(err);
            }
            
            res.render('evaluacion_enfermeria/detalle', {
                title: `Evaluación de Enfermería para Admisión ${admision.id}`, // Título de la página
                evaluacion: evaluacion,
                admision: admision,
                paciente: paciente
            });
        } catch (error) {
            console.error('Error al obtener detalles de la evaluación de enfermería:', error);
            next(error);
        }
    },

    /**
     * Muestra el formulario para editar una evaluación de enfermería existente.
     */
    async mostrarFormularioEditarEvaluacion(req, res, next) {
        const { id } = req.params; // ID de la Evaluación
        try {
            const evaluacion = await EvaluacionEnfermeria.obtenerPorId(id);
            if (!evaluacion) {
                const err = new Error('Evaluación de enfermería no encontrada para editar.');
                err.status = 404;
                return next(err);
            }

            const admision = await Admision.buscarPorId(evaluacion.admision_id);
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
            
            res.render('evaluacion_enfermeria/editar', {
                title: `Editar Evaluación de Enfermería para Admisión ${admision.id}`, // Título de la página
                evaluacion: evaluacion,
                admision: admision,
                paciente: paciente
            });
        } catch (error) {
            console.error('Error al obtener datos para editar la evaluación de enfermería:', error);
            next(error);
        }
    },

    /**
     * Actualiza una evaluación de enfermería existente.
     */
    async actualizarEvaluacion(req, res, next) {
        const { id } = req.params; // ID de la Evaluación
        const { // Extracción de todos los campos del cuerpo de la solicitud
            enfermero_id,
            motivo_internacion_actual,
            antecedentes_personales,
            antecedentes_familiares,
            historial_medico_previo,
            alergias,
            medicacion_actual,
            evaluacion_fisica,
            signos_vitales_ta,
            signos_vitales_fc,
            signos_vitales_fr,
            signos_vitales_temp,
            signos_vitales_sato2,
            nivel_conciencia,
            estado_piel_mucosas,
            movilidad,
            necesidades_basicas_alimentacion,
            necesidades_basicas_higiene,
            necesidades_basicas_eliminacion,
            necesidades_basicas_descanso_sueno,
            valoracion_dolor_escala,
            valoracion_dolor_localizacion,
            valoracion_dolor_caracteristicas,
            observaciones_adicionales,
            plan_cuidados_inicial
            // Nota: fecha_evaluacion típicamente no se actualiza manualmente vía formulario.
            // admision_id tampoco es actualizable para una evaluación existente.
        } = req.body;

        const datosEvaluacionForm = { // Datos del formulario para repoblar si hay error
            enfermero_id, motivo_internacion_actual, antecedentes_personales, antecedentes_familiares,
            historial_medico_previo, alergias, medicacion_actual, evaluacion_fisica,
            signos_vitales_ta, signos_vitales_fc, signos_vitales_fr, signos_vitales_temp, signos_vitales_sato2,
            nivel_conciencia, estado_piel_mucosas, movilidad, necesidades_basicas_alimentacion,
            necesidades_basicas_higiene, necesidades_basicas_eliminacion, necesidades_basicas_descanso_sueno,
            valoracion_dolor_escala, valoracion_dolor_localizacion, valoracion_dolor_caracteristicas,
            observaciones_adicionales, plan_cuidados_inicial
        };

        const errores = [];
        if (!motivo_internacion_actual || motivo_internacion_actual.trim() === '') {
            errores.push({ msg: 'El campo Motivo de Internación Actual es obligatorio.' });
        }
        if (!enfermero_id || enfermero_id.trim() === '') {
            errores.push({ msg: 'El campo Enfermero ID es obligatorio.' });
        }
        // Agregar más validaciones específicas según sea necesario

        if (errores.length > 0) {
            try {
                const evaluacionOriginal = await EvaluacionEnfermeria.obtenerPorId(id);
                const admision = evaluacionOriginal ? await Admision.buscarPorId(evaluacionOriginal.admision_id) : null;
                const paciente = admision ? await Paciente.buscarPorId(admision.paciente_id) : null;
                
                return res.status(400).render('evaluacion_enfermeria/editar', {
                    title: `Editar Evaluación de Enfermería para Admisión ${admision ? admision.id : 'N/A'}`,
                    errors: errores,
                    admision: admision,
                    paciente: paciente,
                    evaluacion: { ...evaluacionOriginal, ...datosEvaluacionForm } // Fusiona para repoblar
                });
            } catch (errorAlObtener) {
                console.error('Error al obtener datos para re-renderizar el formulario de edición de evaluación:', errorAlObtener);
                return next(errorAlObtener);
            }
        }

        try {
            const filasAfectadas = await EvaluacionEnfermeria.actualizar(id, datosEvaluacionForm);
            if (filasAfectadas > 0) {
                res.redirect(`/evaluaciones-enfermeria/${id}`);
            } else {
                const err = new Error('Evaluación de enfermería no encontrada o ningún dato modificado durante la actualización.');
                err.status = 404;
                return next(err);
            }
        } catch (error) {
            console.error('Error al actualizar la evaluación de enfermería:', error);
            errores.push({ msg: 'Error al actualizar la evaluación de enfermería. Verifique los datos e intente nuevamente.' });
            try {
                const evaluacionOriginal = await EvaluacionEnfermeria.obtenerPorId(id);
                const admision = evaluacionOriginal ? await Admision.buscarPorId(evaluacionOriginal.admision_id) : null;
                const paciente = admision ? await Paciente.buscarPorId(admision.paciente_id) : null;
                
                res.status(500).render('evaluacion_enfermeria/editar', {
                    title: `Editar Evaluación de Enfermería para Admisión ${admision ? admision.id : 'N/A'}`,
                    errors: errores,
                    admision: admision,
                    paciente: paciente,
                    evaluacion: { ...evaluacionOriginal, ...datosEvaluacionForm }
                });
            } catch (errorAlObtener) {
                console.error('Error al obtener datos para re-renderizar el formulario de edición de evaluación después de un error de BD:', errorAlObtener);
                next(errorAlObtener);
            }
        }
    }
};

module.exports = EvaluacionEnfermeriaController;
