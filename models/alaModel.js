const pool = require('../config/db'); // Referencia a la configuración de la base de datos

const Ala = {
    /**
     * Crea una nueva ala de hospital.
     * @param {object} datosAla - Datos para la nueva ala.
     * @param {string} datosAla.nombre - Nombre del ala.
     * @param {string} [datosAla.descripcion] - Descripción del ala (opcional).
     * @returns {Promise<number>} El ID del ala recién creada.
     */
    crear: async (datosAla) => {
        let conexion; // Variable para la conexión a la base de datos
        try {
            conexion = await pool.getConnection();
            const [resultado] = await conexion.query("INSERT INTO alas SET ?", datosAla);
            return resultado.insertId;
        } catch (error) {
            console.error('Error en Ala.crear:', error);
            throw error; // Re-lanza el error para que sea manejado por el controlador
        } finally {
            if (conexion) conexion.release(); // Libera la conexión de vuelta al pool
        }
    },

    /**
     * Busca un ala de hospital por su ID.
     * @param {number} id - El ID del ala a buscar.
     * @returns {Promise<object|null>} El objeto del ala si se encuentra, de lo contrario null.
     */
    obtenerPorId: async (id) => {
        let conexion;
        try {
            conexion = await pool.getConnection();
            const [filas] = await conexion.query("SELECT * FROM alas WHERE id = ?", [id]);
            return filas.length > 0 ? filas[0] : null; // Retorna la primera fila encontrada o null
        } catch (error) {
            console.error('Error en Ala.obtenerPorId:', error);
            throw error;
        } finally {
            if (conexion) conexion.release();
        }
    },

    /**
     * Lista todas las alas de hospital, ordenadas por nombre.
     * @returns {Promise<Array<object>>} Un arreglo de objetos de ala, o un arreglo vacío si no se encuentran.
     */
    listarTodas: async () => { // 'listarTodasLasAlas' podría ser más explícito pero 'listarTodas' es común en modelos.
        let conexion;
        try {
            conexion = await pool.getConnection();
            const [filas] = await conexion.query("SELECT * FROM alas ORDER BY nombre");
            return filas;
        } catch (error) {
            console.error('Error en Ala.listarTodas:', error);
            throw error;
        } finally {
            if (conexion) conexion.release();
        }
    },

    /**
     * Actualiza un ala de hospital existente.
     * @param {number} id - El ID del ala a actualizar.
     * @param {object} datosAla - Datos para la actualización del ala.
     * @param {string} datosAla.nombre - Nuevo nombre del ala.
     * @param {string} [datosAla.descripcion] - Nueva descripción del ala.
     * @returns {Promise<number>} El número de filas afectadas.
     */
    actualizar: async (id, datosAla) => {
        let conexion;
        try {
            conexion = await pool.getConnection();
            const [resultado] = await conexion.query(
                "UPDATE alas SET nombre = ?, descripcion = ? WHERE id = ?",
                [datosAla.nombre, datosAla.descripcion, id]
            );
            return resultado.affectedRows;
        } catch (error) {
            console.error('Error en Ala.actualizar:', error);
            throw error;
        } finally {
            if (conexion) conexion.release();
        }
    },

    /**
     * Elimina un ala de hospital por su ID.
     * @param {number} id - El ID del ala a eliminar.
     * @returns {Promise<number>} El número de filas afectadas.
     */
    eliminar: async (id) => {
        let conexion;
        try {
            conexion = await pool.getConnection();
            const [resultado] = await conexion.query("DELETE FROM alas WHERE id = ?", [id]);
            return resultado.affectedRows;
        } catch (error) {
            console.error('Error en Ala.eliminar:', error);
            throw error;
        } finally {
            if (conexion) conexion.release();
        }
    }
};

module.exports = Ala;
