-- Script de siembra de datos para el Sistema de Información Hospitalaria (SIH)

-- Deshabilitar temporalmente la verificación de claves foráneas para permitir la inserción en cualquier orden
-- y manejar interdependencias durante la siembra.
SET FOREIGN_KEY_CHECKS=0;

-- Limpiar datos existentes para evitar conflictos de ID o datos duplicados al re-ejecutar.
-- El orden es importante debido a las claves foráneas.
DELETE FROM evaluaciones_medicas;
DELETE FROM evaluaciones_enfermeria;
DELETE FROM camas;
DELETE FROM admisiones;
DELETE FROM pacientes;
DELETE FROM habitaciones;
DELETE FROM alas;

-- Reiniciar contadores de AUTO_INCREMENT para cada tabla (opcional, pero útil para consistencia en IDs)
ALTER TABLE alas AUTO_INCREMENT = 1;
ALTER TABLE habitaciones AUTO_INCREMENT = 1;
ALTER TABLE pacientes AUTO_INCREMENT = 1;
ALTER TABLE camas AUTO_INCREMENT = 1;
ALTER TABLE admisiones AUTO_INCREMENT = 1;
ALTER TABLE evaluaciones_enfermeria AUTO_INCREMENT = 1;
ALTER TABLE evaluaciones_medicas AUTO_INCREMENT = 1;

-- 1. `alas` (Alas)
INSERT INTO alas (id, nombre, descripcion) VALUES
(1, 'Ala Norte', 'Ala principal de hospitalización general y especialidades.'),
(2, 'Ala Sur', 'Ala dedicada a cuidados intensivos y postoperatorios.'),
(3, 'UCI', 'Unidad de Cuidados Intensivos.');

-- 2. `habitaciones` (Habitaciones)
-- Ala Norte
INSERT INTO habitaciones (id, ala_id, numero_habitacion, tipo, capacidad, descripcion) VALUES
(1, 1, '101', 'Privada', 1, 'Habitación privada con baño.'),
(2, 1, '102', 'Compartida', 2, 'Habitación compartida para dos pacientes.'),
(3, 1, '103', 'Privada', 1, 'Habitación privada con vista al jardín.');
-- Ala Sur
INSERT INTO habitaciones (id, ala_id, numero_habitacion, tipo, capacidad, descripcion) VALUES
(4, 2, '201', 'Compartida', 2, 'Habitación compartida, equipada para postoperatorio.'),
(5, 2, '202', 'Privada', 1, 'Habitación privada para recuperación.');
-- UCI
INSERT INTO habitaciones (id, ala_id, numero_habitacion, tipo, capacidad, descripcion) VALUES
(6, 3, 'UCI-1', 'UCI', 1, 'Box individual en Unidad de Cuidados Intensivos.');

-- 3. `camas` (Camas)
-- Habitación 101 (Privada, Capacidad 1)
INSERT INTO camas (id, habitacion_id, codigo_cama, estado_cama) VALUES
(1, 1, 'A', 'Libre');
-- Habitación 102 (Compartida, Capacidad 2)
INSERT INTO camas (id, habitacion_id, codigo_cama, estado_cama) VALUES
(2, 2, 'A', 'Libre'),
(3, 2, 'B', 'Higienizada');
-- Habitación 103 (Privada, Capacidad 1)
INSERT INTO camas (id, habitacion_id, codigo_cama, estado_cama) VALUES
(4, 3, 'A', 'Mantenimiento'); -- Cama en mantenimiento
-- Habitación 201 (Compartida, Capacidad 2)
INSERT INTO camas (id, habitacion_id, codigo_cama, estado_cama) VALUES
(5, 4, 'A', 'Libre'),
(6, 4, 'B', 'Ocupada'); -- Esta cama será la ocupada
-- Habitación 202 (Privada, Capacidad 1)
INSERT INTO camas (id, habitacion_id, codigo_cama, estado_cama) VALUES
(7, 5, 'A', 'Libre');
-- Habitación UCI-1 (UCI, Capacidad 1)
INSERT INTO camas (id, habitacion_id, codigo_cama, estado_cama) VALUES
(8, 6, 'U1', 'Libre');


-- 4. `pacientes` (Pacientes)
INSERT INTO pacientes (id, nombre, apellido, dni, fecha_nacimiento, telefono, email, domicilio, localidad, provincia, cp, sexo) VALUES
(1, 'Carlos', 'Sanchez', '12345678A', '1980-05-15', '555-1234', 'carlos.sanchez@email.com', 'Calle Falsa 123', 'Springfield', 'Provincia Desconocida', 'B0001', 'Masculino'),
(2, 'Laura', 'Gomez', '87654321B', '1992-11-20', '555-5678', 'laura.gomez@email.com', 'Avenida Siempreviva 742', 'Shelbyville', 'Provincia Inventada', 'C0002', 'Femenino'),
(3, 'Pedro', 'Martinez', '11223344C', '1975-01-30', '555-8765', 'pedro.martinez@email.com', 'Boulevard de los Sueños Rotos 45', 'Capital City', 'Otra Provincia', 'D0003', 'Masculino'),
(4, 'Ana', 'Rodriguez', '44332211D', '2001-07-10', '555-4321', 'ana.rodriguez@email.com', 'Plaza Mayor 1', 'Villa Ejemplo', 'Provincia Ejemplo', 'E0004', 'Femenino'),
(5, 'Luis', 'Fernandez', '55667788E', '1960-03-05', '555-1122', 'luis.fernandez@email.com', 'Camino Largo S/N', 'Pueblo Nuevo', 'Provincia Nueva', 'F0005', 'Masculino');

