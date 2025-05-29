# Sistema de Información Hospitalaria (SIH)

## Descripción

Un sistema para la gestión de pacientes, admisiones, asignación de camas y evaluaciones clínicas en un entorno hospitalario. Desarrollado como práctico integrador para la materia Programación Web II. El objetivo es proporcionar una herramienta base para la administración de información crítica en un hospital, facilitando los flujos de trabajo comunes desde la admisión del paciente hasta el alta, incluyendo la gestión de la infraestructura física del hospital.

## Tecnologías Utilizadas

*   **Backend:** Node.js, Express.js
*   **Motor de Plantillas:** Pug
*   **Base de Datos:** MySQL (utilizando el driver `mysql2`)
*   **Frontend:** HTML, CSS (clases de Bootstrap utilizadas para el estilizado básico)
*   **Variables de Entorno:** `dotenv`

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
```

Asegúrese de que los valores para `DB_USER` y `DB_PASSWORD` permitan el acceso a la base de datos `his_db` en su servidor `DB_HOST`. El `PORT` es el puerto en el que se ejecutará la aplicación web.

## Ejecución de la Aplicación

1.  **Instalar Dependencias:**
    Navegue a la raíz del proyecto en su terminal y ejecute:
    ```bash
    npm install
    ```

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

## Módulos/Funcionalidades Disponibles (Alto Nivel)

*   **Gestión de Pacientes:**
    *   Registro de nuevos pacientes (CRUD completo).
    *   Listado, visualización y edición de datos de pacientes.
*   **Gestión de Admisiones:**
    *   Creación de admisiones vinculadas a pacientes.
    *   Visualización de detalles de admisión.
    *   Actualización del estado de la admisión (ej. Activa, Completada, Cancelada).
    *   Listado general de admisiones.
*   **Gestión de Infraestructura Hospitalaria:**
    *   **Alas:** CRUD completo.
    *   **Habitaciones:** CRUD completo, vinculadas a Alas.
    *   **Camas:** CRUD completo, vinculadas a Habitaciones.
*   **Asignación de Camas a Admisiones:**
    *   Visualización de camas disponibles.
    *   Asignación de una cama a una admisión activa.
    *   Liberación de una cama asignada.
*   **Evaluaciones de Enfermería:**
    *   Registro de evaluación inicial de enfermería para una admisión.
    *   Visualización de la evaluación.
    *   Edición de la evaluación existente.
*   **Evaluaciones Médicas:**
    *   Registro de evaluaciones médicas para una admisión (puede ser más de una).
    *   Visualización de evaluaciones médicas.
    *   Edición de evaluaciones médicas existentes.

## Localización

La aplicación, incluyendo comentarios en el código, identificadores (donde fue sensible y práctico), y la interfaz de usuario, está desarrollada y presentada en **Español de Latinoamérica**.

## Usuarios y Roles de Prueba (Pendiente)

Actualmente, el sistema no cuenta con un módulo de autenticación y roles de usuario. El acceso a las funcionalidades es directo. Esta característica está planificada para futuras versiones.

## Despliegue en Servidor de Internet (Pendiente)

La subida y configuración en un servidor de internet es responsabilidad del alumno como parte de las pautas de entrega del proyecto.
```
