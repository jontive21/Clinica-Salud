const Paciente = require('../models/pacienteModel.js'); // Referencia al modelo Paciente
const Admision = require('../models/admisionModel.js'); // Referencia al modelo Admision (para listar admisiones del paciente)

const PacienteController = {
    /**
     * Inserta un nuevo paciente en la base de datos.
     */
    async insertar(req, res, next) { // Se añade next para el manejo de errores global
        const { nombre, apellido, dni, fechaNacimiento, telefono, email, domicilio, localidad, provincia, cp } = req.body;
        const datosPaciente = { nombre, apellido, dni, fechaNacimiento, telefono, email, domicilio, localidad, provincia, cp };

        // Validación manual de campos requeridos "no vacíos"
        const errores = [];
        if (!nombre) errores.push({ msg: 'El campo Nombre es obligatorio.' });
        if (!apellido) errores.push({ msg: 'El campo Apellido es obligatorio.' });
        if (!dni) errores.push({ msg: 'El campo DNI es obligatorio.' });
        if (!fechaNacimiento) errores.push({ msg: 'El campo Fecha de Nacimiento es obligatorio.' });
        if (!telefono) errores.push({ msg: 'El campo Teléfono es obligatorio.' });
        if (!email) errores.push({ msg: 'El campo Email es obligatorio.' });
        // Domicilio, localidad, provincia, cp son opcionales según el formulario anterior,
        // pero si se vuelven obligatorios, agregar las validaciones aquí.

        if (errores.length > 0) {
            return res.status(400).render('paciente/nuevo', {
                title: 'Registrar Nuevo Paciente', // Título traducido
                errors: errores, // Se mantiene 'errors' para la vista, variable interna es 'errores'
                pacienteData: datosPaciente // Devuelve los datos enviados para repoblar el formulario
            });
        }

        try {
            await Paciente.insertar(datosPaciente);
            // En una inserción exitosa, redirige a la lista de pacientes (ej., /pacientes)
            res.redirect('/pacientes'); // Redirige a la lista de pacientes
        } catch (error) {
            console.error('Error al insertar el paciente:', error);
            // Maneja errores potenciales de la base de datos (ej., DNI duplicado)
            // Re-renderiza el formulario con un mensaje de error apropiado
            // Este es un error general, errores específicos de BD (como DNI duplicado) podrían necesitar un manejo más específico
            return res.status(500).render('paciente/nuevo', {
                title: 'Registrar Nuevo Paciente',
                errors: [{ msg: 'Error al guardar el paciente. Verifique los datos e intente nuevamente. Si el DNI ya existe, no podrá duplicarlo.' }],
                pacienteData: datosPaciente
            });
            // O, usar next(error) si se desea que el manejador global de errores en app.js lo gestione:
            // next(error); 
        }
    },

    /**
     * Actualiza un paciente existente.
     */
    async actualizarPaciente(req, res, next) {
        const { id } = req.params;
        const { nombre, apellido, dni, fechaNacimiento, telefono, email, domicilio, localidad, provincia, cp } = req.body;
        const datosPacienteForm = { id, nombre, apellido, dni, fechaNacimiento, telefono, email, domicilio, localidad, provincia, cp };

        // Validación manual de campos requeridos "no vacíos"
        const errores = [];
        if (!nombre) errores.push({ msg: 'El campo Nombre es obligatorio.' });
        if (!apellido) errores.push({ msg: 'El campo Apellido es obligatorio.' });
        if (!dni) errores.push({ msg: 'El campo DNI es obligatorio.' });
        if (!fechaNacimiento) errores.push({ msg: 'El campo Fecha de Nacimiento es obligatorio.' });
        if (!telefono) errores.push({ msg: 'El campo Teléfono es obligatorio.' });
        if (!email) errores.push({ msg: 'El campo Email es obligatorio.' });
        // Domicilio, localidad, provincia, cp son opcionales, no hay validaciones obligatorias aquí a menos que los requisitos cambien.

        if (errores.length > 0) {
            // Si falla la validación, re-renderiza el formulario de edición con errores y los datos enviados
            // No es necesario obtener de nuevo el paciente original solo para el título si los datos del formulario son suficientes
            return res.status(400).render('paciente/editar', {
                title: `Editar Paciente: ${nombre || 'N/A'} ${apellido || 'N/A'}`, // Usa datos del formulario para el título
                errors: errores,
                paciente: datosPacienteForm // Devuelve los datos enviados (incluyendo ID)
            });
        }

        // Crea un objeto solo con los campos a actualizar en la base de datos
        const datosParaActualizar = { nombre, apellido, dni, fechaNacimiento, telefono, email, domicilio, localidad, provincia, cp };

        try {
            const filasAfectadas = await Paciente.actualizar(id, datosParaActualizar);
            if (filasAfectadas > 0) {
                res.redirect(`/pacientes/${id}`); // Redirige a la página de detalles del paciente
            } else {
                // Este caso podría ocurrir si el ID del paciente no existe, aunque buscarPorId en mostrarFormularioEditar debería prevenirlo.
                // O si ningún dato fue realmente cambiado.
                const err = new Error('Paciente no encontrado o ningún dato modificado durante la actualización.');
                err.status = 404; // U otro estado apropiado
                return next(err);
            }
        } catch (error) {
            console.error('Error al actualizar el paciente:', error);
            // Maneja errores potenciales de la base de datos (ej., DNI duplicado si el DNI es editable y fue cambiado)
            // Re-renderiza el formulario con un mensaje de error apropiado
            return res.status(500).render('paciente/editar', {
                title: `Editar Paciente: ${nombre || 'N/A'} ${apellido || 'N/A'}`,
                errors: [{ msg: 'Error al actualizar el paciente. Verifique los datos e intente nuevamente. Si el DNI ya existe para otro paciente, no podrá duplicarlo.' }],
                paciente: datosPacienteForm
            });
        }
    },

    /**
     * Elimina un paciente.
     */
    async eliminarPaciente(req, res, next) {
        const { id } = req.params;
        try {
            const filasAfectadas = await Paciente.eliminar(id);
            if (filasAfectadas > 0) {
                // Opcional: Agregar mensaje flash aquí si está implementado
                // req.flash('success_msg', 'Paciente eliminado exitosamente');
                res.redirect('/pacientes');
            } else {
                const err = new Error('Paciente no encontrado para eliminar.');
                err.status = 404;
                return next(err);
            }
        } catch (error) {
            console.error('Error al eliminar el paciente:', error);
            next(error); // Pasa errores al manejador global
        }
    },

    /**
     * Muestra el formulario para un nuevo paciente.
     */
    mostrarFormularioNuevo: (req, res) => {
        res.render('paciente/nuevo', { title: 'Registrar Nuevo Paciente' }); // Título traducido
    },

    /**
     * Lista todos los pacientes.
     */
    async listarPacientes(req, res, next) {
        try {
            const pacientes = await Paciente.listarTodos();
            res.render('paciente/lista', {
                title: 'Lista de Pacientes', // Título traducido
                pacientes: pacientes
            });
        } catch (error) {
            console.error('Error al obtener la lista de pacientes:', error);
            next(error); // Pasa al manejador global de errores
        }
    },

    /**
     * Muestra los detalles de un paciente específico y sus admisiones activas.
     */
    async verPaciente(req, res, next) {
        const { id } = req.params;
        try {
            const paciente = await Paciente.buscarPorId(id);
            if (!paciente) {
                const err = new Error('Paciente no encontrado.');
                err.status = 404;
                return next(err);
            }

            const admisiones = await Admision.buscarActivasPorIdPaciente(id); // Usa el método renombrado del modelo Admision

            res.render('paciente/detalle', {
                title: `Detalles del Paciente: ${paciente.nombre} ${paciente.apellido}`, // Título traducido
                paciente: paciente,
                admisiones: admisiones // Pasa las admisiones a la vista
            });
        } catch (error) {
            console.error('Error al obtener detalles del paciente o sus admisiones:', error);
            next(error);
        }
    },

    /**
     * Muestra el formulario para editar un paciente existente.
     */
    async mostrarFormularioEditar(req, res, next) {
        const { id } = req.params;
        try {
            const paciente = await Paciente.buscarPorId(id);
            if (!paciente) {
                const err = new Error('Paciente no encontrado para editar.');
                err.status = 404;
                return next(err);
            }
            res.render('paciente/editar', {
                title: `Editar Paciente: ${paciente.nombre} ${paciente.apellido}`, // Título traducido
                paciente: paciente // Pasa los datos del paciente obtenidos a la vista
            });
        } catch (error) {
            console.error('Error al obtener el paciente para editar:', error);
            next(error);
        }
    }
}
module.exports = PacienteController;