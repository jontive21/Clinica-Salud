-- Schema for Hospital Information System (HIS)

-- Table: alas (Hospital Wings)
CREATE TABLE alas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT
);

-- Table: habitaciones (Rooms)
CREATE TABLE habitaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ala_id INT NOT NULL,
    numero_habitacion VARCHAR(20) NOT NULL,
    tipo VARCHAR(50) NOT NULL, -- e.g., 'Privada', 'Compartida', 'UCI'
    capacidad INT NOT NULL DEFAULT 1,
    descripcion TEXT,
    FOREIGN KEY (ala_id) REFERENCES alas(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    UNIQUE (ala_id, numero_habitacion) -- Room number must be unique within a wing
);

-- Table: camas (Beds)
CREATE TABLE camas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    habitacion_id INT NOT NULL,
    codigo_cama VARCHAR(20) NOT NULL, -- e.g., 'A', 'B', '1', '2'
    estado_cama VARCHAR(50) NOT NULL DEFAULT 'Libre', -- e.g., 'Libre', 'Ocupada', 'Mantenimiento', 'Higienizada'
    paciente_actual_id INT DEFAULT NULL, -- Foreign key to pacientes table
    admision_actual_id INT DEFAULT NULL, -- Foreign key to admisiones table
    FOREIGN KEY (habitacion_id) REFERENCES habitaciones(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    -- Foreign key constraints for paciente_actual_id and admision_actual_id will be added after pacientes and admisiones tables are defined
    UNIQUE (habitacion_id, codigo_cama) -- Bed code must be unique within a room
);

-- Table: pacientes (Patients)
CREATE TABLE pacientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    dni VARCHAR(20) NOT NULL UNIQUE,
    fechaNacimiento DATE NOT NULL,
    telefono VARCHAR(50),
    email VARCHAR(100) UNIQUE,
    domicilio VARCHAR(255),
    localidad VARCHAR(100),
    provincia VARCHAR(100),
    cp VARCHAR(20)
    -- created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table: admisiones (Admissions)
CREATE TABLE admisiones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    paciente_id INT NOT NULL,
    fecha_admision DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    tipo_admision VARCHAR(50) NOT NULL, -- e.g., 'Programada', 'Emergencia', 'Derivación Médica'
    medico_referente VARCHAR(200),
    diagnostico_inicial TEXT,
    estado_admision VARCHAR(50) NOT NULL DEFAULT 'Activa', -- e.g., 'Activa', 'Completada', 'Cancelada'
    fecha_alta DATETIME DEFAULT NULL, -- Date of discharge or completion
    cama_asignada_id INT DEFAULT NULL,
    FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (cama_asignada_id) REFERENCES camas(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Add Foreign Key constraints to camas table now that pacientes and admisiones are defined
ALTER TABLE camas
ADD CONSTRAINT fk_camas_paciente
FOREIGN KEY (paciente_actual_id) REFERENCES pacientes(id) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE camas
ADD CONSTRAINT fk_camas_admision
FOREIGN KEY (admision_actual_id) REFERENCES admisiones(id) ON DELETE SET NULL ON UPDATE CASCADE;

-- Enum-like values for some fields (for documentation, actual ENUM type can be used in MySQL if preferred)
-- alas.tipo: (Not explicitly defined, but could be 'General', 'Pediatría', 'Maternidad', etc.)
-- habitaciones.tipo: 'Privada', 'Compartida', 'Doble', 'UCI', 'Quirófano'
-- camas.estado_cama: 'Libre', 'Ocupada', 'Mantenimiento', 'Higienizada', 'Reservada'
-- admisiones.tipo_admision: 'Programada', 'Emergencia', 'Derivación Médica', 'Ambulatoria'
-- admisiones.estado_admision: 'Activa', 'Completada', 'Cancelada', 'Pendiente'
-- pacientes: (Consider adding 'genero' if needed for HIS)

-- Indexing recommendations (examples, more might be needed based on query patterns):
-- CREATE INDEX idx_pacientes_dni ON pacientes(dni);
-- CREATE INDEX idx_admisiones_paciente_id ON admisiones(paciente_id);
-- CREATE INDEX idx_admisiones_estado ON admisiones(estado_admision);
-- CREATE INDEX idx_habitaciones_ala_id ON habitaciones(ala_id);
-- CREATE INDEX idx_camas_habitacion_id ON camas(habitacion_id);
-- CREATE INDEX idx_camas_estado ON camas(estado_cama);
