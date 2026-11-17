/**
 * ============================================================================
 * SERVIDOR NATIVO SIN FRAMEWORK (Node.js Puro con módulo 'http')
 * Materia: Tecnología Web (INF513) - UAGRM
 * ============================================================================
 * Este archivo demuestra cómo se programa un servidor en Node.js SIN usar Express.
 * Fíjate en la cantidad de código manual necesario para:
 * 1. Servir archivos estáticos (HTML, CSS, JS) leyendo disco y asignando MIME types.
 * 2. Recibir datos POST acumulando 'chunks' de memoria en buffers de red.
 * 3. Enrutamiento manual con if / switch.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001; // Corre en el puerto 3001 para poder comparar ambos

const USUARIOS = [
    { usuario: 'admin', password: '123', nombre: 'Administrador UAGRM', rol: 'Docente' },
    { usuario: 'estudiante', password: '123', nombre: 'Carlos Fernández', rol: 'Estudiante' }
];

const servidor = http.createServer((req, res) => {
    // --- 1. RUTA DE LOGIN (POST /api/login) MANUAL ---
    if (req.method === 'POST' && req.url === '/api/login') {
        let cuerpoPeticion = '';

        // En Node.js puro, los datos llegan en fragmentos (chunks) de buffer
        req.on('data', chunk => {
            cuerpoPeticion += chunk.toString();
        });

        // Cuando termina de recibir todos los fragmentos
        req.on('end', () => {
            try { 
                const { usuario, password } = JSON.parse(cuerpoPeticion);
                const usuarioValido = USUARIOS.find(u => u.usuario === usuario && u.password === password);

                if (usuarioValido) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        status: 'success',
                        mensaje: `¡Bienvenido, ${usuarioValido.nombre}! (Procesado por Node.js Nativo)`,
                        usuario: usuarioValido
                    }));
                } else {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        status: 'error',
                        mensaje: 'Credenciales inválidas (Node.js Nativo).'
                    }));
                }
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'error', mensaje: 'JSON malformado.' }));
            }
        });
        return;
    }

    // --- 2. SERVIR ARCHIVOS ESTÁTICOS MANUALMENTE ---
    let rutaArchivo = req.url === '/' ? '/index.html' : req.url;
    let rutaCompleta = path.join(__dirname, 'public', rutaArchivo);

    // Detección manual de tipos MIME
    const extension = path.extname(rutaCompleta);
    const tiposMime = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'text/javascript'
    };

    fs.readFile(rutaCompleta, (err, contenido) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Archivo no encontrado');
        } else {
            res.writeHead(200, { 'Content-Type': tiposMime[extension] || 'text/plain' });
            res.end(contenido);
        }
    });
});

servidor.listen(PORT, () => {
    console.log('================================================');
    console.log(`🐢 SERVIDOR NATIVO (SIN FRAMEWORK) en http://localhost:${PORT}`);
    console.log('================================================');
});