-- 5. `admisiones` (Admisiones)
-- Admisión activa para Carlos Sanchez, que ocupará la cama 6
INSERT INTO admisiones (id, paciente_id, tipo_admision, medico_referente, diagnostico_inicial, estado_admision, cama_asignada_id) VALUES
(1, 1, 'Programada', 'Dr. House', 'Chequeo general y posible apendicitis', 'Activa', 6);
-- Admisión activa para Laura Gomez
INSERT INTO admisiones (id, paciente_id, tipo_admision, medico_referente, diagnostico_inicial, estado_admision) VALUES
(2, 2, 'Emergencia', 'Dra. Quinn', 'Fractura de tobillo', 'Activa');
-- Admisión activa para Ana Rodriguez
INSERT INTO admisiones (id, paciente_id, tipo_admision, medico_referente, diagnostico_inicial, estado_admision) VALUES
(3, 4, 'Derivación Externa', 'Dr. Smith (Clínica Externa)', 'Estudio de hipertensión', 'Activa');
-- Admisión completada para Pedro Martinez
INSERT INTO admisiones (id, paciente_id, tipo_admision, medico_referente, diagnostico_inicial, estado_admision, fecha_alta) VALUES
(4, 3, 'Programada', 'Dr. Gregory', 'Cirugía menor de rodilla', 'Completada', '2023-10-25 14:30:00');

-- 6. Update `camas` for Occupied Bed (Cama ID 6, Paciente ID 1, Admision ID 1)
UPDATE camas
SET paciente_actual_id = 1, admision_actual_id = 1
WHERE id = 6;

-- 7. `evaluaciones_enfermeria` (Evaluaciones de Enfermería)
-- Para Admisión ID 1 (Carlos Sanchez)
INSERT INTO evaluaciones_enfermeria (admision_id, enfermero_id, fecha_evaluacion, motivo_internacion_actual, antecedentes_personales, alergias, medicacion_actual, evaluacion_fisica, signos_vitales_ta, signos_vitales_fc, signos_vitales_fr, signos_vitales_temp, signos_vitales_sato2, nivel_conciencia, estado_piel_mucosas, movilidad, plan_cuidados_inicial) VALUES
(1, 'ENF001', NOW(), 'Dolor abdominal agudo en fosa ilíaca derecha.', 'Hipertensión controlada, apendicectomía previa (errónea, sigue con apéndice).', 'Penicilina', 'Losartán 50mg/día', 'Paciente pálido, sudoroso, refiere dolor a la palpación en FID.', '130/85', 95, 22, 37.8, 97, 'Alerta, orientado', 'Piel y mucosas normocoloreadas, levemente deshidratado.', 'Completa, pero limitada por dolor.', 'Observación, control de signos vitales, preparar para posible cirugía.');
-- Para Admisión ID 2 (Laura Gomez)
INSERT INTO evaluaciones_enfermeria (admision_id, enfermero_id, fecha_evaluacion, motivo_internacion_actual, antecedentes_personales, alergias, medicacion_actual, evaluacion_fisica, signos_vitales_ta, signos_vitales_fc, signos_vitales_fr, signos_vitales_temp, signos_vitales_sato2, nivel_conciencia, estado_piel_mucosas, movilidad, plan_cuidados_inicial) VALUES
(2, 'ENF002', NOW(), 'Caída accidental, dolor e inflamación en tobillo izquierdo.', 'Ninguno de relevancia.', 'Ninguna conocida.', 'Ninguna.', 'Tobillo izquierdo edematizado, con deformidad aparente. Dolor a la movilización.', '120/70', 80, 18, 36.5, 99, 'Alerta, consciente', 'Piel y mucosas normales.', 'Incapacidad para apoyar pie izquierdo.', 'Inmovilización, analgesia, elevación del miembro, control de perfusión distal.');

-- 8. `evaluaciones_medicas` (Evaluaciones Médicas)
-- Para Admisión ID 1 (Carlos Sanchez), vinculada a su evaluación de enfermería (ID 1)
INSERT INTO evaluaciones_medicas (admision_id, evaluacion_enfermeria_id, medico_id, fecha_evaluacion, diagnostico_principal, diagnosticos_secundarios, plan_tratamiento_inicial, tratamiento_farmacologico, solicitud_pruebas_diagnosticas) VALUES
(1, 1, 'MED001', NOW(), 'Apendicitis Aguda', 'Leve deshidratación', 'Cirugía (apendicectomía), hidratación IV.', 'Antibióticos profilácticos, analgésicos IV.', 'Análisis de sangre completo, ecografía abdominal.');
-- Para Admisión ID 2 (Laura Gomez), sin evaluación de enfermería vinculada explícitamente aquí (se podría vincular si se crea una)
INSERT INTO evaluaciones_medicas (admision_id, medico_id, fecha_evaluacion, diagnostico_principal, plan_tratamiento_inicial, tratamiento_farmacologico, solicitud_pruebas_diagnosticas, observaciones_evolucion) VALUES
(2, 'MED002', NOW(), 'Fractura de tobillo izquierdo no desplazada.', 'Reducción cerrada si es necesario, yeso/férula, analgesia.', 'Ibuprofeno 600mg c/8h, Paracetamol 1g c/6h si dolor.', 'Radiografía de tobillo (frente y perfil).', 'Paciente estable, se espera confirmación radiológica.');


-- Rehabilita la verificación de claves foráneas
SET FOREIGN_KEY_CHECKS=1;

-- Mensaje final
SELECT 'Datos de ejemplo insertados correctamente.' AS mensaje;
