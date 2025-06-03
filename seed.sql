-- Script de siembra de datos para el Sistema de Información Hospitalaria (SIH)

SET FOREIGN_KEY_CHECKS=0;

-- Limpiar datos existentes
DELETE FROM evaluacion_enfermeria_alergias;
DELETE FROM catalogo_alergias;
DELETE FROM evaluaciones_medicas;
DELETE FROM evaluaciones_enfermeria;
DELETE FROM camas;
DELETE FROM admisiones;
DELETE FROM pacientes;
DELETE FROM habitaciones;
DELETE FROM alas;
DELETE FROM usuarios;


-- Reiniciar contadores de AUTO_INCREMENT
ALTER TABLE alas AUTO_INCREMENT = 1;
ALTER TABLE habitaciones AUTO_INCREMENT = 1;
ALTER TABLE pacientes AUTO_INCREMENT = 1;
ALTER TABLE camas AUTO_INCREMENT = 1;
ALTER TABLE admisiones AUTO_INCREMENT = 1;
ALTER TABLE evaluaciones_enfermeria AUTO_INCREMENT = 1;
ALTER TABLE evaluaciones_medicas AUTO_INCREMENT = 1;
ALTER TABLE catalogo_alergias AUTO_INCREMENT = 1;
ALTER TABLE evaluacion_enfermeria_alergias AUTO_INCREMENT = 1;
ALTER TABLE usuarios AUTO_INCREMENT = 1;

-- 1. `usuarios` (Usuarios del Sistema) - Contraseña para 'admin' es 'admin123'
INSERT INTO usuarios (id, email, password, nombre_completo) VALUES
(1, 'admin@sih.com', '$2a$10$P7v6B7Y.3K4A5s0.d9Q8yORRAqD6FfDqK.y0G0m.j0E1G.xP1xS.S', 'Administrador del Sistema');

-- 2. `alas` (Alas)
INSERT INTO alas (id, nombre, descripcion) VALUES
(1, 'Ala Norte', 'Ala principal de hospitalización general y especialidades.'),
(2, 'Ala Sur', 'Ala dedicada a cuidados intensivos y postoperatorios.'),
(3, 'UCI', 'Unidad de Cuidados Intensivos.');

-- 3. `habitaciones` (Habitaciones)
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

-- 4. `camas` (Camas)
-- Habitación 101 (Privada, Capacidad 1) -> Cama ID 1
INSERT INTO camas (id, habitacion_id, codigo_cama, estado_cama) VALUES (1, 1, 'A', 'Libre');
-- Habitación 102 (Compartida, Capacidad 2) -> Camas ID 2, 3
INSERT INTO camas (id, habitacion_id, codigo_cama, estado_cama) VALUES (2, 2, 'A', 'Libre'), (3, 2, 'B', 'Higienizada');
-- Habitación 103 (Privada, Capacidad 1) -> Cama ID 4
INSERT INTO camas (id, habitacion_id, codigo_cama, estado_cama) VALUES (4, 3, 'A', 'Mantenimiento');
-- Habitación 201 (Compartida, Capacidad 2) -> Camas ID 5, 6
INSERT INTO camas (id, habitacion_id, codigo_cama, estado_cama) VALUES (5, 4, 'A', 'Libre'), (6, 4, 'B', 'Ocupada'); -- Cama 6 será la ocupada
-- Habitación 202 (Privada, Capacidad 1) -> Cama ID 7
INSERT INTO camas (id, habitacion_id, codigo_cama, estado_cama) VALUES (7, 5, 'A', 'Libre');
-- Habitación UCI-1 (UCI, Capacidad 1) -> Cama ID 8
INSERT INTO camas (id, habitacion_id, codigo_cama, estado_cama) VALUES (8, 6, 'U1', 'Libre');


