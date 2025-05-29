const pool = require('../config/db'); // Referencia a la configuración de la base de datos

const Cama = {
    /**
     * Crea una nueva cama de hospital.
     * @param {object} datosCama - Datos para la nueva cama.
     * @param {number} datosCama.habitacion_id - ID de la habitación a la que pertenece la cama.
     * @param {string} datosCama.codigo_cama - Código/identificador de la cama dentro de la habitación.
     * @param {string} [datosCama.estado_cama='Libre'] - Estado inicial de la cama (opcional).
     * @returns {Promise<number>} El ID de la cama recién creada.
     */
    crear: async (datosCama) => {
        let conexion; // Variable para la conexión a la base de datos
        try {
            conexion = await pool.getConnection();
            const datosParaInsertar = { ...datosCama };
            if (!datosParaInsertar.estado_cama) {
                datosParaInsertar.estado_cama = 'Libre'; // Estado por defecto si no se provee
            }
            const [resultado] = await conexion.query("INSERT INTO camas SET ?", datosParaInsertar);
            return resultado.insertId;
        } catch (error) {
            console.error('Error en Cama.crear:', error);
            throw error; // Re-lanza el error para que sea manejado por el controlador
        } finally {
            if (conexion) conexion.release(); // Libera la conexión de vuelta al pool
        }
    },

    /**
     * Busca una cama de hospital por su ID.
     * @param {number} id - El ID de la cama a buscar.
     * @returns {Promise<object|null>} El objeto de la cama si se encuentra, de lo contrario null.
     */
    obtenerPorId: async (id) => {
        let conexion;
        try {
            conexion = await pool.getConnection();
            const [filas] = await conexion.query("SELECT * FROM camas WHERE id = ?", [id]);
            return filas.length > 0 ? filas[0] : null; // Retorna la primera fila encontrada o null
        } catch (error) {
            console.error('Error en Cama.obtenerPorId:', error);
            throw error;
        } finally {
            if (conexion) conexion.release();
        }
    },

    /**
     * Lista todas las camas de hospital en una habitación específica, ordenadas por código de cama.
     * @param {number} idHabitacion - El ID de la habitación.
     * @returns {Promise<Array<object>>} Un arreglo de objetos de cama, o un arreglo vacío si no se encuentran.
     */
    listarPorIdHabitacion: async (idHabitacion) => { 
        let conexion;
        try {
            conexion = await pool.getConnection();
            const [filas] = await conexion.query("SELECT * FROM camas WHERE habitacion_id = ? ORDER BY codigo_cama", [idHabitacion]);
            return filas;
        } catch (error) {
            console.error('Error en Cama.listarPorIdHabitacion:', error); 
            throw error;
        } finally {
            if (conexion) conexion.release();
        }
    },

    /**
     * Lista todas las camas de hospital, unidas con información de habitación y ala, ordenadas por ala, habitación, y luego código de cama.
     * @returns {Promise<Array<object>>} Un arreglo de objetos de cama con detalles de habitación y ala.
     */
    listarTodas: async () => {
        let conexion;
        const consulta = `
            SELECT c.*, h.numero_habitacion, a.nombre as ala_nombre 
            FROM camas c 
            JOIN habitaciones h ON c.habitacion_id = h.id 
            JOIN alas a ON h.ala_id = a.id 
            ORDER BY a.nombre, h.numero_habitacion, c.codigo_cama
        `;
        try {
            conexion = await pool.getConnection();
            const [filas] = await conexion.query(consulta);
            return filas;
        } catch (error) {
            console.error('Error en Cama.listarTodas:', error);
            throw error;
        } finally {
            if (conexion) conexion.release();
        }
    },

    /**
     * Lista todas las camas de hospital disponibles ('Libre' o 'Higienizada'), con información de habitación y ala.
     * @returns {Promise<Array<object>>} Un arreglo de objetos de cama disponibles.
     */
    listarCamasLibres: async () => { 
        let conexion;
        const consulta = `
            SELECT c.*, h.numero_habitacion, a.nombre as ala_nombre 
            FROM camas c 
            JOIN habitaciones h ON c.habitacion_id = h.id 
            JOIN alas a ON h.ala_id = a.id 
            WHERE c.estado_cama = 'Libre' OR c.estado_cama = 'Higienizada' 
            ORDER BY a.nombre, h.numero_habitacion, c.codigo_cama
        `;
        try {
            conexion = await pool.getConnection();
            const [filas] = await conexion.query(consulta);
            return filas;
        } catch (error) {
            console.error('Error en Cama.listarCamasLibres:', error); 
            throw error;
        } finally {
            if (conexion) conexion.release();
        }
    },

    /**
     * Actualiza el estado de una cama de hospital.
     * @param {number} id - El ID de la cama a actualizar.
     * @param {string} estadoCama - El nuevo estado para la cama.
     * @returns {Promise<number>} El número de filas afectadas.
     */
    actualizarEstado: async (id, estadoCama) => {
        let conexion;
        try {
            conexion = await pool.getConnection();
            const [resultado] = await conexion.query("UPDATE camas SET estado_cama = ? WHERE id = ?", [estadoCama, id]);
            return resultado.affectedRows;
        } catch (error) {
            console.error('Error en Cama.actualizarEstado:', error);
            throw error;
        } finally {
            if (conexion) conexion.release();
        }
    },

    /**
     * Asigna un paciente a una cama si la cama está disponible.
     * @param {number} idCama - El ID de la cama a asignar.
     * @param {number} idPaciente - El ID del paciente.
     * @param {number} idAdmision - El ID de la admisión actual.
     * @returns {Promise<number>} El número de filas afectadas (1 si es exitoso, 0 si la cama no está disponible).
     */
    asignarPaciente: async (idCama, idPaciente, idAdmision) => {
        let conexion;
        const consulta = `
            UPDATE camas 
            SET estado_cama = 'Ocupada', paciente_actual_id = ?, admision_actual_id = ? 
            WHERE id = ? AND (estado_cama = 'Libre' OR estado_cama = 'Higienizada')
        `;
        try {
            conexion = await pool.getConnection();
            const [resultado] = await conexion.query(consulta, [idPaciente, idAdmision, idCama]);
            return resultado.affectedRows;
        } catch (error) {
            console.error('Error en Cama.asignarPaciente:', error);
            throw error;
        } finally {
            if (conexion) conexion.release();
        }
    },

    /**
     * Libera una cama de hospital, estableciendo su estado a 'Libre' y limpiando los IDs de paciente/admisión.
     * @param {number} idCama - El ID de la cama a liberar.
     * @returns {Promise<number>} El número de filas afectadas.
     */
    liberarCama: async (idCama) => {
        let conexion;
        const consulta = `
            UPDATE camas 
            SET estado_cama = 'Libre', paciente_actual_id = NULL, admision_actual_id = NULL 
            WHERE id = ?
        `;
        try {
            conexion = await pool.getConnection();
            const [resultado] = await conexion.query(consulta, [idCama]);
            return resultado.affectedRows;
        } catch (error) {
            console.error('Error en Cama.liberarCama:', error);
            throw error;
        } finally {
            if (conexion) conexion.release();
        }
    },

    /**
     * Actualiza una cama de hospital existente (propósito general).
     * @param {number} id - El ID de la cama a actualizar.
     * @param {object} datosCama - Datos para la actualización de la cama.
     * @param {number} datosCama.habitacion_id
     * @param {string} datosCama.codigo_cama
     * @param {string} datosCama.estado_cama
     * @returns {Promise<number>} El número de filas afectadas.
     */
    actualizar: async (id, datosCama) => {
        let conexion;
        try {
            conexion = await pool.getConnection();
            const { habitacion_id, codigo_cama, estado_cama } = datosCama;
            const [resultado] = await conexion.query(
                "UPDATE camas SET habitacion_id = ?, codigo_cama = ?, estado_cama = ? WHERE id = ?",
                [habitacion_id, codigo_cama, estado_cama, id]
            );
            return resultado.affectedRows;
        } catch (error) {
            console.error('Error en Cama.actualizar (general):', error);
            throw error;
        } finally {
            if (conexion) conexion.release();
        }
    },

    /**
     * Elimina una cama de hospital por su ID.
     * @param {number} id - El ID de la cama a eliminar.
     * @returns {Promise<number>} El número de filas afectadas.
     */
    eliminar: async (id) => {
        let conexion;
        try {
            conexion = await pool.getConnection();
            const [resultado] = await conexion.query("DELETE FROM camas WHERE id = ?", [id]);
            return resultado.affectedRows;
        } catch (error) {
            console.error('Error en Cama.eliminar:', error);
            throw error;
        } finally {
            if (conexion) conexion.release();
        }
    },

    /**
     * Lista las camas actualmente ocupadas por un paciente específico para una admisión específica.
     * Debería retornar típicamente 0 o 1 cama.
     * @param {number} idPaciente - El ID del paciente.
     * @param {number} idAdmision - El ID de la admisión.
     * @returns {Promise<Array<object>>} Un arreglo de objetos de cama (usualmente uno o ninguno).
     */
    listarPorIdPacienteYIdAdmision: async (idPaciente, idAdmision) => { 
        let conexion;
        const consulta = `
            SELECT * 
            FROM camas 
            WHERE paciente_actual_id = ? AND admision_actual_id = ? AND estado_cama = 'Ocupada' 
            LIMIT 1 
        `; // LIMIT 1 porque un paciente solo debería estar en una cama por admisión
        try {
            conexion = await pool.getConnection();
            const [filas] = await conexion.query(consulta, [idPaciente, idAdmision]);
            return filas; // Retorna un arreglo, podría estar vacío o contener una cama
        } catch (error) {
            console.error('Error en Cama.listarPorIdPacienteYIdAdmision:', error); 
            throw error;
        } finally {
            if (conexion) conexion.release();
        }
    }
};

module.exports = Cama;
