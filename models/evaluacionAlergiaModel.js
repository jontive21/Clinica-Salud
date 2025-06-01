const pool = require('../config/db'); // Referencia a la configuración de la base de datos

/**
 * Modelo para gestionar la vinculación de alergias a las evaluaciones de enfermería.
 * Representa la tabla de unión 'evaluacion_enfermeria_alergias'.
 * @namespace EvaluacionAlergia
 */
const EvaluacionAlergia = {
    /**
     * Vincula un tipo de alergia a una evaluación de enfermería específica, con notas opcionales.
     * @param {number} idEvaluacionEnfermeria - ID de la evaluación de enfermería.
     * @param {number} idAlergia - ID del tipo de alergia (del catálogo_alergias).
     * @param {string} [notasAdicionales=null] - Notas adicionales sobre la alergia para esta evaluación específica.
     * @returns {Promise<number>} El ID del registro de vinculación recién creado.
     * @throws {Error} Si ocurre un error durante la consulta a la base de datos, incluyendo errores de duplicados
     *                 si ya existe la vinculación (evaluacion_enfermeria_id, alergia_id).
     * @memberof EvaluacionAlergia
     */
    vincular: async (idEvaluacionEnfermeria, idAlergia, notasAdicionales = null) => {
        let conexion;
        const consulta = `
            INSERT INTO evaluacion_enfermeria_alergias
            (evaluacion_enfermeria_id, alergia_id, notas_adicionales)
            VALUES (?, ?, ?)
        `;
        try {
            conexion = await pool.getConnection();
            const [resultado] = await conexion.query(consulta, [idEvaluacionEnfermeria, idAlergia, notasAdicionales]);
            return resultado.insertId;
        } catch (error) {
            console.error('Error en EvaluacionAlergia.vincular:', error);
            // Aquí se podría verificar error.code === 'ER_DUP_ENTRY' para un mensaje más específico
            throw error;
        } finally {
            if (conexion) conexion.release();
        }
    },

    /**
     * Desvincula un tipo de alergia específico de una evaluación de enfermería.
     * @param {number} idEvaluacionEnfermeria - ID de la evaluación de enfermería.
     * @param {number} idAlergia - ID del tipo de alergia a desvincular.
     * @returns {Promise<number>} El número de filas afectadas (debería ser 1 si la vinculación existía, 0 si no).
     * @throws {Error} Si ocurre un error durante la consulta a la base de datos.
     * @memberof EvaluacionAlergia
     */
    desvincular: async (idEvaluacionEnfermeria, idAlergia) => {
        let conexion;
        const consulta = `
            DELETE FROM evaluacion_enfermeria_alergias
            WHERE evaluacion_enfermeria_id = ? AND alergia_id = ?
        `;
        try {
            conexion = await pool.getConnection();
            const [resultado] = await conexion.query(consulta, [idEvaluacionEnfermeria, idAlergia]);
            return resultado.affectedRows;
        } catch (error) {
            console.error('Error en EvaluacionAlergia.desvincular:', error);
            throw error;
        } finally {
            if (conexion) conexion.release();
        }
    },

    /**
     * Desvincula todas las alergias asociadas a una evaluación de enfermería específica.
     * Útil cuando se actualizan las alergias de una evaluación (borrar todas las anteriores y luego vincular las nuevas).
     * @param {number} idEvaluacionEnfermeria - ID de la evaluación de enfermería.
     * @returns {Promise<number>} El número de filas afectadas.
     * @throws {Error} Si ocurre un error durante la consulta a la base de datos.
     * @memberof EvaluacionAlergia
     */
    desvincularTodasPorIdEvaluacion: async (idEvaluacionEnfermeria) => {
        let conexion;
        const consulta = `
            DELETE FROM evaluacion_enfermeria_alergias
            WHERE evaluacion_enfermeria_id = ?
        `;
        try {
            conexion = await pool.getConnection();
            const [resultado] = await conexion.query(consulta, [idEvaluacionEnfermeria]);
            return resultado.affectedRows;
        } catch (error) {
            console.error('Error en EvaluacionAlergia.desvincularTodasPorIdEvaluacion:', error);
            throw error;
        } finally {
            if (conexion) conexion.release();
        }
    },

    /**
     * Lista todas las alergias vinculadas a una evaluación de enfermería específica, incluyendo detalles del catálogo de alergias.
     * @param {number} idEvaluacionEnfermeria - ID de la evaluación de enfermería.
     * @returns {Promise<Array<object>>} Un arreglo de objetos, donde cada objeto representa una alergia vinculada
     *                                     e incluye `id` (de la tabla de unión), `evaluacion_enfermeria_id`, `alergia_id`,
     *                                     `notas_adicionales`, `nombre_alergia` y `descripcion_alergia`.
     *                                     El arreglo estará vacío si no hay alergias vinculadas.
     * @throws {Error} Si ocurre un error durante la consulta a la base de datos.
     * @memberof EvaluacionAlergia
     */
    listarPorIdEvaluacion: async (idEvaluacionEnfermeria) => {
        let conexion;
        const consulta = `
            SELECT ea.id, ea.evaluacion_enfermeria_id, ea.alergia_id, ea.notas_adicionales,
                   ca.nombre_alergia, ca.descripcion_alergia
            FROM evaluacion_enfermeria_alergias ea
            JOIN catalogo_alergias ca ON ea.alergia_id = ca.id
            WHERE ea.evaluacion_enfermeria_id = ?
            ORDER BY ca.nombre_alergia
        `;
        try {
            conexion = await pool.getConnection();
            const [filas] = await conexion.query(consulta, [idEvaluacionEnfermeria]);
            return filas;
        } catch (error) {
            console.error('Error en EvaluacionAlergia.listarPorIdEvaluacion:', error);
            throw error;
        } finally {
            if (conexion) conexion.release();
        }
    }
};

module.exports = EvaluacionAlergia;
