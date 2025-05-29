-- Esquema para el Sistema de Información Hospitalaria (SIH)
-- Nota: Este script está diseñado para MySQL.
-- Para asegurar la re-ejecución, las tablas se eliminan en orden inverso a su creación (considerando dependencias).

SET FOREIGN_KEY_CHECKS=0; -- Deshabilita temporalmente la verificación de claves foráneas para DROP

DROP TABLE IF EXISTS evaluaciones_medicas;
DROP TABLE IF EXISTS evaluaciones_enfermeria;
DROP TABLE IF EXISTS camas; -- Se dropea antes de admisiones y pacientes por las FKs definidas con ALTER TABLE
DROP TABLE IF EXISTS admisiones;
DROP TABLE IF EXISTS pacientes;
DROP TABLE IF EXISTS habitaciones;
DROP TABLE IF EXISTS alas;

SET FOREIGN_KEY_CHECKS=1; -- Rehabilita la verificación de claves foráneas

-- Tabla: alas (Alas del Hospital)
CREATE TABLE alas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE COMMENT 'Nombre único del ala',
    descripcion TEXT COMMENT 'Descripción detallada del ala'
) COMMENT 'Alas o secciones del hospital';

-- Tabla: habitaciones (Habitaciones del Hospital)
CREATE TABLE habitaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ala_id INT NOT NULL COMMENT 'ID del ala a la que pertenece la habitación',
    numero_habitacion VARCHAR(20) NOT NULL COMMENT 'Número o código de la habitación, único por ala',
    tipo VARCHAR(50) NOT NULL COMMENT 'Tipo de habitación (ej. Privada, Compartida, UCI)',
    capacidad INT NOT NULL DEFAULT 1 COMMENT 'Capacidad de camas de la habitación',
    descripcion TEXT COMMENT 'Descripción adicional de la habitación',
    FOREIGN KEY (ala_id) REFERENCES alas(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    UNIQUE (ala_id, numero_habitacion) COMMENT 'El número de habitación debe ser único dentro de un ala'
) COMMENT 'Habitaciones dentro de las alas del hospital';

-- Tabla: pacientes (Pacientes)
CREATE TABLE pacientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL COMMENT 'Nombre(s) del paciente',
    apellido VARCHAR(100) NOT NULL COMMENT 'Apellido(s) del paciente',
    dni VARCHAR(20) NOT NULL UNIQUE COMMENT 'Documento Nacional de Identidad, único',
    fecha_nacimiento DATE NOT NULL COMMENT 'Fecha de nacimiento del paciente',
    telefono VARCHAR(50) COMMENT 'Número de teléfono de contacto',
    email VARCHAR(100) UNIQUE COMMENT 'Dirección de correo electrónico, única',
    domicilio VARCHAR(255) COMMENT 'Dirección de residencia del paciente',
    localidad VARCHAR(100) COMMENT 'Localidad de residencia',
    provincia VARCHAR(100) COMMENT 'Provincia de residencia',
    cp VARCHAR(20) COMMENT 'Código Postal',
    sexo VARCHAR(10) DEFAULT NULL COMMENT 'Sexo del paciente (ej. Masculino, Femenino, Otro)' -- Campo añadido
    -- created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Opcional: para auditoría
    -- updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP -- Opcional: para auditoría
) COMMENT 'Registros de pacientes del hospital';

-- Tabla: camas (Camas del Hospital)
CREATE TABLE camas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    habitacion_id INT NOT NULL COMMENT 'ID de la habitación a la que pertenece la cama',
    codigo_cama VARCHAR(20) NOT NULL COMMENT 'Código/identificador de la cama dentro de la habitación (ej. A, B, 1, 2)',
    estado_cama VARCHAR(50) NOT NULL DEFAULT 'Libre' COMMENT 'Estado actual de la cama (ej. Libre, Ocupada, Mantenimiento, Higienizada, Reservada)',
    paciente_actual_id INT DEFAULT NULL COMMENT 'ID del paciente que ocupa actualmente la cama (FK a pacientes)',
    admision_actual_id INT DEFAULT NULL COMMENT 'ID de la admisión actual asociada a la cama ocupada (FK a admisiones)',
    FOREIGN KEY (habitacion_id) REFERENCES habitaciones(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    UNIQUE (habitacion_id, codigo_cama) COMMENT 'El código de cama debe ser único dentro de una habitación'
    -- Las FKs para paciente_actual_id y admision_actual_id se añaden después con ALTER TABLE
) COMMENT 'Camas físicas dentro de las habitaciones';

