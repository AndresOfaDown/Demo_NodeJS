-- ========================================================
-- SCRIPT DE BASE DE DATOS POSTGRESQL (nodeJsDB)
-- Materia: Tecnología Web (INF513) - UAGRM | Ing. Evans Balcázar
-- ========================================================

-- 1. Crear la base de datos (Ejecutar en postgres o pgAdmin)
CREATE DATABASE "nodeJsDB";

-- 2. Conectarse a la base de datos "nodeJsDB" y ejecutar la tabla:
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

-- 3. Insertar usuarios de prueba iniciales
INSERT INTO usuarios (nombre, apellido, usuario, email, telefono, password, rol) 
VALUES 
    ('Evans', 'Balcázar', 'ebalcazar', 'ebalcazar@uagrm.edu.bo', '70012345', '123', 'Docente'),
    ('Carlos', 'Fernández', 'cfernandez', 'carlos.f@uagrm.edu.bo', '78098765', '123', 'Estudiante')
ON CONFLICT (usuario) DO NOTHING;

-- 4. Verificar datos
SELECT * FROM usuarios;
