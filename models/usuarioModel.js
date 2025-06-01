const pool = require('../config/db'); // Referencia a la configuración de la base de datos
const bcrypt = require('bcryptjs');   // Para el hashing de contraseñas

/**
 * Modelo para gestionar usuarios del sistema.
 * @namespace Usuario
 */
const Usuario = {
    /**
     * Crea un nuevo usuario en el sistema.
     * La contraseña se hashea antes de almacenarla.
     * @param {object} datosUsuario - Datos para el nuevo usuario.
     * @param {string} datosUsuario.email - Email del usuario (debe ser único).
     * @param {string} datosUsuario.password - Contraseña en texto plano.
     * @param {string} datosUsuario.nombre_completo - Nombre completo del usuario.
     * @returns {Promise<number>} El ID del usuario recién creado.
     * @throws {Error} Si ocurre un error durante la consulta a la base de datos o el hashing.
     * @memberof Usuario
     */
    crear: async (datosUsuario) => {
        let conexion;
        try {
            conexion = await pool.getConnection();

            // Hashear la contraseña
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(datosUsuario.password, salt);

            // Reemplazar la contraseña en texto plano con el hash
            const datosParaInsertar = {
                ...datosUsuario,
                password: hash
            };

            const [resultado] = await conexion.query("INSERT INTO usuarios SET ?", datosParaInsertar);
            return resultado.insertId;
        } catch (error) {
            console.error('Error en Usuario.crear:', error);
            throw error;
        } finally {
            if (conexion) conexion.release();
        }
    },

    /**
     * Busca un usuario por su dirección de email.
     * @param {string} email - El email del usuario a buscar.
     * @returns {Promise<object|null>} El objeto del usuario si se encuentra (incluyendo el hash de la contraseña), de lo contrario null.
     * @throws {Error} Si ocurre un error durante la consulta a la base de datos.
     * @memberof Usuario
     */
    buscarPorEmail: async (email) => {
        let conexion;
        try {
            conexion = await pool.getConnection();
            const [filas] = await conexion.query("SELECT * FROM usuarios WHERE email = ? LIMIT 1", [email]);
            return filas.length > 0 ? filas[0] : null;
        } catch (error) {
            console.error('Error en Usuario.buscarPorEmail:', error);
            throw error;
        } finally {
            if (conexion) conexion.release();
        }
    },

    /**
     * Busca un usuario por su ID.
     * @param {number} id - El ID del usuario a buscar.
     * @returns {Promise<object|null>} El objeto del usuario si se encuentra, de lo contrario null.
     *                                 Se seleccionan todos los campos excepto la contraseña por seguridad,
     *                                 a menos que se necesite explícitamente para alguna operación interna segura.
     *                                 Por ahora, se devuelve todo para consistencia con buscarPorEmail.
     */
    buscarPorId: async (id) => {
        let conexion;
        try {
            conexion = await pool.getConnection();
            // Devuelve todos los campos, incluyendo el hash de la contraseña.
            // El controlador debe decidir qué exponer.
            const [filas] = await conexion.query("SELECT * FROM usuarios WHERE id = ? LIMIT 1", [id]);
            return filas.length > 0 ? filas[0] : null;
        } catch (error) {
            console.error('Error en Usuario.buscarPorId:', error);
            throw error;
        } finally {
            if (conexion) conexion.release();
        }
    },

    /**
     * Verifica si una contraseña ingresada coincide con un hash almacenado.
     * Esta es una función de utilidad y no interactúa directamente con la base de datos.
     * @param {string} passwordIngresada - La contraseña en texto plano tal como la ingresó el usuario.
     * @param {string} hashAlmacenado - El hash de la contraseña almacenado en la base de datos.
     * @returns {Promise<boolean>} True si la contraseña coincide, false en caso contrario.
     * @throws {Error} Si ocurre un error durante la comparación (poco común).
     * @memberof Usuario
     */
    verificarPassword: async (passwordIngresada, hashAlmacenado) => {
        try {
            return await bcrypt.compare(passwordIngresada, hashAlmacenado);
        } catch (error) {
            console.error('Error en Usuario.verificarPassword:', error);
            throw error;
        }
    }

    // TODO: Considerar métodos para actualizar usuario (incluyendo cambio de contraseña),
    // eliminar usuario, y gestionar la vinculación con roles.
};

module.exports = Usuario;
