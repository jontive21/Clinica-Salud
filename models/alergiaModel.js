const pool = require('../config/db'); // Referencia a la configuración de la base de datos

/**
 * Modelo para gestionar el catálogo de tipos de alergias.
 * @namespace Alergia
 */
const Alergia = {
    /**
     * Crea un nuevo tipo de alergia en el catálogo.
     * @param {object} datosAlergia - Datos para el nuevo tipo de alergia.
     * @param {string} datosAlergia.nombre_alergia - Nombre del tipo de alergia.
     * @param {string} [datosAlergia.descripcion_alergia] - Descripción detallada de la alergia (opcional).
     * @returns {Promise<number>} El ID del tipo de alergia recién creado.
     * @throws {Error} Si ocurre un error durante la consulta a la base de datos.
     * @memberof Alergia
     */
    crear: async (datosAlergia) => {
        let conexion;
        try {
            conexion = await pool.getConnection();
            const [resultado] = await conexion.query("INSERT INTO catalogo_alergias SET ?", datosAlergia);
            return resultado.insertId;
        } catch (error) {
            console.error('Error en Alergia.crear:', error);
            throw error; // Re-lanza el error para que sea manejado por el controlador o servicio
        } finally {
            if (conexion) conexion.release(); // Libera la conexión de vuelta al pool
        }
    },

    /**
     * Busca un tipo de alergia por su ID.
     * @param {number} id - El ID del tipo de alergia a buscar.
     * @returns {Promise<object|null>} El objeto del tipo de alergia si se encuentra, de lo contrario null.
     * @throws {Error} Si ocurre un error durante la consulta a la base de datos.
     * @memberof Alergia
     */
    obtenerPorId: async (id) => {
        let conexion;
        try {
            conexion = await pool.getConnection();
            const [filas] = await conexion.query("SELECT * FROM catalogo_alergias WHERE id = ?", [id]);
            return filas.length > 0 ? filas[0] : null;
        } catch (error) {
            console.error('Error en Alergia.obtenerPorId:', error);
            throw error;
        } finally {
            if (conexion) conexion.release();
        }
    },

    /**
     * Busca un tipo de alergia por su nombre exacto.
     * Útil para verificar si una alergia ya existe antes de crearla o para obtener su ID.
     * @param {string} nombreAlergia - El nombre exacto del tipo de alergia a buscar.
     * @returns {Promise<object|null>} El objeto del tipo de alergia si se encuentra, de lo contrario null.
     * @throws {Error} Si ocurre un error durante la consulta a la base de datos.
     * @memberof Alergia
     */
    buscarPorNombre: async (nombreAlergia) => {
        let conexion;
        try {
            conexion = await pool.getConnection();
            const [filas] = await conexion.query("SELECT * FROM catalogo_alergias WHERE nombre_alergia = ? LIMIT 1", [nombreAlergia]);
            return filas.length > 0 ? filas[0] : null;
        } catch (error) {
            console.error('Error en Alergia.buscarPorNombre:', error);
            throw error;
        } finally {
            if (conexion) conexion.release();
        }
    },

    /**
     * Lista todos los tipos de alergias del catálogo, ordenados por nombre.
     * @returns {Promise<Array<object>>} Un arreglo de objetos de tipo de alergia, o un arreglo vacío si no se encuentran.
     * @throws {Error} Si ocurre un error durante la consulta a la base de datos.
     * @memberof Alergia
     */
    listarTodas: async () => {
        let conexion;
        try {
            conexion = await pool.getConnection();
            const [filas] = await conexion.query("SELECT * FROM catalogo_alergias ORDER BY nombre_alergia");
            return filas;
        } catch (error) {
            console.error('Error en Alergia.listarTodas:', error);
            throw error;
        } finally {
            if (conexion) conexion.release();
        }
    },

    /**
     * Actualiza un tipo de alergia existente en el catálogo.
     * @param {number} id - El ID del tipo de alergia a actualizar.
     * @param {object} datosAlergia - Datos para la actualización.
     * @param {string} datosAlergia.nombre_alergia - Nuevo nombre del tipo de alergia.
     * @param {string} [datosAlergia.descripcion_alergia] - Nueva descripción detallada (opcional).
     * @returns {Promise<number>} El número de filas afectadas (debería ser 1 si la actualización fue exitosa, 0 si no).
     * @throws {Error} Si ocurre un error durante la consulta a la base de datos (ej. nombre_alergia duplicado).
     * @memberof Alergia
     */
    actualizar: async (id, datosAlergia) => {
        let conexion;
        // Asegurarse de que solo se pasen los campos permitidos para actualizar.
        const { nombre_alergia, descripcion_alergia } = datosAlergia;
        const camposParaActualizar = { nombre_alergia, descripcion_alergia };

        try {
            conexion = await pool.getConnection();
            const [resultado] = await conexion.query(
                "UPDATE catalogo_alergias SET ? WHERE id = ?",
                [camposParaActualizar, id]
            );
            return resultado.affectedRows;
        } catch (error) {
            console.error('Error en Alergia.actualizar:', error);
            // Considerar manejo específico de error.code === 'ER_DUP_ENTRY' para nombre_alergia duplicado
            throw error;
        } finally {
            if (conexion) conexion.release();
        }
    },

    /**
     * Elimina un tipo de alergia del catálogo por su ID.
     * Nota: Si la alergia está vinculada a alguna evaluación de enfermería y la clave foránea
     * en `evaluacion_enfermeria_alergias` tiene `ON DELETE RESTRICT`, esta operación fallará.
     * @param {number} id - El ID del tipo de alergia a eliminar.
     * @returns {Promise<number>} El número de filas afectadas (debería ser 1 si la eliminación fue exitosa, 0 si no).
     * @throws {Error} Si ocurre un error durante la consulta a la base de datos (ej. restricción de FK).
     * @memberof Alergia
     */
    eliminar: async (id) => {
        let conexion;
        try {
            conexion = await pool.getConnection();
            const [resultado] = await conexion.query("DELETE FROM catalogo_alergias WHERE id = ?", [id]);
            return resultado.affectedRows;
        } catch (error) {
            console.error('Error en Alergia.eliminar:', error);
            // Considerar manejo específico de error.code === 'ER_ROW_IS_REFERENCED_2' (o similar) para FK constraint
            throw error;
        } finally {
            if (conexion) conexion.release();
        }
    }
};

module.exports = Alergia;
