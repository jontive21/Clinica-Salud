const pool = require('../config/db'); // Referencia a la configuración de la base de datos

const Admision = {
    /**
     * Crea un nuevo registro de admisión.
     * @param {object} datosAdmision - Datos para la nueva admisión.
     * @param {number} datosAdmision.paciente_id - ID del paciente.
     * @param {string} datosAdmision.tipo_admision - Tipo de admisión (ej., 'Programada', 'Emergencia').
     * @param {string} [datosAdmision.medico_referente] - Médico referente (opcional).
     * @param {string} [datosAdmision.diagnostico_inicial] - Diagnóstico inicial (opcional).
     * @param {string} [datosAdmision.estado_admision='Activa'] - Estado de la admisión (opcional, por defecto 'Activa').
     * @returns {Promise<number>} El ID del registro de admisión recién creado.
     */
    crear: async (datosAdmision) => {
        let conexion; // Variable para la conexión a la base de datos
        try {
            conexion = await pool.getConnection();
            // Asegura que fecha_admision se establezca si no es provista por defecto por la base de datos
            const datosParaInsertar = {
                fecha_admision: new Date(), // Establece la fecha y hora actual
                ...datosAdmision
            };
            // Si estado_admision no se provee, se usará el valor por defecto de la BD o se puede establecer aquí
            if (!datosParaInsertar.estado_admision) {
                datosParaInsertar.estado_admision = 'Activa';
            }

            const [resultado] = await conexion.query("INSERT INTO admisiones SET ?", datosParaInsertar);
            return resultado.insertId;
        } catch (error) {
            console.error('Error en Admision.crear:', error);
            throw error; // Re-lanza el error para que sea manejado por el controlador
        } finally {
            if (conexion) conexion.release(); // Libera la conexión de vuelta al pool
        }
    },

    /**
     * Busca un registro de admisión por su ID.
     * @param {number} id - El ID del registro de admisión a buscar.
     * @returns {Promise<object|null>} El objeto del registro de admisión si se encuentra, de lo contrario null.
     */
    buscarPorId: async (id) => {
        let conexion;
        try {
            conexion = await pool.getConnection();
            // Asegura que cama_asignada_id sea seleccionado
            const [filas] = await conexion.query("SELECT *, cama_asignada_id FROM admisiones WHERE id = ?", [id]);
            return filas.length > 0 ? filas[0] : null; // Retorna la primera fila encontrada o null
        } catch (error) {
            console.error('Error en Admision.buscarPorId:', error);
            throw error;
        } finally {
            if (conexion) conexion.release();
        }
    },

    /**
     * Busca todos los registros de admisión activos para un paciente específico, ordenados por fecha de admisión descendente.
     * @param {number} idPaciente - El ID del paciente.
     * @returns {Promise<Array<object>>} Un arreglo de registros de admisión activos, o un arreglo vacío si no se encuentran.
     */
    buscarActivasPorIdPaciente: async (idPaciente) => {
        let conexion;
        try {
            conexion = await pool.getConnection();
            // Asegura que cama_asignada_id sea seleccionado
            const [filas] = await conexion.query("SELECT *, cama_asignada_id FROM admisiones WHERE paciente_id = ? AND estado_admision = 'Activa' ORDER BY fecha_admision DESC", [idPaciente]);
            return filas;
        } catch (error) {
            console.error('Error en Admision.buscarActivasPorIdPaciente:', error);
            throw error;
        } finally {
            if (conexion) conexion.release();
        }
    },

    /**
     * Actualiza el estado de un registro de admisión y, opcionalmente, la fecha de alta.
     * @param {number} idAdmision - El ID del registro de admisión a actualizar.
     * @param {string} nuevoEstado - El nuevo estado para la admisión (ej., 'Completada', 'Cancelada').
     * @param {Date | string | null} [fechaAlta=null] - La fecha de alta. Si se proporciona, se actualiza.
     *                                                  Si es null, el campo fecha_alta se establecerá a NULL en la BD (si la BD lo permite y es el comportamiento deseado).
     * @returns {Promise<number>} El número de filas afectadas (usualmente 0 o 1).
     */
    actualizarEstado: async (idAdmision, nuevoEstado, fechaAlta = null) => {
        let conexion;
        const consulta = "UPDATE admisiones SET estado_admision = ?, fecha_alta = ? WHERE id = ?";
        const parametros = [nuevoEstado, fechaAlta, idAdmision];

        try {
            conexion = await pool.getConnection();
            const [resultado] = await conexion.query(consulta, parametros);
            return resultado.affectedRows;
        } catch (error) {
            console.error('Error en Admision.actualizarEstado:', error);
            throw error;
        } finally {
            if (conexion) conexion.release();
        }
    },

    /**
     * Lista todos los registros de admisión, unidos con información del paciente, ordenados por fecha de admisión descendente.
     * @returns {Promise<Array<object>>} Un arreglo de registros de admisión con detalles del paciente, o un arreglo vacío si no se encuentran.
     */
    listarTodas: async () => {
        let conexion;
        const consulta = `
            SELECT
                a.*,
                p.nombre as paciente_nombre,
                p.apellido as paciente_apellido,
                p.dni as paciente_dni
            FROM admisiones a
            JOIN pacientes p ON a.paciente_id = p.id
            ORDER BY a.fecha_admision DESC
        `;
        // Asegura que cama_asignada_id sea seleccionado (está incluido en a.*)
        try {
            conexion = await pool.getConnection();
            const [filas] = await conexion.query(consulta);
            return filas;
        } catch (error) {
            console.error('Error en Admision.listarTodas:', error);
            throw error;
        } finally {
            if (conexion) conexion.release();
        }
    },

    /**
     * Actualiza el campo cama_asignada_id para un registro de admisión.
     * @param {number} idAdmision - El ID de la admisión a actualizar.
     * @param {number} idCama - El ID de la cama asignada.
     * @returns {Promise<number>} El número de filas afectadas.
     */
    actualizarCamaAsignada: async (idAdmision, idCama) => {
        let conexion;
        try {
            conexion = await pool.getConnection();
            const [resultado] = await conexion.query(
                "UPDATE admisiones SET cama_asignada_id = ? WHERE id = ?",
                [idCama, idAdmision]
            );
            return resultado.affectedRows;
        } catch (error) {
            console.error('Error en Admision.actualizarCamaAsignada:', error);
            throw error;
        } finally {
            if (conexion) conexion.release();
        }
    },

    /**
     * Limpia el campo cama_asignada_id para un registro de admisión (lo establece a NULL).
     * @param {number} idAdmision - El ID de la admisión a actualizar.
     * @returns {Promise<number>} El número de filas afectadas.
     */
    removerCamaAsignada: async (idAdmision) => {
        let conexion;
        try {
            conexion = await pool.getConnection();
            const [resultado] = await conexion.query(
                "UPDATE admisiones SET cama_asignada_id = NULL WHERE id = ?",
                [idAdmision]
            );
            return resultado.affectedRows;
        } catch (error) {
            console.error('Error en Admision.removerCamaAsignada:', error);
            throw error;
        } finally {
            if (conexion) conexion.release();
        }
    }
};

module.exports = Admision;