-- 5. `pacientes` (Pacientes)
INSERT INTO pacientes (id, nombre, apellido, dni, fecha_nacimiento, sexo, telefono, email, domicilio, localidad, provincia, cp) VALUES
(1, 'Carlos', 'Sánchez', '12345678A', '1980-05-15', 'Masculino', '555-1234', 'carlos.sanchez@email.com', 'Calle Falsa 123', 'Springfield', 'Provincia Desconocida', 'B0001'),
(2, 'Laura', 'Gómez', '87654321B', '1992-11-20', 'Femenino', '555-5678', 'laura.gomez@email.com', 'Avenida Siempreviva 742', 'Shelbyville', 'Provincia Inventada', 'C0002'),
(3, 'Pedro', 'Martínez', '11223344C', '1975-01-30', 'Masculino', '555-8765', 'pedro.martinez@email.com', 'Boulevard de los Sueños Rotos 45', 'Capital City', 'Otra Provincia', 'D0003'),
(4, 'Ana', 'Rodríguez', '44332211D', '2001-07-10', 'Femenino', '555-4321', 'ana.rodriguez@email.com', 'Plaza Mayor 1', 'Villa Ejemplo', 'Provincia Ejemplo', 'E0004'),
(5, 'Luis', 'Fernández', '55667788E', '1960-03-05', 'Masculino', '555-1122', 'luis.fernandez@email.com', 'Camino Largo S/N', 'Pueblo Nuevo', 'Provincia Nueva', 'F0005');

-- 6. `admisiones` (Admisiones)
-- Admisión activa para Carlos Sánchez (ID 1), que ocupará la cama 6 (ID 6)
INSERT INTO admisiones (id, paciente_id, tipo_admision, medico_referente, diagnostico_inicial, estado_admision, cama_asignada_id) VALUES
(1, 1, 'Programada', 'Dr. House', 'Chequeo general y posible apendicitis', 'Activa', 6);
-- Admisión activa para Laura Gómez (ID 2), sin cama asignada inicialmente
INSERT INTO admisiones (id, paciente_id, tipo_admision, medico_referente, diagnostico_inicial, estado_admision) VALUES
(2, 2, 'Emergencia', 'Dra. Quinn', 'Fractura de tobillo', 'Activa');
-- Admisión activa para Ana Rodriguez (ID 3), sin cama asignada
INSERT INTO admisiones (id, paciente_id, tipo_admision, medico_referente, diagnostico_inicial, estado_admision) VALUES
(3, 4, 'Derivación Externa', 'Dr. Smith (Clínica Externa)', 'Estudio de hipertensión', 'Activa');
-- Admisión completada para Pedro Martínez (ID 4)
INSERT INTO admisiones (id, paciente_id, tipo_admision, medico_referente, diagnostico_inicial, estado_admision, fecha_alta) VALUES
(4, 3, 'Programada', 'Dr. Gregory', 'Cirugía menor de rodilla', 'Completada', '2023-10-25 14:30:00');

-- 7. Update `camas` for Occupied Bed (Cama ID 6, Paciente ID 1, Admision ID 1)
UPDATE camas SET paciente_actual_id = 1, admision_actual_id = 1 WHERE id = 6;

-- 8. `catalogo_alergias`
INSERT INTO catalogo_alergias (id, nombre_alergia, descripcion_alergia) VALUES
(1, 'Penicilina', 'Reacción común: erupción cutánea, anafilaxia en casos graves.'),
(2, 'Polen', 'Estacional, causa rinitis alérgica, conjuntivitis.'),
(3, 'Ácaros del polvo', 'Común en interiores, causa síntomas respiratorios.'),
(4, 'Látex', 'Reacción al contacto, puede ser grave en personal sanitario.');