-- Tabla: admisiones (Admisiones de Pacientes)
CREATE TABLE admisiones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    paciente_id INT NOT NULL COMMENT 'ID del paciente admitido',
    fecha_admision DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha y hora de la admisión',
    tipo_admision VARCHAR(50) NOT NULL COMMENT 'Tipo de admisión (ej. Programada, Emergencia, Derivación Médica)',
    medico_referente VARCHAR(200) COMMENT 'Médico que refiere al paciente (si aplica)',
    diagnostico_inicial TEXT COMMENT 'Diagnóstico inicial al momento de la admisión',
    estado_admision VARCHAR(50) NOT NULL DEFAULT 'Activa' COMMENT 'Estado actual de la admisión (ej. Activa, Completada, Cancelada)',
    fecha_alta DATETIME DEFAULT NULL COMMENT 'Fecha y hora del alta o finalización de la admisión',
    cama_asignada_id INT DEFAULT NULL COMMENT 'ID de la cama asignada a esta admisión (FK a camas)',
    FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (cama_asignada_id) REFERENCES camas(id) ON DELETE SET NULL ON UPDATE CASCADE
) COMMENT 'Registros de admisión de pacientes al hospital';

-- Añadir claves foráneas a la tabla `camas` después de que `pacientes` y `admisiones` estén definidas
ALTER TABLE camas
ADD CONSTRAINT fk_camas_paciente_actual
FOREIGN KEY (paciente_actual_id) REFERENCES pacientes(id) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE camas
ADD CONSTRAINT fk_camas_admision_actual
FOREIGN KEY (admision_actual_id) REFERENCES admisiones(id) ON DELETE SET NULL ON UPDATE CASCADE;

-- Tabla: evaluaciones_enfermeria (Evaluaciones de Enfermería)
CREATE TABLE evaluaciones_enfermeria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admision_id INT NOT NULL COMMENT 'ID de la admisión asociada a esta evaluación',
    enfermero_id VARCHAR(100) NOT NULL COMMENT 'Identificador del enfermero/a que realiza la evaluación',
    fecha_evaluacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha y hora de la evaluación',
    motivo_internacion_actual TEXT COMMENT 'Motivo de la internación actual según el paciente/acompañante',
    antecedentes_personales TEXT COMMENT 'Antecedentes médicos personales relevantes',
    antecedentes_familiares TEXT COMMENT 'Antecedentes médicos familiares relevantes',
    historial_medico_previo TEXT COMMENT 'Resumen del historial médico previo del paciente',
    alergias TEXT COMMENT 'Alergias conocidas del paciente',
    medicacion_actual TEXT COMMENT 'Medicación que el paciente toma actualmente',
    evaluacion_fisica TEXT COMMENT 'Observaciones generales de la evaluación física inicial',
    signos_vitales_ta VARCHAR(20) COMMENT 'Presión arterial (ej. 120/80)',
    signos_vitales_fc INT COMMENT 'Frecuencia cardíaca (latidos por minuto)',
    signos_vitales_fr INT COMMENT 'Frecuencia respiratoria (respiraciones por minuto)',
    signos_vitales_temp DECIMAL(4,1) COMMENT 'Temperatura corporal en Celsius',
    signos_vitales_sato2 INT COMMENT 'Saturación de oxígeno en porcentaje',
    nivel_conciencia VARCHAR(100) COMMENT 'Nivel de conciencia del paciente',
    estado_piel_mucosas TEXT COMMENT 'Observaciones sobre el estado de la piel y mucosas',
    movilidad VARCHAR(100) COMMENT 'Estado de movilidad del paciente',
    necesidades_basicas_alimentacion TEXT COMMENT 'Observaciones sobre alimentación',
    necesidades_basicas_higiene TEXT COMMENT 'Observaciones sobre higiene',
    necesidades_basicas_eliminacion TEXT COMMENT 'Observaciones sobre eliminación',
    necesidades_basicas_descanso_sueno TEXT COMMENT 'Observaciones sobre descanso y sueño',
    valoracion_dolor_escala VARCHAR(50) COMMENT 'Escala de dolor utilizada y valor',
    valoracion_dolor_localizacion VARCHAR(255) COMMENT 'Localización del dolor',
    valoracion_dolor_caracteristicas TEXT COMMENT 'Características del dolor',
    observaciones_adicionales TEXT COMMENT 'Otras observaciones relevantes',
    plan_cuidados_inicial TEXT NOT NULL COMMENT 'Plan de cuidados inicial de enfermería',
    FOREIGN KEY (admision_id) REFERENCES admisiones(id) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE (admision_id) COMMENT 'Asegura una única evaluación inicial de enfermería por admisión'
) COMMENT 'Evaluaciones iniciales realizadas por enfermería al ingreso';

