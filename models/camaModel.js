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
        let conexion;
        try {
            conexion = await pool.getConnection();
            const datosParaInsertar = { ...datosCama };
            if (!datosParaInsertar.estado_cama) {
                datosParaInsertar.estado_cama = 'Libre';
            }
            const [resultado] = await conexion.query("INSERT INTO camas SET ?", datosParaInsertar);
            return resultado.insertId;
        } catch (error) {
            console.error('Error en Cama.crear:', error);
            throw error;
        } finally {
            if (conexion) conexion.release();
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
            return filas.length > 0 ? filas[0] : null;
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
            SELECT c.*, h.numero_habitacion, h.capacidad as capacidad_habitacion, a.nombre as ala_nombre
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
            SELECT c.*, h.numero_habitacion, h.capacidad as capacidad_habitacion, a.nombre as ala_nombre
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
     * Lista las camas disponibles para asignación, filtrando por el género del paciente si la habitación es compartida.
     * @param {string | null} sexoPacienteAAsignar - El sexo del paciente para el cual se busca cama ('Masculino', 'Femenino', 'Otro').
     *                                                Si es null o undefined, no se aplica filtro de género.
     * @returns {Promise<Array<object>>} Un arreglo de objetos de cama disponibles y compatibles.
     */
    listarCamasDisponiblesConFiltroGenero: async (sexoPacienteAAsignar) => {
        let conexion;
        // Esta consulta recupera camas disponibles (Libre/Higienizada) y, para cada una,
        // busca si hay OTROS pacientes en la MISMA habitación y cuál es su sexo.
        // Una cama disponible puede aparecer múltiples veces si hay múltiples otros pacientes en la habitación,
        // o una vez con sexo_paciente_ocupante = NULL si no hay otros pacientes.
        const sql = `
            SELECT
                c.id as cama_id, c.codigo_cama, c.estado_cama, c.habitacion_id, c.paciente_actual_id, c.admision_actual_id,
                h.numero_habitacion, h.capacidad as capacidad_habitacion,
                a.nombre as ala_nombre,
                (SELECT GROUP_CONCAT(DISTINCT p_ocup.sexo)
                 FROM camas c_ocup
                 JOIN pacientes p_ocup ON c_ocup.paciente_actual_id = p_ocup.id
                 WHERE c_ocup.habitacion_id = c.habitacion_id AND c_ocup.estado_cama = 'Ocupada'
                ) as sexos_ocupantes_habitacion
            FROM camas c
            JOIN habitaciones h ON c.habitacion_id = h.id
            JOIN alas a ON h.ala_id = a.id
            WHERE (c.estado_cama = 'Libre' OR c.estado_cama = 'Higienizada')
            ORDER BY a.nombre, h.numero_habitacion, c.codigo_cama;
        `;

        try {
            conexion = await pool.getConnection();
            const [camasDisponibles] = await conexion.query(sql);

            if (!sexoPacienteAAsignar) { // Si no se especifica sexo, devolver todas las libres (comportamiento anterior)
                return camasDisponibles.map(cama => ({ // Reconstruye el objeto cama como se esperaba antes si es necesario
                    id: cama.cama_id,
                    codigo_cama: cama.codigo_cama,
                    estado_cama: cama.estado_cama,
                    habitacion_id: cama.habitacion_id,
                    paciente_actual_id: cama.paciente_actual_id,
                    admision_actual_id: cama.admision_actual_id,
                    numero_habitacion: cama.numero_habitacion,
                    capacidad_habitacion: cama.capacidad_habitacion,
                    ala_nombre: cama.ala_nombre
                }));
            }

            const camasFiltradas = camasDisponibles.filter(cama => {
                if (cama.capacidad_habitacion === 1) { // Habitación privada, siempre disponible
                    return true;
                } else { // Habitación compartida
                    if (!cama.sexos_ocupantes_habitacion) { // Nadie más en la habitación compartida
                        return true;
                    }
                    // Hay otros ocupantes, verificar sus sexos
                    const sexosOcupantesArray = cama.sexos_ocupantes_habitacion.split(',');
                    // La cama es válida si todos los ocupantes existentes son del mismo sexo que el paciente a asignar
                    return sexosOcupantesArray.every(sexoOcup => sexoOcup === sexoPacienteAAsignar);
                }
            });

            // Mapear para devolver el formato de objeto cama esperado por las vistas/controladores si es diferente
            return camasFiltradas.map(cama => ({
                id: cama.cama_id,
                codigo_cama: cama.codigo_cama,
                estado_cama: cama.estado_cama,
                habitacion_id: cama.habitacion_id,
                paciente_actual_id: cama.paciente_actual_id,
                admision_actual_id: cama.admision_actual_id,
                numero_habitacion: cama.numero_habitacion,
                capacidad_habitacion: cama.capacidad_habitacion, // Este campo es útil para la lógica de asignación
                ala_nombre: cama.ala_nombre
                // No incluir sexos_ocupantes_habitacion en el resultado final a menos que sea necesario
            }));

        } catch (error) {
            console.error('Error en Cama.listarCamasDisponiblesConFiltroGenero:', error);
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
        `;
        try {
            conexion = await pool.getConnection();
            const [filas] = await conexion.query(consulta, [idPaciente, idAdmision]);
            return filas;
        } catch (error) {
            console.error('Error en Cama.listarPorIdPacienteYIdAdmision:', error);
            throw error;
        } finally {
            if (conexion) conexion.release();
        }
    }
};

module.exports = Cama;
