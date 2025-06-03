# Sistema de Información Hospitalaria (SIH)

## Descripción

Un sistema para la gestión de pacientes, admisiones, asignación de camas y evaluaciones clínicas en un entorno hospitalario. Desarrollado como práctico integrador para la materia Programación Web II. El objetivo es proporcionar una herramienta base para la administración de información crítica en un hospital, facilitando los flujos de trabajo comunes desde la admisión del paciente hasta el alta, incluyendo la gestión de la infraestructura física del hospital y el registro de evaluaciones clínicas.

## Tecnologías Utilizadas

*   **Backend:** Node.js, Express.js
*   **Motor de Plantillas:** Pug
*   **Base de Datos:** MySQL (utilizando el driver `mysql2/promise`)
*   **Frontend:** HTML, CSS (se utilizan clases de Bootstrap para el estilizado básico, se asume la disponibilidad de archivos CSS de Bootstrap en `public/css/`)
*   **Variables de Entorno:** `dotenv`
*   **Hashing de Contraseñas:** `bcryptjs` (para la tabla de usuarios)

## Prerrequisitos para Configuración Local

*   Node.js (>= 16.x recomendado) y npm (Node Package Manager)
*   Servidor MySQL instalado y en ejecución.

## Instrucciones para Configuración de la Base de Datos

1.  **Crear la Base de Datos:**
    Conéctese a su servidor MySQL y ejecute el siguiente comando SQL para crear la base de datos (si aún no existe):
    ```sql
    CREATE DATABASE his_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    ```

2.  **Crear las Tablas:**
    Una vez creada la base de datos, utilice el script `schema.sql` proporcionado en la raíz del proyecto para crear todas las tablas necesarias. Desde la **raíz del proyecto** en su terminal, ejecute:
    ```bash
    mysql -u su_usuario_mysql -p his_db < schema.sql
    ```
    Reemplace `su_usuario_mysql` con su nombre de usuario de MySQL. Se le pedirá su contraseña.

3.  **Poblar la Base de Datos con Datos de Ejemplo:**
    Para cargar datos iniciales en las tablas, utilice el script `seed.sql` proporcionado. Desde la **raíz del proyecto** en su terminal, ejecute:
    ```bash
    mysql -u su_usuario_mysql -p his_db < seed.sql
    ```
    Nuevamente, reemplace `su_usuario_mysql` con su nombre de usuario de MySQL.

## Configuración del Entorno

La aplicación utiliza un archivo `.env` para gestionar las variables de entorno. Cree un archivo llamado `.env` en la raíz del proyecto con el siguiente contenido, reemplazando los valores de ejemplo con sus propias credenciales y configuraciones:

```env
DB_HOST=localhost
DB_USER=su_usuario_mysql # Reemplace con su usuario de MySQL (ej. root, o un usuario dedicado)
DB_PASSWORD=su_contraseña_mysql # Reemplace con su contraseña de MySQL
DB_NAME=his_db
PORT=3000
SESSION_SECRET=un_secreto_muy_secreto_para_cambiar_en_produccion
# La SESSION_SECRET es necesaria si se implementa express-session para autenticación.
# Cambie 'un_secreto_muy_secreto_para_cambiar_en_produccion' por una cadena aleatoria larga y segura.
```

Asegúrese de que los valores para `DB_USER` y `DB_PASSWORD` permitan el acceso a la base de datos `his_db` en su servidor `DB_HOST`. El `PORT` es el puerto en el que se ejecutará la aplicación web.

## Ejecución de la Aplicación

1.  **Instalar Dependencias:**
    Navegue a la raíz del proyecto en su terminal y ejecute:
    ```bash
    npm install
    ```
    Esto instalará todas las dependencias listadas en `package.json`, incluyendo `express`, `mysql2`, `pug`, `dotenv` y `bcryptjs`. Si se añade `express-session`, también se instalará si está en `package.json`.

