const pool = require('../config/db'); // Referencia a la configuración de la base de datos

const EvaluacionEnfermeria = {
    /**
     * Crea un nuevo registro de evaluación de enfermería.
     * @param {object} datosEvaluacion - Datos para la nueva evaluación.
     * @returns {Promise<number>} El ID de la evaluación recién creada.
     */
    crear: async (datosEvaluacion) => {
        let conexion; // Variable para la conexión a la base de datos
        try {
            conexion = await pool.getConnection();
            const datosParaInsertar = { ...datosEvaluacion };
            if (!datosParaInsertar.fecha_evaluacion) {
                datosParaInsertar.fecha_evaluacion = new Date(); // Establece la fecha y hora actual si no se provee
            }
            const [resultado] = await conexion.query("INSERT INTO evaluaciones_enfermeria SET ?", datosParaInsertar);
            return resultado.insertId;
        } catch (error) {
            console.error('Error en EvaluacionEnfermeria.crear:', error);
            throw error; // Re-lanza el error para que sea manejado por el controlador
        } finally {
            if (conexion) conexion.release(); // Libera la conexión de vuelta al pool
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
            const [filas] = await conexion.query("SELECT * FROM evaluaciones_enfermeria WHERE admision_id = ?", [idAdmision]);
            return filas.length > 0 ? filas[0] : null; // Retorna la primera fila encontrada o null
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
     * @returns {Promise<number>} El número de filas afectadas.
     */
    actualizar: async (id, datosEvaluacion) => {
        let conexion;
        try {
            conexion = await pool.getConnection();
            // Asegura que admision_id no sea parte de la cláusula SET de actualización directamente si es inmutable después de la creación
            const { admision_id, ...datosParaActualizar } = datosEvaluacion;
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
