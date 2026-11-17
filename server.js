/**
 * ============================================================================
 * SERVIDOR CON FRAMEWORK (Node.js + Express)
 * Materia: Tecnología Web (INF513) - UAGRM
 * ============================================================================
 * Observa lo limpio y directo que es el código usando Express:
 * - El parseo de JSON se hace automáticamente con express.json().
 * - Servir archivos estáticos es una sola línea con express.static().
 * - El enrutamiento es declarativo y sencillo.
 */

const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// 1. Middlewares: Parsear JSON y servir la carpeta pública
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 2. Base de datos simulada de usuarios
const USUARIOS = [
    { usuario: 'admin', password: '123', nombre: 'Administrador UAGRM', rol: 'Docente' },
    { usuario: 'estudiante', password: '123', nombre: 'Carlos Fernández', rol: 'Estudiante' }
];

// 3. Endpoint de Login (POST /api/login)
app.post('/api/login', (req, res) => {
    const { usuario, password } = req.body;

    // Buscar si el usuario y contraseña coinciden
    const usuarioValido = USUARIOS.find(u => u.usuario === usuario && u.password === password);

    if (usuarioValido) { 
        return res.status(200).json({
            status: 'success',
            mensaje: `¡Bienvenido al sistema, ${usuarioValido.nombre}!`,
            usuario: {
                nombre: usuarioValido.nombre,
                usuario: usuarioValido.usuario,
                rol: usuarioValido.rol
            }
        });
    }

    // Si las credenciales no coinciden
    return res.status(401).json({
        status: 'error',
        mensaje: 'Usuario o contraseña incorrectos.'
    });
});

// 4. Iniciar el servidor
app.listen(PORT, () => {
    console.log('================================================');
    console.log(`🚀 SERVIDOR EXPRESS ACTIVO en http://localhost:${PORT}`);
    console.log('================================================');
});
