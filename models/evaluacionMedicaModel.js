const pool = require('../config/db'); // Referencia a la configuración de la base de datos

const EvaluacionMedica = {
    /**
     * Crea un nuevo registro de evaluación médica.
     * @param {object} datosEvaluacionMedica - Datos para la nueva evaluación.
     * @returns {Promise<number>} El ID de la evaluación recién creada.
     */
    crear: async (datosEvaluacionMedica) => {
        let conexion; // Variable para la conexión a la base de datos
        try {
            conexion = await pool.getConnection();
            const datosParaInsertar = { ...datosEvaluacionMedica };
            if (!datosParaInsertar.fecha_evaluacion) {
                datosParaInsertar.fecha_evaluacion = new Date(); // Establece la fecha y hora actual si no se provee
            }
            const [resultado] = await conexion.query("INSERT INTO evaluaciones_medicas SET ?", datosParaInsertar);
            return resultado.insertId;
        } catch (error) {
            console.error('Error en EvaluacionMedica.crear:', error);
            throw error; // Re-lanza el error para que sea manejado por el controlador
        } finally {
            if (conexion) conexion.release(); // Libera la conexión de vuelta al pool
        }
    },

    /**
     * Busca todas las evaluaciones médicas para un ID de admisión específico, ordenadas por fecha de evaluación descendente.
     * @param {number} idAdmision - El ID de la admisión.
     * @returns {Promise<Array<object>>} Un arreglo de objetos de evaluación, o un arreglo vacío si no se encuentran.
     */
    obtenerPorIdAdmision: async (idAdmision) => {
        let conexion;
        try {
            conexion = await pool.getConnection();
            const [filas] = await conexion.query("SELECT * FROM evaluaciones_medicas WHERE admision_id = ? ORDER BY fecha_evaluacion DESC", [idAdmision]);
            return filas; // Retorna todas las filas encontradas o un arreglo vacío
        } catch (error) {
            console.error('Error en EvaluacionMedica.obtenerPorIdAdmision:', error);
            throw error;
        } finally {
            if (conexion) conexion.release();
        }
    },

    /**
     * Busca una evaluación médica por su ID.
     * @param {number} id - El ID de la evaluación.
     * @returns {Promise<object|null>} El objeto de la evaluación si se encuentra, de lo contrario null.
     */
    obtenerPorId: async (id) => {
        let conexion;
        try {
            conexion = await pool.getConnection();
            const [filas] = await conexion.query("SELECT * FROM evaluaciones_medicas WHERE id = ?", [id]);
            return filas.length > 0 ? filas[0] : null; // Retorna la primera fila encontrada o null
        } catch (error) {
            console.error('Error en EvaluacionMedica.obtenerPorId:', error);
            throw error;
        } finally {
            if (conexion) conexion.release();
        }
    },

    /**
     * Actualiza una evaluación médica existente.
     * @param {number} id - El ID de la evaluación a actualizar.
     * @param {object} datosEvaluacionMedica - Datos para la actualización de la evaluación.
     * @returns {Promise<number>} El número de filas afectadas.
     */
    actualizar: async (id, datosEvaluacionMedica) => {
        let conexion;
        try {
            conexion = await pool.getConnection();
            // Excluye campos que no deberían actualizarse directamente o son inmutables post-creación
            const { admision_id, evaluacion_enfermeria_id, fecha_evaluacion, ...datosParaActualizar } = datosEvaluacionMedica;
            const [resultado] = await conexion.query(
                "UPDATE evaluaciones_medicas SET ? WHERE id = ?",
                [datosParaActualizar, id]
            );
            return resultado.affectedRows;
        } catch (error) {
            console.error('Error en EvaluacionMedica.actualizar:', error);
            throw error;
        } finally {
            if (conexion) conexion.release();
        }
    }
    // TODO: Agregar método de eliminación si es necesario
};

module.exports = EvaluacionMedica;
