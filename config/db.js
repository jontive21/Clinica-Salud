require('dotenv').config(); // Carga las variables de entorno desde el archivo .env

const mysql = require('mysql2/promise'); // Importa la librería mysql2 con soporte para Promesas

// Crea un pool de conexiones a la base de datos MySQL
const pool = mysql.createPool({
    host: process.env.DB_HOST,         // Host de la base de datos (desde variables de entorno)
    user: process.env.DB_USER,         // Usuario de la base de datos (desde variables de entorno)
    password: process.env.DB_PASSWORD, // Contraseña de la base de datos (desde variables de entorno)
    database: process.env.DB_NAME,     // Nombre de la base de datos (desde variables de entorno)
    waitForConnections: true,          // Esperar por conexiones disponibles si el pool está lleno
    connectionLimit: 10                // Límite máximo de conexiones en el pool
});

module.exports = pool; // Exporta el pool de conexiones para ser utilizado en otros módulos