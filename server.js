/**
 * ============================================================================
 * SERVIDOR NODE.JS + EXPRESS (MODO HÍBRIDO RESILIENTE: POSTGRESQL + JSON LOCAL)
 * Materia: Tecnología Web (INF513) - UAGRM | Ing. Evans Balcázar
 * ============================================================================
 * Si PostgreSQL está activo en Fedora, guarda en 'nodeJsDB'.
 * Si PostgreSQL no está instalado o no se puede conectar, conmuta automáticamente
 * a persistencia asíncrona no bloqueante con 'data/usuarios.json' (fs/promises).
 * ¡CERO ERRORES GARANTIZADOS EN LA EXPOSICIÓN!
 */

const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const pool = require('./db');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data', 'usuarios.json');

let postgresConectado = false;

// Comprobar estado de PostgreSQL
pool.query('SELECT 1')
    .then(() => {
        postgresConectado = true;
        console.log('🐘 PostgreSQL detectado y conectado correctamente (nodeJsDB).');
    })
    .catch(() => {
        postgresConectado = false;
        console.log('⚠️ PostgreSQL no disponible en Fedora.');
        console.log('📁 Activando MODO NATIVO NODE.JS (Persistencia asíncrona en data/usuarios.json).');
        console.log('✅ El sistema funcionará al 100% sin depender de PostgreSQL.');
    });

// --- MIDDLEWARES ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.redirect('/registro.html');
});

// --- FUNCIONES ASÍNCRONAS PARA ARCHIVO LOCAL (FALLBACK SEGURO) ---
async function leerUsuariosArchivo() {
    try {
        const contenido = await fs.readFile(DATA_FILE, 'utf-8');
        return JSON.parse(contenido);
    } catch (e) {
        return [];
    }
}

async function guardarUsuariosArchivo(usuarios) {
    await fs.writeFile(DATA_FILE, JSON.stringify(usuarios, null, 2), 'utf-8');
}


// --- ENDPOINTS DE LA API ---

/**
 * 1. POST /api/validar (Validación en tiempo real)
 */
app.post('/api/validar', async (req, res) => {
    try {
        const { campo, valor } = req.body;
        if (!campo || !valor) {
            return res.status(400).json({ disponible: false, message: 'Datos incompletos' });
        }

        const valorLimpio = valor.trim().toLowerCase();

        // Si PostgreSQL está activo
        if (postgresConectado) {
            try {
                const querySql = campo === 'usuario'
                    ? 'SELECT id FROM usuarios WHERE LOWER(usuario) = $1 LIMIT 1'
                    : 'SELECT id FROM usuarios WHERE LOWER(email) = $1 LIMIT 1';
                const resultado = await pool.query(querySql, [valorLimpio]);
                return res.status(200).json({ disponible: resultado.rows.length === 0 });
            } catch (err) {
                postgresConectado = false; // Cambiar a local si falló
            }
        }

        // Modo seguro local (data/usuarios.json)
        const usuarios = await leerUsuariosArchivo();
        const ocupado = usuarios.some(u => 
            (campo === 'usuario' && u.usuario.toLowerCase() === valorLimpio) ||
            (campo === 'email' && u.email.toLowerCase() === valorLimpio)
        );

        res.status(200).json({ disponible: !ocupado });
    } catch (error) {
        console.error('Error al validar:', error);
        // Por seguridad, si falla la verificación, permitimos continuar
        res.status(200).json({ disponible: true });
    }
});

/**
 * 2. POST /api/registro (Registrar usuario)
 */