-- 9. `evaluaciones_enfermeria` (Evaluaciones de Enfermería)
-- Para Admisión ID 1 (Carlos Sanchez, Paciente ID 1) -> Evaluación Enfermería ID 1
INSERT INTO evaluaciones_enfermeria (id, admision_id, enfermero_id, fecha_evaluacion, motivo_internacion_actual, antecedentes_personales, medicacion_actual, evaluacion_fisica, signos_vitales_ta, signos_vitales_fc, signos_vitales_fr, signos_vitales_temp, signos_vitales_sato2, nivel_conciencia, estado_piel_mucosas, movilidad, plan_cuidados_inicial) VALUES
(1, 1, 'ENF001', NOW(), 'Dolor abdominal agudo en fosa ilíaca derecha.', 'Hipertensión controlada.', 'Losartán 50mg/día', 'Paciente pálido, sudoroso, refiere dolor a la palpación en FID.', '130/85', 95, 22, 37.8, 97, 'Alerta, orientado', 'Piel y mucosas normocoloreadas, levemente deshidratado.', 'Completa, pero limitada por dolor.', 'Observación, control de signos vitales, preparar para posible cirugía.');
-- Para Admisión ID 2 (Laura Gomez, Paciente ID 2) -> Evaluación Enfermería ID 2
INSERT INTO evaluaciones_enfermeria (id, admision_id, enfermero_id, fecha_evaluacion, motivo_internacion_actual, antecedentes_personales, medicacion_actual, evaluacion_fisica, signos_vitales_ta, signos_vitales_fc, signos_vitales_fr, signos_vitales_temp, signos_vitales_sato2, nivel_conciencia, estado_piel_mucosas, movilidad, plan_cuidados_inicial) VALUES
(2, 2, 'ENF002', NOW(), 'Caída accidental, dolor e inflamación en tobillo izquierdo.', 'Ninguno de relevancia.', 'Ninguna.', 'Tobillo izquierdo edematizado, con deformidad aparente. Dolor a la movilización.', '120/70', 80, 18, 36.5, 99, 'Alerta, consciente', 'Piel y mucosas normales.', 'Incapacidad para apoyar pie izquierdo.', 'Inmovilización, analgesia, elevación del miembro, control de perfusión distal.');

-- 10. `evaluacion_enfermeria_alergias` (Vinculación de Alergias a Evaluaciones de Enfermería)
-- Carlos Sanchez (Eval Enf ID 1) es alérgico a Penicilina (Alergia ID 1)
INSERT INTO evaluacion_enfermeria_alergias (evaluacion_enfermeria_id, alergia_id, notas_adicionales) VALUES
(1, 1, 'Refiere erupción cutánea como reacción previa.');
-- Laura Gomez (Eval Enf ID 2) no tiene alergias conocidas (no se inserta nada aquí para ella)
-- Para probar múltiples alergias, podríamos añadir otra a Carlos:
INSERT INTO evaluacion_enfermeria_alergias (evaluacion_enfermeria_id, alergia_id, notas_adicionales) VALUES
(1, 2, 'Estornudos frecuentes en primavera.');


-- 11. `evaluaciones_medicas` (Evaluaciones Médicas)
-- Para Admisión ID 1 (Carlos Sanchez), vinculada a su evaluación de enfermería (ID 1)
INSERT INTO evaluaciones_medicas (admision_id, evaluacion_enfermeria_id, medico_id, fecha_evaluacion, diagnostico_principal, diagnosticos_secundarios, plan_tratamiento_inicial, tratamiento_farmacologico, solicitud_pruebas_diagnosticas) VALUES
(1, 1, 'MED001', NOW(), 'Apendicitis Aguda', 'Leve deshidratación', 'Cirugía (apendicectomía), hidratación IV.', 'Antibióticos profilácticos, analgésicos IV.', 'Análisis de sangre completo, ecografía abdominal.');
-- Para Admisión ID 2 (Laura Gomez), vinculada a su evaluación de enfermería (ID 2)
INSERT INTO evaluaciones_medicas (admision_id, evaluacion_enfermeria_id, medico_id, fecha_evaluacion, diagnostico_principal, plan_tratamiento_inicial, tratamiento_farmacologico, solicitud_pruebas_diagnosticas, observaciones_evolucion) VALUES
(2, 2, 'MED002', NOW(), 'Fractura de tobillo izquierdo no desplazada.', 'Reducción cerrada si es necesario, yeso/férula, analgesia.', 'Ibuprofeno 600mg c/8h, Paracetamol 1g c/6h si dolor.', 'Radiografía de tobillo (frente y perfil).', 'Paciente estable, se espera confirmación radiológica.');


SET FOREIGN_KEY_CHECKS=1;

SELECT 'Datos de ejemplo insertados correctamente.' AS mensaje;
```