-- Tabla: evaluaciones_medicas (Evaluaciones Médicas)
CREATE TABLE evaluaciones_medicas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admision_id INT NOT NULL COMMENT 'ID de la admisión asociada',
    evaluacion_enfermeria_id INT DEFAULT NULL COMMENT 'ID de la evaluación de enfermería vinculada (opcional)',
    medico_id VARCHAR(100) NOT NULL COMMENT 'Identificador del médico que realiza la evaluación',
    fecha_evaluacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha y hora de la evaluación médica',
    diagnostico_principal TEXT NOT NULL COMMENT 'Diagnóstico médico principal',
    diagnosticos_secundarios TEXT COMMENT 'Otros diagnósticos relevantes',
    plan_tratamiento_inicial TEXT NOT NULL COMMENT 'Plan de tratamiento inicial propuesto por el médico',
    tratamiento_farmacologico TEXT COMMENT 'Detalles del tratamiento farmacológico indicado',
    tratamiento_no_farmacologico TEXT COMMENT 'Detalles de tratamientos no farmacológicos',
    procedimientos_medicos TEXT COMMENT 'Procedimientos médicos indicados o realizados',
    interconsultas_solicitadas TEXT COMMENT 'Interconsultas solicitadas a otras especialidades',
    solicitud_pruebas_diagnosticas TEXT COMMENT 'Pruebas diagnósticas solicitadas',
    observaciones_evolucion TEXT COMMENT 'Observaciones sobre la evolución del paciente durante esta evaluación',
    recomendaciones_alta_seguimiento TEXT COMMENT 'Recomendaciones para el alta y seguimiento posterior',
    notas_medicas_adicionales TEXT COMMENT 'Notas adicionales del médico',
    FOREIGN KEY (admision_id) REFERENCES admisiones(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (evaluacion_enfermeria_id) REFERENCES evaluaciones_enfermeria(id) ON DELETE SET NULL ON UPDATE CASCADE
) COMMENT 'Evaluaciones médicas realizadas durante la admisión';

-- Comentarios sobre valores tipo ENUM (para documentación, se pueden usar tipos ENUM en MySQL si se prefiere)
-- alas.nombre: (no es un ENUM, pero los nombres deben ser únicos y representativos, ej: 'Ala Norte - Cardiología')
-- habitaciones.tipo: 'Privada', 'Compartida', 'Doble', 'UCI', 'Quirófano', 'Observación'
-- camas.estado_cama: 'Libre', 'Ocupada', 'Mantenimiento', 'Higienizada', 'Reservada', 'Bloqueada'
-- admisiones.tipo_admision: 'Programada', 'Emergencia', 'Derivación Externa', 'Derivación Interna', 'Ambulatoria'
-- admisiones.estado_admision: 'Activa', 'Completada', 'Cancelada', 'Pendiente Alta', 'De Alta'
-- pacientes.sexo: 'Masculino', 'Femenino', 'Otro', 'No Especificado'

-- Recomendaciones de Índices (ejemplos, podrían necesitarse más según los patrones de consulta):
CREATE INDEX idx_pacientes_dni ON pacientes(dni);
CREATE INDEX idx_pacientes_apellido_nombre ON pacientes(apellido, nombre);
CREATE INDEX idx_admisiones_paciente_id ON admisiones(paciente_id);
CREATE INDEX idx_admisiones_estado ON admisiones(estado_admision);
CREATE INDEX idx_admisiones_cama_asignada_id ON admisiones(cama_asignada_id);
CREATE INDEX idx_habitaciones_ala_id ON habitaciones(ala_id);
CREATE INDEX idx_camas_habitacion_id ON camas(habitacion_id);
CREATE INDEX idx_camas_estado ON camas(estado_cama);
CREATE INDEX idx_camas_paciente_actual_id ON camas(paciente_actual_id);
CREATE INDEX idx_eval_enfermeria_admision_id ON evaluaciones_enfermeria(admision_id);
CREATE INDEX idx_eval_medicas_admision_id ON evaluaciones_medicas(admision_id);
CREATE INDEX idx_eval_medicas_eval_enf_id ON evaluaciones_medicas(evaluacion_enfermeria_id);
