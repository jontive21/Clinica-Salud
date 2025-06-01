// controllers/asignacionCamaController.js
const Admision = require('../models/admisionModel.js'); // Referencia al modelo Admision
const Paciente = require('../models/pacienteModel.js'); // Referencia al modelo Paciente
const Cama = require('../models/camaModel.js');     // Referencia al modelo Cama

const AsignacionCamaController = {
    /**
     * Muestra el formulario para asignar una cama a una admisión activa.
     */
    async mostrarFormularioAsignarCama(req, res, next) {
        const { admision_id } = req.params; // Extrae admision_id de los parámetros de la ruta

        try {
            const admision = await Admision.buscarPorId(admision_id);
            if (!admision) {
                const err = new Error('Admisión no encontrada.');
                err.status = 404;
                return next(err);
            }
            if (admision.estado_admision !== 'Activa') {
                // O redirigir con un mensaje flash
                const err = new Error(`La admisión (ID: ${admision_id}) no está activa. Estado actual: ${admision.estado_admision}. No se puede asignar cama.`);
                err.status = 400; // Solicitud incorrecta, ya que la admisión no está en estado de asignación de cama
                return next(err);
            }

            const paciente = await Paciente.buscarPorId(admision.paciente_id);
            if (!paciente) {
                // Este caso idealmente no debería ocurrir si existe una admisión, debido a las restricciones de clave foránea
                const err = new Error(`Paciente (ID: ${admision.paciente_id}) asociado con la admisión no encontrado.`);
                err.status = 404;
                return next(err);
            }

            // Utiliza la nueva función del modelo que filtra por género si está disponible.
            // El modelo listarCamasDisponiblesConFiltroGenero maneja el caso de sexoPacienteAAsignar nulo/undefined
            // devolviendo todas las camas libres (similar a listarCamasLibres).
            const camasDisponibles = await Cama.listarCamasDisponiblesConFiltroGenero(paciente.sexo);

            res.render('asignacion/asignar', {
                title: `Asignar Cama para Admisión ID: ${admision.id} (Paciente: ${paciente.apellido}, ${paciente.nombre}, Sexo: ${paciente.sexo || 'No especificado'})`, // Añadido sexo al título para claridad
                admision: admision,
                paciente: paciente,
                camasDisponibles: camasDisponibles // Pasa las camas disponibles a la vista
            });

        } catch (error) {
            console.error('Error al obtener datos para el formulario de asignación de cama:', error);
            next(error); // Pasa el error al manejador global
        }
    },

    /**
     * Procesa la asignación de una cama a una admisión.
     */
    async asignarCama(req, res, next) {
        const { admision_id } = req.params; // Extrae admision_id de los parámetros de la ruta
        const { cama_id } = req.body;       // Extrae cama_id del cuerpo del formulario

        if (!cama_id) {
            const err = new Error('El ID de la cama es requerido para la asignación.');
            err.status = 400;
            // Considerar redirigir con un mensaje flash
            // req.flash('error_msg', 'No se seleccionó cama para la asignación.');
            // return res.redirect(`/asignaciones-cama/admision/${admision_id}/asignar-cama/ui`);
            return next(err); // Por ahora, pasa al manejador global de errores
        }

        try {
            const admision = await Admision.buscarPorId(admision_id);
            if (!admision) {
                const err = new Error('Admisión no encontrada para la asignación de cama.');
                err.status = 404;
                return next(err);
            }
            if (admision.estado_admision !== 'Activa') {
                const err = new Error(`La admisión (ID: ${admision_id}) no está activa. Estado actual: ${admision.estado_admision}. No se puede asignar cama.`);
                err.status = 400;
                // Considerar redirigir con un mensaje flash
                // req.flash('error_msg', `Admisión (ID: ${admision_id}) no está activa.`);
                // return res.redirect(`/asignaciones-cama/admision/${admision_id}/asignar-cama/ui`);
                return next(err);
            }

            const idPaciente = admision.paciente_id; // Renombrado para claridad
            const filasAfectadas = await Cama.asignarPaciente(cama_id, idPaciente, admision_id);

            if (filasAfectadas > 0) {
                // Actualiza el registro de admisión con el ID de la cama asignada
                await Admision.actualizarCamaAsignada(admision_id, cama_id);

                // Opcional: Agregar mensaje flash para éxito
                // req.flash('success_msg', 'Cama asignada exitosamente a la admisión.');
                res.redirect(`/admisiones/${admision_id}`);
            } else {
                // Esto implica que la cama no estaba disponible (ej., ya ocupada o estado cambiado)
                // O cama_id era inválido (aunque las restricciones FK podrían detectarlo antes si no se encuentra)
                const err = new Error('La cama no pudo ser asignada. Podría no estar ya disponible o ocurrió un error.');
                err.status = 409; // Conflicto o Solicitud incorrecta
                // Considerar redirigir con un mensaje flash
                // req.flash('error_msg', 'La cama seleccionada ya no está disponible o no pudo ser asignada.');
                // return res.redirect(`/asignaciones-cama/admision/${admision_id}/asignar-cama/ui`);
                return next(err);
            }
        } catch (error) {
            console.error('Error al procesar la asignación de cama:', error);
            next(error);
        }
    },

    /**
     * Libera una cama asignada a una admisión.
     */
    async liberarCamaAsignada(req, res, next) {
        const { admision_id } = req.params;

        try {
            const admision = await Admision.buscarPorId(admision_id);
            if (!admision) {
                const err = new Error('Admisión no encontrada.');
                err.status = 404;
                return next(err);
            }

            // Busca la cama actualmente asignada a este paciente para esta admisión
            const camasAsignadas = await Cama.listarPorIdPacienteYIdAdmision(admision.paciente_id, admision.id); // Usa el método renombrado

            if (camasAsignadas.length === 0) {
                // No hay cama asignada actualmente a esta admisión para este paciente, o ya fue liberada.
                // Considerar esto un éxito o una no-operación y redirigir, o mostrar un mensaje.
                // Por ahora, redirige como si fuera exitoso, pero un mensaje flash sería bueno.
                // req.flash('info_msg', 'No se encontró cama asignada a esta admisión, o ya fue liberada.');
                return res.redirect(`/admisiones/${admision_id}`);
            }

            const idCama = camasAsignadas[0].id; // Obtiene el ID de la primera (y debería ser única) cama

            const filasAfectadas = await Cama.liberarCama(idCama);

            if (filasAfectadas > 0) {
                // Limpia el ID de la cama asignada del registro de admisión
                await Admision.removerCamaAsignada(admision_id);

                // Opcional: Agregar mensaje flash para éxito
                // req.flash('success_msg', 'Cama liberada exitosamente.');
                res.redirect(`/admisiones/${admision_id}`);
            } else {
                // Este caso idealmente no debería ocurrir si se encontró una cama mediante listarPorIdPacienteYIdAdmision
                const err = new Error('La cama no pudo ser liberada. Podría haber sido ya liberada o ocurrió un error.');
                err.status = 409; // Conflicto o algún otro error
                return next(err);
            }

        } catch (error) {
            console.error('Error al liberar la cama:', error);
            next(error);
        }
    }
};

module.exports = AsignacionCamaController;