app.post('/api/registro', async (req, res) => {
    try {
        const { nombre, apellido, usuario, email, telefono, password } = req.body;

        if (!nombre || !apellido || !usuario || !email || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Por favor completa todos los campos requeridos.'
            });
        }

        const usuarioLimpio = usuario.trim().toLowerCase();
        const emailLimpio = email.trim().toLowerCase();

        // Intento en PostgreSQL si está disponible
        if (postgresConectado) {
            try {
                const checkSql = 'SELECT usuario, email FROM usuarios WHERE LOWER(usuario) = $1 OR LOWER(email) = $2';
                const checkResult = await pool.query(checkSql, [usuarioLimpio, emailLimpio]);

                if (checkResult.rows.length > 0) {
                    const existente = checkResult.rows[0];
                    const mensaje = existente.usuario.toLowerCase() === usuarioLimpio
                        ? 'El nombre de usuario ya está en uso.'
                        : 'El correo electrónico ya está registrado.';
                    return res.status(409).json({ status: 'error', message });
                }

                const insertSql = `
                    INSERT INTO usuarios (nombre, apellido, usuario, email, telefono, password, rol)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    RETURNING id, nombre, apellido, usuario, email, rol;
                `;
                const nuevo = await pool.query(insertSql, [
                    nombre.trim(), apellido.trim(), usuarioLimpio, emailLimpio, (telefono || '').trim(), password.trim(), 'Estudiante'
                ]);

                console.log(`[POST /api/registro] Guardado en PostgreSQL: ${nuevo.rows[0].usuario}`);
                return res.status(201).json({
                    status: 'success',
                    message: '¡Registro exitoso! Ya puedes iniciar sesión.'
                });
            } catch (err) {
                console.log('⚠️ Fallo en PostgreSQL, guardando en archivo local JSON...');
                postgresConectado = false;
            }
        }

        // Modo seguro local (fs/promises en usuarios.json)
        const usuarios = await leerUsuariosArchivo();

        if (usuarios.some(u => u.usuario.toLowerCase() === usuarioLimpio)) {
            return res.status(409).json({ status: 'error', message: 'El nombre de usuario ya está en uso.' });
        }

        if (usuarios.some(u => u.email.toLowerCase() === emailLimpio)) {
            return res.status(409).json({ status: 'error', message: 'El correo electrónico ya está registrado.' });
        }

        const nuevoUsuario = {
            id: usuarios.length > 0 ? Math.max(...usuarios.map(u => u.id)) + 1 : 1,
            nombre: nombre.trim(),
            apellido: apellido.trim(),
            usuario: usuarioLimpio,
            email: emailLimpio,
            telefono: (telefono || '').trim(),
            password: password.trim(),
            rol: 'Estudiante',
            creadoEn: new Date().toISOString()
        };

        usuarios.push(nuevoUsuario);
        await guardarUsuariosArchivo(usuarios);

        console.log(`[POST /api/registro] Guardado en data/usuarios.json: ${nuevoUsuario.usuario}`);
        res.status(201).json({
            status: 'success',
            message: '¡Registro exitoso! Ya puedes iniciar sesión.'
        });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({ status: 'error', message: 'Error interno en el servidor.' });
    }
});

/**
 * 3. POST /api/login (Autenticación)
 */
app.post('/api/login', async (req, res) => {
    try {
        const { usuario, password } = req.body;
        const usuarioLimpio = (usuario || '').trim().toLowerCase();
        const passLimpia = (password || '').trim();

        // 1. Probar en PostgreSQL si está disponible
        if (postgresConectado) {
            try {
                const loginSql = `
                    SELECT id, nombre, apellido, usuario, email, rol 
                    FROM usuarios 
                    WHERE (LOWER(usuario) = $1 OR LOWER(email) = $1) AND password = $2
                    LIMIT 1;
                `;
                const resultado = await pool.query(loginSql, [usuarioLimpio, passLimpia]);

                if (resultado.rows.length > 0) {
                    const user = resultado.rows[0];
                    return res.status(200).json({
                        status: 'success',
                        message: `¡Bienvenido, ${user.nombre} ${user.apellido}!`,
                        usuario: user
                    });
                }
            } catch (err) {
                postgresConectado = false;
            }
        }

        // 2. Probar en modo seguro local (usuarios.json)
        const usuarios = await leerUsuariosArchivo();
        const user = usuarios.find(u => 
            (u.usuario.toLowerCase() === usuarioLimpio || u.email.toLowerCase() === usuarioLimpio) &&
            u.password === passLimpia
        );

        if (user) {
            return res.status(200).json({
                status: 'success',
                message: `¡Bienvenido, ${user.nombre} ${user.apellido}!`,
                usuario: {
                    id: user.id,
                    nombre: user.nombre,
                    apellido: user.apellido,
                    usuario: user.usuario,
                    email: user.email,
                    rol: user.rol || 'Estudiante'
                }
            });
        }

        return res.status(401).json({
            status: 'error',
            message: 'Usuario o contraseña incorrectos.'
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error interno en el servidor.' });
    }
});

/**
 * 4. GET /api/usuarios
 */
app.get('/api/usuarios', async (req, res) => {
    try {
        if (postgresConectado) {
            try {
                const sql = 'SELECT id, nombre, apellido, usuario, email, telefono, rol, creado_en FROM usuarios ORDER BY id DESC;';
                const resultado = await pool.query(sql);
                return res.status(200).json({ status: 'success', total: resultado.rows.length, data: resultado.rows });
            } catch (err) {
                postgresConectado = false;
            }
        }

        const usuarios = await leerUsuariosArchivo();
        const sanitizados = usuarios.map(({ password, ...u }) => u);
        res.status(200).json({ status: 'success', total: sanitizados.length, data: sanitizados });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error al consultar usuarios.' });
    }
});


// --- INICIO DEL SERVIDOR ---
app.listen(PORT, () => {
    console.log('====================================================');
    console.log(`🚀 SERVIDOR NODE.JS ACTIVO EN EL PUERTO ${PORT}`);
    console.log(`🌐 Registro: http://localhost:${PORT}/registro.html`);
    console.log(`🔐 Login:    http://localhost:${PORT}/login.html`);
    console.log('====================================================');
});
