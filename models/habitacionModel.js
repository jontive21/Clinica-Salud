const pool = require('../config/db'); // Referencia a la configuración de la base de datos

const Habitacion = {
    /**
     * Crea una nueva habitación de hospital.
     * @param {object} datosHabitacion - Datos para la nueva habitación.
     * @param {number} datosHabitacion.ala_id - ID del ala a la que pertenece la habitación.
     * @param {string} datosHabitacion.numero_habitacion - Número de la habitación.
     * @param {string} datosHabitacion.tipo - Tipo de habitación (ej., 'Privada', 'Compartida').
     * @param {number} datosHabitacion.capacidad - Capacidad de la habitación.
     * @param {string} [datosHabitacion.descripcion] - Descripción de la habitación (opcional).
     * @returns {Promise<number>} El ID de la habitación recién creada.
     */
    crear: async (datosHabitacion) => {
        let conexion; // Variable para la conexión a la base de datos
        try {
            conexion = await pool.getConnection();
            const [resultado] = await conexion.query("INSERT INTO habitaciones SET ?", datosHabitacion);
            return resultado.insertId;
        } catch (error) {
            console.error('Error en Habitacion.crear:', error);
            throw error; // Re-lanza el error para que sea manejado por el controlador
        } finally {
            if (conexion) conexion.release(); // Libera la conexión de vuelta al pool
        }
    },

    /**
     * Busca una habitación de hospital por su ID.
     * @param {number} id - El ID de la habitación a buscar.
     * @returns {Promise<object|null>} El objeto de la habitación si se encuentra, de lo contrario null.
     */
    obtenerPorId: async (id) => {
        let conexion;
        try {
            conexion = await pool.getConnection();
            const [filas] = await conexion.query("SELECT * FROM habitaciones WHERE id = ?", [id]);
            return filas.length > 0 ? filas[0] : null; // Retorna la primera fila encontrada o null
        } catch (error) {
            console.error('Error en Habitacion.obtenerPorId:', error);
            throw error;
        } finally {
            if (conexion) conexion.release();
        }
    },

    /**
     * Lista todas las habitaciones de hospital en un ala específica, ordenadas por número de habitación.
     * @param {number} idAla - El ID del ala.
     * @returns {Promise<Array<object>>} Un arreglo de objetos de habitación, o un arreglo vacío si no se encuentran.
     */
    listarPorIdAla: async (idAla) => {
        let conexion;
        try {
            conexion = await pool.getConnection();
            const [filas] = await conexion.query("SELECT * FROM habitaciones WHERE ala_id = ? ORDER BY numero_habitacion", [idAla]);
            return filas;
        } catch (error) {
            console.error('Error en Habitacion.listarPorIdAla:', error);
            throw error;
        } finally {
            if (conexion) conexion.release();
        }
    },

    /**
     * Lista todas las habitaciones de hospital, unidas con información del ala, ordenadas por nombre de ala y luego número de habitación.
     * @returns {Promise<Array<object>>} Un arreglo de objetos de habitación con detalles del ala, o un arreglo vacío si no se encuentran.
     */
    listarTodas: async () => { // O 'listarTodasLasHabitaciones'
        let conexion;
        const consulta = `
            SELECT
                h.*,
                a.nombre as ala_nombre
            FROM habitaciones h
            JOIN alas a ON h.ala_id = a.id
            ORDER BY a.nombre, h.numero_habitacion
        `;
        try {
            conexion = await pool.getConnection();
            const [filas] = await conexion.query(consulta);
            return filas;
        } catch (error) {
            console.error('Error en Habitacion.listarTodas:', error);
            throw error;
        } finally {
            if (conexion) conexion.release();
        }
    },

    /**
     * Actualiza una habitación de hospital existente.
     * @param {number} id - El ID de la habitación a actualizar.
     * @param {object} datosHabitacion - Datos para la actualización de la habitación.
     * @returns {Promise<number>} El número de filas afectadas.
     */
    actualizar: async (id, datosHabitacion) => {
        let conexion;
        try {
            conexion = await pool.getConnection();
            const { ala_id, numero_habitacion, tipo, capacidad, descripcion } = datosHabitacion;
            const [resultado] = await conexion.query(
                "UPDATE habitaciones SET ala_id = ?, numero_habitacion = ?, tipo = ?, capacidad = ?, descripcion = ? WHERE id = ?",
                [ala_id, numero_habitacion, tipo, capacidad, descripcion, id]
            );
            return resultado.affectedRows;
        } catch (error) {
            console.error('Error en Habitacion.actualizar:', error);
            throw error;
        } finally {
            if (conexion) conexion.release();
        }
    },

    /**
     * Elimina una habitación de hospital por su ID.
     * @param {number} id - El ID de la habitación a eliminar.
     * @returns {Promise<number>} El número de filas afectadas.
     */
    eliminar: async (id) => {
        let conexion;
        try {
            conexion = await pool.getConnection();
            const [resultado] = await conexion.query("DELETE FROM habitaciones WHERE id = ?", [id]);
            return resultado.affectedRows;
        } catch (error) {
            console.error('Error en Habitacion.eliminar:', error);
            throw error;
        } finally {
            if (conexion) conexion.release();
        }
    }
};

module.exports = Habitacion;
