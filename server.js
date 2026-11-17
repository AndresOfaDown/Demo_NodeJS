/**
 * ============================================================================
 * SERVIDOR NODE.JS + EXPRESS CON CONEXIÓN A POSTGRESQL (node-postgres)
 * Materia: Tecnología Web (INF513) - UAGRM | Ing. Evans Balcázar
 * Base de Datos: nodeJsDB
 * ============================================================================
 */

const express = require('express');
const path = require('path');
const pool = require('./db');

const app = express();
const PORT = 3000;

// --- MIDDLEWARES ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Redirigir la raíz a la pantalla de registro
app.get('/', (req, res) => {
    res.redirect('/registro.html');
});


// --- ENDPOINTS DE LA API REST (CON POSTGRESQL) ---

/**
 * 1. POST /api/validar
 * Validación en tiempo real con PostgreSQL: comprueba si usuario o email ya existen
 */
app.post('/api/validar', async (req, res) => {
    try {
        const { campo, valor } = req.body;
        if (!campo || !valor) {
            return res.status(400).json({ disponible: false, message: 'Datos incompletos' });
        }

        const valorLimpio = valor.trim().toLowerCase();
        let querySql = '';

        if (campo === 'usuario') {
            querySql = 'SELECT id FROM usuarios WHERE LOWER(usuario) = $1 LIMIT 1';
        } else if (campo === 'email') {
            querySql = 'SELECT id FROM usuarios WHERE LOWER(email) = $1 LIMIT 1';
        } else {
            return res.status(400).json({ disponible: false, message: 'Campo inválido' });
        }

        const resultado = await pool.query(querySql, [valorLimpio]);
        const disponible = resultado.rows.length === 0;

        res.status(200).json({ disponible });
    } catch (error) {
        console.error('Error al validar en PostgreSQL:', error.message);
        res.status(500).json({ disponible: false, message: 'Error de conexión con la base de datos' });
    }
});

/**
 * 2. POST /api/registro
 * Registrar un nuevo usuario en la tabla 'usuarios' de PostgreSQL
 */
app.post('/api/registro', async (req, res) => {
    try {
        const { nombre, apellido, usuario, email, telefono, password } = req.body;

        // Validación de campos obligatorios
        if (!nombre || !apellido || !usuario || !email || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Por favor completa todos los campos requeridos.'
            });
        }

        const usuarioLimpio = usuario.trim().toLowerCase();
        const emailLimpio = email.trim().toLowerCase();

        // 1. Verificar si ya existe usuario o email
        const checkSql = 'SELECT usuario, email FROM usuarios WHERE LOWER(usuario) = $1 OR LOWER(email) = $2';
        const checkResult = await pool.query(checkSql, [usuarioLimpio, emailLimpio]);

        if (checkResult.rows.length > 0) {
            const existente = checkResult.rows[0];
            const mensaje = existente.usuario.toLowerCase() === usuarioLimpio
                ? 'El nombre de usuario ya está registrado en la base de datos.'
                : 'El correo electrónico ya se encuentra registrado.';
            return res.status(409).json({ status: 'error', message });
        }

        // 2. Insertar nuevo usuario con consulta parametrizada ($1, $2, ...)
        const insertSql = `
            INSERT INTO usuarios (nombre, apellido, usuario, email, telefono, password, rol)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, nombre, apellido, usuario, email, rol;
        `;

        const nuevo = await pool.query(insertSql, [
            nombre.trim(),
            apellido.trim(),
            usuarioLimpio,
            emailLimpio,
            (telefono || '').trim(),
            password.trim(),
            'Estudiante'
        ]);

        console.log(`[POST /api/registro] Usuario guardado en PostgreSQL: ${nuevo.rows[0].usuario}`);

        res.status(201).json({
            status: 'success',
            message: '¡Registro exitoso en PostgreSQL! Ya puedes iniciar sesión.',
            usuario: nuevo.rows[0]
        });
    } catch (error) {
        console.error('Error al registrar en PostgreSQL:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error en el servidor o base de datos al registrar el usuario.'
        });
    }
});

/**
 * 3. POST /api/login
 * Autenticar credenciales contra la base de datos PostgreSQL
 */
app.post('/api/login', async (req, res) => {
    try {
        const { usuario, password } = req.body;
        const usuarioLimpio = (usuario || '').trim().toLowerCase();
        const passLimpia = (password || '').trim();

        const loginSql = `
            SELECT id, nombre, apellido, usuario, email, rol 
            FROM usuarios 
            WHERE (LOWER(usuario) = $1 OR LOWER(email) = $1) AND password = $2
            LIMIT 1;
        `;

        const resultado = await pool.query(loginSql, [usuarioLimpio, passLimpia]);

        if (resultado.rows.length > 0) {
            const user = resultado.rows[0];
            console.log(`[POST /api/login] Inicio de sesión exitoso en PostgreSQL: ${user.usuario}`);
            return res.status(200).json({
                status: 'success',
                message: `¡Bienvenido, ${user.nombre} ${user.apellido}!`,
                usuario: user
            });
        }

        return res.status(401).json({
            status: 'error',
            message: 'Usuario o contraseña incorrectos en la base de datos.'
        });
    } catch (error) {
        console.error('Error en login contra PostgreSQL:', error.message);
        res.status(500).json({ status: 'error', message: 'Error de conexión con PostgreSQL.' });
    }
});

/**
 * 4. GET /api/usuarios
 * Consultar todos los usuarios desde PostgreSQL (útil para pruebas)
 */
app.get('/api/usuarios', async (req, res) => {
    try {
        const sql = 'SELECT id, nombre, apellido, usuario, email, telefono, rol, creado_en FROM usuarios ORDER BY id DESC;';
        const resultado = await pool.query(sql);
        res.status(200).json({ status: 'success', total: resultado.rows.length, data: resultado.rows });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error al consultar la tabla usuarios en PostgreSQL.' });
    }
});


// --- INICIO DEL SERVIDOR ---
app.listen(PORT, () => {
    console.log('====================================================');
    console.log(`🚀 SERVIDOR NODE.JS ACTIVO EN EL PUERTO ${PORT}`);
    console.log(`🐘 CONECTADO A BASE DE DATOS: nodeJsDB (PostgreSQL)`);
    console.log(`🌐 Registro: http://localhost:${PORT}/registro.html`);
    console.log(`🔐 Login:    http://localhost:${PORT}/login.html`);
    console.log('====================================================');
});
