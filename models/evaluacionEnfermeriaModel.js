const pool = require('../config/db'); // Referencia a la configuración de la base de datos

const EvaluacionEnfermeria = {
    /**
     * Crea un nuevo registro de evaluación de enfermería.
     * @param {object} datosEvaluacion - Datos para la nueva evaluación.
     *                                 No debe incluir el campo `alergias` textual, ya que se maneja en tabla separada.
     *                                 Campos esperados: admision_id, enfermero_id, [fecha_evaluacion], motivo_internacion_actual,
     *                                 antecedentes_personales, antecedentes_familiares, historial_medico_previo,
     *                                 medicacion_actual, evaluacion_fisica, signos_vitales_ta, signos_vitales_fc,
     *                                 signos_vitales_fr, signos_vitales_temp, signos_vitales_sato2, nivel_conciencia,
     *                                 estado_piel_mucosas, movilidad, necesidades_basicas_alimentacion,
     *                                 necesidades_basicas_higiene, necesidades_basicas_eliminacion,
     *                                 necesidades_basicas_descanso_sueno, valoracion_dolor_escala,
     *                                 valoracion_dolor_localizacion, valoracion_dolor_caracteristicas,
     *                                 observaciones_adicionales, plan_cuidados_inicial.
     * @returns {Promise<number>} El ID de la evaluación recién creada.
     */
    crear: async (datosEvaluacion) => {
        let conexion;
        try {
            conexion = await pool.getConnection();
            // Excluye el campo 'alergias' si viniera, ya que no pertenece a esta tabla directamente.
            const { alergias, ...datosLimpiosEvaluacion } = datosEvaluacion;

            const datosParaInsertar = { ...datosLimpiosEvaluacion };
            if (!datosParaInsertar.fecha_evaluacion) {
                datosParaInsertar.fecha_evaluacion = new Date();
            }
            const [resultado] = await conexion.query("INSERT INTO evaluaciones_enfermeria SET ?", datosParaInsertar);
            return resultado.insertId;
        } catch (error) {
            console.error('Error en EvaluacionEnfermeria.crear:', error);
            throw error;
        } finally {
            if (conexion) conexion.release();
        }
    },

    /**
     * Busca una evaluación de enfermería por el ID de admisión.
     * @param {number} idAdmision - El ID de la admisión.
     * @returns {Promise<object|null>} El objeto de la evaluación si se encuentra, de lo contrario null.
     */
    obtenerPorIdAdmision: async (idAdmision) => {
        let conexion;
        try {
            conexion = await pool.getConnection();
            // SELECT * no se ve afectado, simplemente no devolverá la columna 'alergias' que ya no existe.
            const [filas] = await conexion.query("SELECT * FROM evaluaciones_enfermeria WHERE admision_id = ?", [idAdmision]);
            return filas.length > 0 ? filas[0] : null;
        } catch (error) {
            console.error('Error en EvaluacionEnfermeria.obtenerPorIdAdmision:', error);
            throw error;
        } finally {
            if (conexion) conexion.release();
        }
    },

    /**
     * Busca una evaluación de enfermería por su ID.
     * @param {number} id - El ID de la evaluación.
     * @returns {Promise<object|null>} El objeto de la evaluación si se encuentra, de lo contrario null.
     */
    obtenerPorId: async (id) => {
        let conexion;
        try {
            conexion = await pool.getConnection();
            // SELECT * no se ve afectado.
            const [filas] = await conexion.query("SELECT * FROM evaluaciones_enfermeria WHERE id = ?", [id]);
            return filas.length > 0 ? filas[0] : null;
        } catch (error) {
            console.error('Error en EvaluacionEnfermeria.obtenerPorId:', error);
            throw error;
        } finally {
            if (conexion) conexion.release();
        }
    },

    /**
     * Actualiza una evaluación de enfermería existente.
     * @param {number} id - El ID de la evaluación a actualizar.
     * @param {object} datosEvaluacion - Datos para la actualización de la evaluación.
     *                                 No debe incluir el campo `alergias` textual.
     *                                 El campo `admision_id` se ignora si se pasa, ya que no debería cambiar.
     * @returns {Promise<number>} El número de filas afectadas.
     */
    actualizar: async (id, datosEvaluacion) => {
        let conexion;
        try {
            conexion = await pool.getConnection();
            // Excluye admision_id y el antiguo campo 'alergias' de la actualización.
            const { admision_id, alergias, ...datosParaActualizar } = datosEvaluacion;

            if (Object.keys(datosParaActualizar).length === 0) {
                // No hay datos para actualizar después de excluir admision_id y alergias
                return 0;
            }

            const [resultado] = await conexion.query(
                "UPDATE evaluaciones_enfermeria SET ? WHERE id = ?",
                [datosParaActualizar, id]
            );
            return resultado.affectedRows;
        } catch (error) {
            console.error('Error en EvaluacionEnfermeria.actualizar:', error);
            throw error;
        } finally {
            if (conexion) conexion.release();
        }
    }
    // TODO: Agregar método de eliminación si es necesario
};

module.exports = EvaluacionEnfermeria;
