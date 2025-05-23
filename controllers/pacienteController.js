const Paciente = require('../models/pacienteModel.js');
const PacienteController = {
    async insertar(req, res) {
        try {
            const { nombre, apellido, dni, fechaNacimiento, telefono, email } = req.body;
    
            // Validar campos requeridos
            if (!nombre || !apellido || !dni || !fechaNacimiento || !telefono || !email) {
                return res.status(400).json({ error: 'Todos los campos son obligatorios' });
            }
    
            const paciente = req.body;
            await Paciente.insertar(paciente);
            res.status(201).json({ message: 'Paciente creado exitosamente' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al crear el paciente' });
        }
        },

    
    async actualizar(req, res) {
        try {
            const id = req.params.id;
            const paciente = req.body;
            await Paciente.actualizar(id, paciente);
            res.status(200).json({ message: 'Paciente actualizado exitosamente' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al actualizar el paciente' });
        }
    },

    async eliminar(req, res) {
        try {
            const id = req.params.id;
            await Paciente.eliminar(id);
            res.status(200).json({ message: 'Paciente eliminado exitosamente' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al eliminar el paciente' });
        }
    },

    mostrarFormularioNuevo: (req, res) => {
        res.render('paciente/nuevo'); 
    },
}
module.exports = PacienteController;