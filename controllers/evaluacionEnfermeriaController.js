const EvaluacionEnfermeria = require('../models/evaluacionEnfermeriaModel.js');
const Admision = require('../models/admisionModel.js');
const Paciente = require('../models/pacienteModel.js');
const Alergia = require('../models/alergiaModel.js'); // Nuevo
const EvaluacionAlergia = require('../models/evaluacionAlergiaModel.js'); // Nuevo

const EvaluacionEnfermeriaController = {
    /**
     * Muestra el formulario para crear una nueva evaluación de enfermería.
     */
    async mostrarFormularioEvaluacion(req, res, next) {
        const { admision_id } = req.params;
        try {
            const admision = await Admision.buscarPorId(admision_id);
            if (!admision) {
                return next({ status: 404, message: 'Admisión no encontrada.' });
            }
            if (admision.estado_admision !== 'Activa') {
                return next({ status: 400, message: `La admisión (ID: ${admision_id}) no está activa. No se puede crear evaluación.` });
            }
            const paciente = await Paciente.buscarPorId(admision.paciente_id);
            if (!paciente) {
                return next({ status: 404, message: `Paciente (ID: ${admision.paciente_id}) no encontrado.` });
            }
            const evaluacionExistente = await EvaluacionEnfermeria.obtenerPorIdAdmision(admision_id);
            if (evaluacionExistente) {
                return res.redirect(`/evaluaciones-enfermeria/${evaluacionExistente.id}`);
            }

            const catalogoAlergias = await Alergia.listarTodas(); // Obtener catálogo de alergias

            res.render('evaluacion_enfermeria/nueva', {
                title: `Evaluación Inicial de Enfermería para Admisión ${admision.id}`,
                admision,
                paciente,
                catalogoAlergias, // Pasar catálogo a la vista
                evaluacion: {}
            });
        } catch (error) {
            console.error('Error en mostrarFormularioEvaluacion:', error);
            next(error);
        }
    },

    /**
     * Registra una nueva evaluación de enfermería.
     */
    async registrarEvaluacion(req, res, next) {
        const { admision_id } = req.params;
        // Excluir 'alergias_texto' de los datos directos de la evaluación
        const { alergias_texto, ...otrosDatos } = req.body;
        const datosEvaluacionCore = { // Datos para la tabla evaluaciones_enfermeria
            admision_id,
            enfermero_id: otrosDatos.enfermero_id,
            fecha_evaluacion: new Date(),
            motivo_internacion_actual: otrosDatos.motivo_internacion_actual,
            antecedentes_personales: otrosDatos.antecedentes_personales,
            antecedentes_familiares: otrosDatos.antecedentes_familiares,
            historial_medico_previo: otrosDatos.historial_medico_previo,
            medicacion_actual: otrosDatos.medicacion_actual,
            evaluacion_fisica: otrosDatos.evaluacion_fisica,
            signos_vitales_ta: otrosDatos.signos_vitales_ta,
            signos_vitales_fc: otrosDatos.signos_vitales_fc,
            signos_vitales_fr: otrosDatos.signos_vitales_fr,
            signos_vitales_temp: otrosDatos.signos_vitales_temp,
            signos_vitales_sato2: otrosDatos.signos_vitales_sato2,
            nivel_conciencia: otrosDatos.nivel_conciencia,
            estado_piel_mucosas: otrosDatos.estado_piel_mucosas,
            movilidad: otrosDatos.movilidad,
            necesidades_basicas_alimentacion: otrosDatos.necesidades_basicas_alimentacion,
            necesidades_basicas_higiene: otrosDatos.necesidades_basicas_higiene,
            necesidades_basicas_eliminacion: otrosDatos.necesidades_basicas_eliminacion,
            necesidades_basicas_descanso_sueno: otrosDatos.necesidades_basicas_descanso_sueno,
            valoracion_dolor_escala: otrosDatos.valoracion_dolor_escala,
            valoracion_dolor_localizacion: otrosDatos.valoracion_dolor_localizacion,
            valoracion_dolor_caracteristicas: otrosDatos.valoracion_dolor_caracteristicas,
            observaciones_adicionales: otrosDatos.observaciones_adicionales,
            plan_cuidados_inicial: otrosDatos.plan_cuidados_inicial
        };

        const errores = [];
        if (!datosEvaluacionCore.motivo_internacion_actual || datosEvaluacionCore.motivo_internacion_actual.trim() === '') {
            errores.push({ msg: 'El campo Motivo de Internación Actual es obligatorio.' });
        }
        if (!datosEvaluacionCore.enfermero_id || datosEvaluacionCore.enfermero_id.trim() === '') {
            errores.push({ msg: 'El campo Enfermero ID es obligatorio.' });
        }
        if (!datosEvaluacionCore.plan_cuidados_inicial || datosEvaluacionCore.plan_cuidados_inicial.trim() === '') {
            errores.push({ msg: 'El campo Plan de Cuidados Inicial es obligatorio.' });
        }


        if (errores.length > 0) {
            try {
                const admision = await Admision.buscarPorId(admision_id);
                const paciente = admision ? await Paciente.buscarPorId(admision.paciente_id) : null;
                const catalogoAlergias = await Alergia.listarTodas();
                return res.status(400).render('evaluacion_enfermeria/nueva', {
                    title: `Evaluación Inicial de Enfermería para Admisión ${admision_id}`,
                    errors,
                    admision,
                    paciente,
                    catalogoAlergias,
                    evaluacion: req.body // Repoblar con todo lo que se envió
                });
            } catch (errorAlObtener) {
                console.error('Error al obtener datos para re-renderizar formulario (registrarEvaluacion):', errorAlObtener);
                return next(errorAlObtener);
            }
        }

        let idNuevaEvaluacion;
        try {
            idNuevaEvaluacion = await EvaluacionEnfermeria.crear(datosEvaluacionCore);

            // Procesar alergias si existen
            if (alergias_texto && alergias_texto.trim() !== '') {
                const nombresAlergias = alergias_texto.split(',').map(nombre => nombre.trim()).filter(nombre => nombre !== '');
                for (const nombreAlergia of nombresAlergias) {
                    try {
                        let alergia = await Alergia.buscarPorNombre(nombreAlergia);
                        if (!alergia) {
                            const nuevaAlergiaId = await Alergia.crear({ nombre_alergia: nombreAlergia });
                            alergia = { id: nuevaAlergiaId, nombre_alergia: nombreAlergia }; // Construir objeto para vinculación
                        }
                        await EvaluacionAlergia.vincular(idNuevaEvaluacion, alergia.id);
                    } catch (errorVinculacionAlergia) {
                        // Loguear error pero no detener el flujo principal, la evaluación ya fue creada.
                        console.error(`Error al vincular/crear alergia '${nombreAlergia}' para evaluación ${idNuevaEvaluacion}:`, errorVinculacionAlergia);
                        // Considerar agregar un mensaje flash para el usuario si es importante.
                    }
                }
            }
            res.redirect(`/evaluaciones-enfermeria/${idNuevaEvaluacion}`);
        } catch (error) {
            console.error('Error al registrar la evaluación de enfermería o sus alergias:', error);
            errores.push({ msg: 'Error al registrar la evaluación. Verifique los datos.' });
            if (error.code === 'ER_DUP_ENTRY' || error.message.includes('UNIQUE constraint failed')) {
                errores.push({msg: 'Ya existe una evaluación para esta admisión.'});
            }
            try {
                const admision = await Admision.buscarPorId(admision_id);
                const paciente = admision ? await Paciente.buscarPorId(admision.paciente_id) : null;
                const catalogoAlergias = await Alergia.listarTodas();
                res.status(500).render('evaluacion_enfermeria/nueva', {
                    title: `Evaluación Inicial de Enfermería para Admisión ${admision_id}`,
                    errors,
                    admision,
                    paciente,
                    catalogoAlergias,
                    evaluacion: req.body
                });
            } catch (errorAlObtener) {
                console.error('Error al obtener datos para re-renderizar formulario (error BD registrarEvaluacion):', errorAlObtener);
                next(errorAlObtener);
            }
        }
    },

    /**
     * Muestra una evaluación de enfermería existente y sus alergias.
     */
    async mostrarEvaluacion(req, res, next) {
        const { id } = req.params;
        try {
            const evaluacion = await EvaluacionEnfermeria.obtenerPorId(id);
            if (!evaluacion) {
                return next({ status: 404, message: 'Evaluación de enfermería no encontrada.' });
            }
            const admision = await Admision.buscarPorId(evaluacion.admision_id);
            if (!admision) {
                return next({ status: 404, message: 'Admisión asociada no encontrada.' });
            }
            const paciente = await Paciente.buscarPorId(admision.paciente_id);
            if (!paciente) {
                return next({ status: 404, message: 'Paciente asociado no encontrado.' });
            }
            const alergiasVinculadas = await EvaluacionAlergia.listarPorIdEvaluacion(id);

            res.render('evaluacion_enfermeria/detalle', {
                title: `Evaluación de Enfermería para Admisión ${admision.id}`,
                evaluacion,
                admision,
                paciente,
                alergiasVinculadas // Pasar alergias a la vista de detalle
            });
        } catch (error) {
            console.error('Error en mostrarEvaluacion:', error);
            next(error);
        }
    },

    /**
     * Muestra el formulario para editar una evaluación de enfermería existente.
     */
    async mostrarFormularioEditarEvaluacion(req, res, next) {
        const { id } = req.params;
        try {
            const evaluacion = await EvaluacionEnfermeria.obtenerPorId(id);
            if (!evaluacion) {
                return next({ status: 404, message: 'Evaluación de enfermería no encontrada para editar.' });
            }
            const admision = await Admision.buscarPorId(evaluacion.admision_id);
            if (!admision) {
                return next({ status: 404, message: 'Admisión asociada no encontrada.' });
            }
            const paciente = await Paciente.buscarPorId(admision.paciente_id);
            if (!paciente) {
                return next({ status: 404, message: 'Paciente asociado no encontrado.' });
            }

            const catalogoAlergias = await Alergia.listarTodas();
            const alergiasVinculadas = await EvaluacionAlergia.listarPorIdEvaluacion(id);
            // Para pre-rellenar el campo de texto de alergias
            const alergias_texto_actual = alergiasVinculadas.map(a => a.nombre_alergia).join(', ');

            res.render('evaluacion_enfermeria/editar', {
                title: `Editar Evaluación de Enfermería para Admisión ${admision.id}`,
                evaluacion: { ...evaluacion, alergias_texto: alergias_texto_actual }, // Añadir texto de alergias
                admision,
                paciente,
                catalogoAlergias,
                alergiasVinculadas // Podría ser útil para la vista si se quiere mostrar más detalle
            });
        } catch (error) {
            console.error('Error en mostrarFormularioEditarEvaluacion:', error);
            next(error);
        }
    },

    /**
     * Actualiza una evaluación de enfermería existente.
     */
    async actualizarEvaluacion(req, res, next) {
        const { id } = req.params; // ID de la Evaluación
        const { alergias_texto, ...otrosDatos } = req.body;
        const datosParaActualizar = { // Objeto con los datos de la evaluación, excluyendo alergias_texto
            enfermero_id: otrosDatos.enfermero_id,
            motivo_internacion_actual: otrosDatos.motivo_internacion_actual,
            antecedentes_personales: otrosDatos.antecedentes_personales,
            antecedentes_familiares: otrosDatos.antecedentes_familiares,
            historial_medico_previo: otrosDatos.historial_medico_previo,
            medicacion_actual: otrosDatos.medicacion_actual,
            evaluacion_fisica: otrosDatos.evaluacion_fisica,
            signos_vitales_ta: otrosDatos.signos_vitales_ta,
            signos_vitales_fc: otrosDatos.signos_vitales_fc,
            signos_vitales_fr: otrosDatos.signos_vitales_fr,
            signos_vitales_temp: otrosDatos.signos_vitales_temp,
            signos_vitales_sato2: otrosDatos.signos_vitales_sato2,
            nivel_conciencia: otrosDatos.nivel_conciencia,
            estado_piel_mucosas: otrosDatos.estado_piel_mucosas,
            movilidad: otrosDatos.movilidad,
            necesidades_basicas_alimentacion: otrosDatos.necesidades_basicas_alimentacion,
            necesidades_basicas_higiene: otrosDatos.necesidades_basicas_higiene,
            necesidades_basicas_eliminacion: otrosDatos.necesidades_basicas_eliminacion,
            necesidades_basicas_descanso_sueno: otrosDatos.necesidades_basicas_descanso_sueno,
            valoracion_dolor_escala: otrosDatos.valoracion_dolor_escala,
            valoracion_dolor_localizacion: otrosDatos.valoracion_dolor_localizacion,
            valoracion_dolor_caracteristicas: otrosDatos.valoracion_dolor_caracteristicas,
            observaciones_adicionales: otrosDatos.observaciones_adicionales,
            plan_cuidados_inicial: otrosDatos.plan_cuidados_inicial
        };

        const errores = [];
        if (!datosParaActualizar.motivo_internacion_actual || datosParaActualizar.motivo_internacion_actual.trim() === '') {
            errores.push({ msg: 'El campo Motivo de Internación Actual es obligatorio.' });
        }
        if (!datosParaActualizar.enfermero_id || datosParaActualizar.enfermero_id.trim() === '') {
            errores.push({ msg: 'El campo Enfermero ID es obligatorio.' });
        }
        if (!datosParaActualizar.plan_cuidados_inicial || datosParaActualizar.plan_cuidados_inicial.trim() === '') {
            errores.push({ msg: 'El campo Plan de Cuidados Inicial es obligatorio.' });
        }

        if (errores.length > 0) {
            try {
                const evaluacionOriginal = await EvaluacionEnfermeria.obtenerPorId(id);
                const admision = evaluacionOriginal ? await Admision.buscarPorId(evaluacionOriginal.admision_id) : null;
                const paciente = admision ? await Paciente.buscarPorId(admision.paciente_id) : null;
                const catalogoAlergias = await Alergia.listarTodas();
                // El campo alergias_texto ya está en req.body, por lo que se puede usar directamente.
                // Fusionar evaluacionOriginal con req.body para repoblar el formulario.
                const evaluacionParaForm = { ...evaluacionOriginal, ...req.body };


                return res.status(400).render('evaluacion_enfermeria/editar', {
                    title: `Editar Evaluación de Enfermería para Admisión ${admision ? admision.id : 'N/A'}`,
                    errors,
                    admision,
                    paciente,
                    catalogoAlergias,
                    evaluacion: evaluacionParaForm
                });
            } catch (errorAlObtener) {
                console.error('Error al obtener datos para re-renderizar (actualizarEvaluacion):', errorAlObtener);
                return next(errorAlObtener);
            }
        }

        try {
            const filasAfectadas = await EvaluacionEnfermeria.actualizar(id, datosParaActualizar);
            if (filasAfectadas > 0) {
                // Desvincular todas las alergias anteriores
                await EvaluacionAlergia.desvincularTodasPorIdEvaluacion(id);
                // Vincular nuevas alergias si existen
                if (alergias_texto && alergias_texto.trim() !== '') {
                    const nombresAlergias = alergias_texto.split(',').map(nombre => nombre.trim()).filter(nombre => nombre !== '');
                    for (const nombreAlergia of nombresAlergias) {
                        try {
                            let alergia = await Alergia.buscarPorNombre(nombreAlergia);
                            if (!alergia) {
                                const nuevaAlergiaId = await Alergia.crear({ nombre_alergia: nombreAlergia });
                                alergia = { id: nuevaAlergiaId, nombre_alergia: nombreAlergia };
                            }
                            await EvaluacionAlergia.vincular(id, alergia.id);
                        } catch (errorVinculacionAlergia) {
                            console.error(`Error al vincular/crear alergia '${nombreAlergia}' para evaluación ${id} durante actualización:`, errorVinculacionAlergia);
                        }
                    }
                }
                res.redirect(`/evaluaciones-enfermeria/${id}`);
            } else {
                // Si filasAfectadas es 0, podría ser porque no se encontraron datos o no hubo cambios.
                // Verificar si la evaluación existe primero.
                const evaluacionExistente = await EvaluacionEnfermeria.obtenerPorId(id);
                if (!evaluacionExistente) {
                    return next({ status: 404, message: 'Evaluación de enfermería no encontrada para actualizar.' });
                }
                // Si existe pero no hubo cambios en los datos principales, aún procesar alergias
                 await EvaluacionAlergia.desvincularTodasPorIdEvaluacion(id);
                if (alergias_texto && alergias_texto.trim() !== '') {
                    const nombresAlergias = alergias_texto.split(',').map(nombre => nombre.trim()).filter(nombre => nombre !== '');
                    for (const nombreAlergia of nombresAlergias) {
                        try {
                            let alergia = await Alergia.buscarPorNombre(nombreAlergia);
                            if (!alergia) {
                                const nuevaAlergiaId = await Alergia.crear({ nombre_alergia: nombreAlergia });
                                alergia = { id: nuevaAlergiaId, nombre_alergia: nombreAlergia };
                            }
                            await EvaluacionAlergia.vincular(id, alergia.id);
                        } catch (errorVinculacionAlergia) {
                            console.error(`Error al vincular/crear alergia '${nombreAlergia}' para evaluación ${id} durante actualización (sin cambios en datos principales):`, errorVinculacionAlergia);
                        }
                    }
                }
                res.redirect(`/evaluaciones-enfermeria/${id}?mensaje=sin_cambios_datos_principales`); // Informar que no hubo cambios en datos principales
            }
        } catch (error) {
            console.error('Error al actualizar la evaluación de enfermería o sus alergias:', error);
            errores.push({ msg: 'Error al actualizar la evaluación. Verifique los datos.' });
            try {
                const evaluacionOriginal = await EvaluacionEnfermeria.obtenerPorId(id);
                const admision = evaluacionOriginal ? await Admision.buscarPorId(evaluacionOriginal.admision_id) : null;
                const paciente = admision ? await Paciente.buscarPorId(admision.paciente_id) : null;
                const catalogoAlergias = await Alergia.listarTodas();
                const evaluacionParaForm = { ...evaluacionOriginal, ...req.body };

                res.status(500).render('evaluacion_enfermeria/editar', {
                    title: `Editar Evaluación de Enfermería para Admisión ${admision ? admision.id : 'N/A'}`,
                    errors,
                    admision,
                    paciente,
                    catalogoAlergias,
                    evaluacion: evaluacionParaForm
                });
            } catch (errorAlObtener) {
                console.error('Error al obtener datos para re-renderizar (error BD actualizarEvaluacion):', errorAlObtener);
                next(errorAlObtener);
            }
        }
    }
};

module.exports = EvaluacionEnfermeriaController;
