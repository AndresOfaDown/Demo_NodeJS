/**
 * ============================================================================
 * CONEXIÓN A POSTGRESQL (node-postgres / Pool)
 * Materia: Tecnología Web (INF513) - UAGRM | Ing. Evans Balcázar
 * ============================================================================
 */

const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'nodeJsDB',
    password: '61333148',
    port: 5432,
});

// Función para inicializar la tabla automáticamente si no existe
async function inicializarBD() {
    const queryTabla = `
        CREATE TABLE IF NOT EXISTS usuarios (
            id SERIAL PRIMARY KEY,
            nombre VARCHAR(100) NOT NULL,
            apellido VARCHAR(100) NOT NULL,
            usuario VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            telefono VARCHAR(20),
            password VARCHAR(255) NOT NULL,
            rol VARCHAR(50) DEFAULT 'Estudiante',
            creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    try {
        await pool.query(queryTabla);
        console.log('✅ Conexión exitosa a PostgreSQL (Base de datos: nodeJsDB)');
        console.log('✅ Tabla "usuarios" lista para almacenar registros.');
    } catch (error) {
        console.error('⚠️ Aviso de PostgreSQL:', error.message);
        console.log('👉 Asegúrate de haber creado la base de datos "nodeJsDB" en PostgreSQL.');
    }
}

inicializarBD();

module.exports = pool;
