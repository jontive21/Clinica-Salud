const Paciente = require('../models/pacienteModel.js'); // Referencia al modelo Paciente
const Admision = require('../models/admisionModel.js'); // Referencia al modelo Admision (para listar admisiones del paciente)

const PacienteController = {
    /**
     * Inserta un nuevo paciente en la base de datos.
     */
    async insertar(req, res, next) { // Se añade next para el manejo de errores global
        const {
            nombre, apellido, dni, fechaNacimiento, telefono, email,
            domicilio, localidad, provincia, cp,
            sexo, numero_seguro, informacion_seguro,
            contacto_emergencia_nombre, contacto_emergencia_telefono
        } = req.body;

        const datosPaciente = {
            nombre, apellido, dni, fechaNacimiento, telefono, email,
            domicilio, localidad, provincia, cp,
            sexo, numero_seguro, informacion_seguro,
            contacto_emergencia_nombre, contacto_emergencia_telefono
        };

        // Validación manual de campos requeridos "no vacíos"
        const errores = [];
        if (!nombre) errores.push({ msg: 'El campo Nombre es obligatorio.' });
        if (!apellido) errores.push({ msg: 'El campo Apellido es obligatorio.' });
        if (!dni) errores.push({ msg: 'El campo DNI es obligatorio.' });
        if (!fechaNacimiento) errores.push({ msg: 'El campo Fecha de Nacimiento es obligatorio.' });
        if (!telefono) errores.push({ msg: 'El campo Teléfono es obligatorio.' });
        if (!email) errores.push({ msg: 'El campo Email es obligatorio.' });
        // Los nuevos campos (sexo, numero_seguro, etc.) y los de dirección son opcionales por ahora.

        if (errores.length > 0) {
            return res.status(400).render('paciente/nuevo', {
                title: 'Registrar Nuevo Paciente', // Título traducido
                errors: errores,
                pacienteData: datosPaciente // Devuelve los datos enviados para repoblar el formulario
            });
        }

        try {
            await Paciente.insertar(datosPaciente);
            res.redirect('/pacientes');
        } catch (error) {
            console.error('Error al insertar el paciente:', error);
            return res.status(500).render('paciente/nuevo', {
                title: 'Registrar Nuevo Paciente',
                errors: [{ msg: 'Error al guardar el paciente. Verifique los datos e intente nuevamente. Si el DNI ya existe, no podrá duplicarlo.' }],
                pacienteData: datosPaciente
            });
        }
    },

    /**
     * Actualiza un paciente existente.
     */
    async actualizarPaciente(req, res, next) {
        const { id } = req.params;
        const {
            nombre, apellido, dni, fechaNacimiento, telefono, email,
            domicilio, localidad, provincia, cp,
            sexo, numero_seguro, informacion_seguro,
            contacto_emergencia_nombre, contacto_emergencia_telefono
        } = req.body;

        const datosPacienteForm = {
            id, nombre, apellido, dni, fechaNacimiento, telefono, email,
            domicilio, localidad, provincia, cp,
            sexo, numero_seguro, informacion_seguro,
            contacto_emergencia_nombre, contacto_emergencia_telefono
        };

        const errores = [];
        if (!nombre) errores.push({ msg: 'El campo Nombre es obligatorio.' });
        if (!apellido) errores.push({ msg: 'El campo Apellido es obligatorio.' });
        if (!dni) errores.push({ msg: 'El campo DNI es obligatorio.' });
        if (!fechaNacimiento) errores.push({ msg: 'El campo Fecha de Nacimiento es obligatorio.' });
        if (!telefono) errores.push({ msg: 'El campo Teléfono es obligatorio.' });
        if (!email) errores.push({ msg: 'El campo Email es obligatorio.' });

        if (errores.length > 0) {
            return res.status(400).render('paciente/editar', {
                title: `Editar Paciente: ${nombre || 'N/A'} ${apellido || 'N/A'}`,
                errors: errores,
                paciente: datosPacienteForm
            });
        }

        const datosParaActualizar = {
            nombre, apellido, dni, fechaNacimiento, telefono, email,
            domicilio, localidad, provincia, cp,
            sexo, numero_seguro, informacion_seguro,
            contacto_emergencia_nombre, contacto_emergencia_telefono
        };

        try {
            const filasAfectadas = await Paciente.actualizar(id, datosParaActualizar);
            if (filasAfectadas > 0) {
                res.redirect(`/pacientes/${id}`);
            } else {
                // Si no se afectaron filas pero no hubo error, podría ser que los datos eran iguales
                // o que el paciente no se encontró. El modelo debería diferenciar esto si es posible.
                // Por ahora, asumimos que si no hay error y no hay filasAfectadas, es porque no se encontró o no había cambios.
                // Considerar un mensaje flash o una redirección específica si es necesario.
                // Redirigir a detalles para ver el estado actual o un mensaje de "no cambios".
                res.redirect(`/pacientes/${id}?mensaje=sin_cambios`); // Ejemplo de query param para feedback
            }
        } catch (error) {
            console.error('Error al actualizar el paciente:', error);
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
                res.redirect('/pacientes');
            } else {
                const err = new Error('Paciente no encontrado para eliminar.');
                err.status = 404;
                return next(err);
            }
        } catch (error) {
            console.error('Error al eliminar el paciente:', error);
            // Si el error es por restricción de FK (ej., paciente con admisiones)
            // se debería capturar y mostrar un mensaje amigable.
            // Por ahora, se pasa al manejador global.
            // Ejemplo de manejo específico (requiere identificar el tipo de error de la DB):
            // if (error.code === 'ER_ROW_IS_REFERENCED_2') { // Código de error específico de MySQL para FK
            //     return res.status(400).send('No se puede eliminar el paciente porque tiene registros relacionados (ej. admisiones).');
            // }
            next(error);
        }
    },

    /**
     * Muestra el formulario para un nuevo paciente.
     */
    mostrarFormularioNuevo: (req, res) => {
        res.render('paciente/nuevo', {
            title: 'Registrar Nuevo Paciente',
            pacienteData: {} // Inicializa pacienteData para el formulario nuevo
        });
    },

    /**
     * Lista todos los pacientes.
     */
    async listarPacientes(req, res, next) {
        try {
            const pacientes = await Paciente.listarTodos();
            res.render('paciente/lista', {
                title: 'Lista de Pacientes',
                pacientes: pacientes
            });
        } catch (error) {
            console.error('Error al obtener la lista de pacientes:', error);
            next(error);
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

            const admisiones = await Admision.buscarActivasPorIdPaciente(id);

            res.render('paciente/detalle', {
                title: `Detalles del Paciente: ${paciente.nombre} ${paciente.apellido}`,
                paciente: paciente,
                admisiones: admisiones
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
                title: `Editar Paciente: ${paciente.nombre} ${paciente.apellido}`,
                paciente: paciente
            });
        } catch (error) {
            console.error('Error al obtener el paciente para editar:', error);
            next(error);
        }
    }
}
module.exports = PacienteController;