2.  **Modo de Desarrollo:**
    Para ejecutar la aplicación en modo de desarrollo (con reinicio automático al detectar cambios usando `nodemon`):
    ```bash
    npm run dev
    ```
    La aplicación estará disponible en `http://localhost:PUERTO` (donde `PUERTO` es el valor definido en su archivo `.env`, por defecto 3000).

3.  **Modo de Producción (Básico):**
    Para ejecutar la aplicación en un modo más simple (sin reinicio automático):
    ```bash
    npm start
    ```

## Módulos/Funcionalidades Implementadas

Este proyecto estudiantil incluye las siguientes funcionalidades básicas:

*   **Gestión de Pacientes (CRUD):**
    *   Registro de nuevos pacientes con datos personales, de contacto, dirección, información de seguro y contacto de emergencia.
    *   Listado completo de pacientes.
    *   Visualización detallada de la información de un paciente, incluyendo sus admisiones activas.
    *   Edición de la información existente de un paciente.
    *   Eliminación de pacientes (sujeto a restricciones si tiene admisiones vinculadas).
*   **Gestión de Admisiones:**
    *   Registro de nuevas admisiones para pacientes existentes.
    *   Listado de todas las admisiones, mostrando información clave del paciente.
    *   Visualización de los detalles de una admisión, incluyendo enlaces para gestionar evaluaciones.
    *   Actualización del estado de una admisión (ej. Activa, Completada, Cancelada). Al completar o cancelar, si una cama estaba asignada, esta se libera automáticamente.
*   **Gestión de Infraestructura Hospitalaria (CRUD para cada entidad):**
    *   **Alas:** Creación, listado, edición y eliminación de alas del hospital.
    *   **Habitaciones:** Creación, listado, edición y eliminación de habitaciones, asignándolas a un ala y definiendo su tipo y capacidad (1 o 2 camas según HIS).
    *   **Camas:** Creación, listado, edición y eliminación de camas, asignándolas a una habitación y gestionando su estado (Libre, Ocupada, Mantenimiento, etc.). Se valida que no se exceda la capacidad de la habitación al crear camas.
*   **Asignación y Liberación de Camas:**
    *   Interfaz para asignar una cama disponible a una admisión activa.
    *   La lista de camas disponibles considera la compatibilidad de género para habitaciones compartidas (si una cama está ocupada, solo se pueden asignar camas en esa habitación a pacientes del mismo sexo).
    *   Funcionalidad para liberar una cama previamente asignada a una admisión.
*   **Evaluaciones de Enfermería:**
    *   Registro de una evaluación inicial de enfermería por admisión, cubriendo múltiples aspectos (antecedentes, signos vitales, necesidades básicas, etc.).
    *   Gestión estructurada de alergias: las alergias se ingresan como texto (separadas por comas), se buscan en un catálogo centralizado (creándose si no existen) y se vinculan a la evaluación.
    *   Visualización y edición de la evaluación de enfermería.
*   **Catálogo de Alergias (CRUD):**
    *   Gestión completa (crear, listar, editar, eliminar) del catálogo central de alergias.
*   **Evaluaciones Médicas:**
    *   Registro de evaluaciones médicas para una admisión (se permiten múltiples por admisión).
    *   Visualización y edición de las evaluaciones médicas registradas.

## Localización

La aplicación, incluyendo comentarios en el código, identificadores (donde fue sensible y práctico), y la interfaz de usuario, está desarrollada y presentada en **Español de Latinoamérica**.

## Usuarios del Sistema

*   Se ha implementado una tabla `usuarios` con campos para email, contraseña (hasheada con `bcryptjs`) y nombre completo.
*   El archivo `seed.sql` incluye un usuario administrador de ejemplo: `admin@sih.com` con contraseña `admin123`.
*   **Pendiente:** La implementación de las rutas de autenticación (login/logout) y la protección de rutas según el usuario. Actualmente, el acceso a las funcionalidades es directo.

## Despliegue en Servidor de Internet (Pendiente)

La subida y configuración en un servidor de internet es responsabilidad del alumno como parte de las pautas de entrega del proyecto.
```
