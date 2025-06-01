const pool = require('../config/db'); // Referencia a la configuración de la base de datos

const Paciente = {
    /**
     * Crea un nuevo paciente.
     * @param {object} datosPaciente - Datos para el nuevo paciente. Debe incluir al menos nombre, apellido, dni, fecha_nacimiento.
     *                                Puede incluir opcionalmente telefono, email, domicilio, localidad, provincia, cp, sexo,
     *                                numero_seguro, informacion_seguro, contacto_emergencia_nombre, contacto_emergencia_telefono.
     * @returns {Promise<number>} El ID del paciente recién insertado.
     */
    insertar: async (datosPaciente) => {
        let conexion; // Variable para la conexión a la base de datos
        try {
            conexion = await pool.getConnection();
            const [resultado] = await conexion.query("INSERT INTO pacientes SET ?", datosPaciente);
            return resultado.insertId; // Retorna el ID del paciente recién insertado
        } catch (error) {
            console.error('Error en Paciente.insertar:', error);
            throw error; // Re-lanza el error para que sea manejado por el controlador
        } finally {
            if (conexion) conexion.release(); // Libera la conexión de vuelta al pool
        }
    },

    /**
     * Busca un paciente por su DNI.
     * @param {string} dni - El DNI del paciente a buscar.
     * @returns {Promise<object|null>} El objeto del paciente si se encuentra, de lo contrario null.
     */
    buscarPorDni: async (dni) => {
        let conexion;
        try {
            conexion = await pool.getConnection();
            const [filas] = await conexion.query("SELECT * FROM pacientes WHERE dni = ?", [dni]);
            return filas.length > 0 ? filas[0] : null; // Retorna el primer paciente encontrado o null
        } catch (error) {
            console.error('Error en Paciente.buscarPorDni:', error);
            throw error;
        } finally {
            if (conexion) conexion.release();
        }
    },

    /**
     * Busca un paciente por su ID.
     * @param {number} id - El ID del paciente a buscar.
     * @returns {Promise<object|null>} El objeto del paciente si se encuentra, de lo contrario null.
     */
    buscarPorId: async (id) => {
        let conexion;
        try {
            conexion = await pool.getConnection();
            const [filas] = await conexion.query("SELECT * FROM pacientes WHERE id = ?", [id]);
            return filas.length > 0 ? filas[0] : null; // Retorna el primer paciente encontrado o null
        } catch (error) {
            console.error('Error en Paciente.buscarPorId:', error);
            throw error;
        } finally {
            if (conexion) conexion.release();
        }
    },

    /**
     * Obtiene todos los pacientes, ordenados por apellido y luego por nombre.
     * @returns {Promise<Array<object>>} Un arreglo de objetos de paciente, o un arreglo vacío si no hay ninguno.
     */
    listarTodos: async () => {
        let conexion;
        try {
            conexion = await pool.getConnection();
            const [filas] = await conexion.query("SELECT * FROM pacientes ORDER BY apellido, nombre");
            return filas; // Retorna todos los pacientes encontrados o un arreglo vacío si no hay
        } catch (error) {
            console.error('Error en Paciente.listarTodos:', error);
            throw error;
        } finally {
            if (conexion) conexion.release();
        }
    },

    /**
     * Actualiza un paciente existente.
     * @param {number} id - El ID del paciente a actualizar.
     * @param {object} datosPaciente - Datos para la actualización del paciente. Puede incluir cualquier campo de la tabla pacientes
     *                                (nombre, apellido, dni, fecha_nacimiento, telefono, email, domicilio, localidad, provincia, cp, sexo,
     *                                numero_seguro, informacion_seguro, contacto_emergencia_nombre, contacto_emergencia_telefono).
     * @returns {Promise<number>} El número de filas afectadas (usualmente 0 o 1).
     */
    actualizar: async (id, datosPaciente) => {
        let conexion;
        try {
            conexion = await pool.getConnection();
            // Asegura que solo los campos permitidos sean pasados o que datosPaciente esté pre-validado
            const [resultado] = await conexion.query("UPDATE pacientes SET ? WHERE id = ?", [datosPaciente, id]);
            return resultado.affectedRows; // Retorna el número de filas afectadas
        } catch (error) {
            console.error('Error en Paciente.actualizar:', error);
            throw error;
        } finally {
            if (conexion) conexion.release();
        }
    },

    /**
     * Elimina un paciente.
     * @param {number} id - El ID del paciente a eliminar.
     * @returns {Promise<number>} El número de filas afectadas (usualmente 0 o 1).
     */
    eliminar: async (id) => {
        let conexion;
        try {
            conexion = await pool.getConnection();
            const [resultado] = await conexion.query("DELETE FROM pacientes WHERE id = ?", [id]);
            return resultado.affectedRows; // Retorna el número de filas afectadas
        } catch (error) {
            console.error('Error en Paciente.eliminar:', error);
            throw error;
        } finally {
            if (conexion) conexion.release();
        }
    }
};

module.exports = Paciente;
