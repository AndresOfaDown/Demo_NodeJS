/**
 * ============================================================================
 * LÓGICA DEL CLIENTE (Fetch API Asíncrono)
 * Materia: Tecnología Web (INF513) - UAGRM | Ing. Evans Balcázar
 * ============================================================================
 */

// ==========================================
// 1. REGISTRO DE USUARIO (registro.html)
// ==========================================
const formRegistro = document.getElementById('formRegistro');
const inputUsuario = document.getElementById('inputUsuario');
const inputEmail = document.getElementById('inputEmail');
const mensajeRegistro = document.getElementById('mensajeRegistro');

if (formRegistro) {
    // A. Validación en tiempo real al escribir en los inputs (Eventos input)
    inputUsuario.addEventListener('input', () => {
        verificarDisponibilidad('usuario', inputUsuario.value.trim(), 'feedbackUsuario');
    });

    inputEmail.addEventListener('input', () => {
        verificarDisponibilidad('email', inputEmail.value.trim(), 'feedbackEmail');
    });

    // B. Procesar el formulario de Registro
    formRegistro.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Ocultar mensaje previo
        mensajeRegistro.className = 'mensaje';
        mensajeRegistro.style.display = 'none';

        const datos = {
            nombre: document.getElementById('inputNombre').value.trim(),
            apellido: document.getElementById('inputApellido').value.trim(),
            usuario: inputUsuario.value.trim(),
            email: inputEmail.value.trim(),
            telefono: document.getElementById('inputTelefono').value.trim(),
            password: document.getElementById('inputPassword').value.trim()
        };

        try {
            const respuesta = await fetch('/api/registro', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datos)
            });

            const resultado = await respuesta.json();

            mensajeRegistro.textContent = resultado.message;
            mensajeRegistro.className = `mensaje ${resultado.status}`;
            mensajeRegistro.style.display = 'block';

            if (respuesta.ok && resultado.status === 'success') {
                formRegistro.reset();
                document.querySelectorAll('.feedback').forEach(f => {
                    f.textContent = '';
                    f.className = 'feedback';
                });

                // Redirigir a login después de 1.8 segundos
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1800);
            }
        } catch (error) {
            console.error('Error al registrar:', error);
            mensajeRegistro.textContent = 'Error de comunicación con el servidor Node.js.';
            mensajeRegistro.className = 'mensaje error';
            mensajeRegistro.style.display = 'block';
        }
    });
}

/**
 * Función asíncrona para verificar disponibilidad en tiempo real
 */
async function verificarDisponibilidad(campo, valor, idFeedback) {
    const feedback = document.getElementById(idFeedback);
    if (!feedback) return;

    if (valor === '') {
        feedback.textContent = '';
        feedback.className = 'feedback';
        return;
    }

    try {
        const respuesta = await fetch('/api/validar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ campo, valor })
        });

        const resultado = await respuesta.json();

        if (resultado.disponible) {
            feedback.textContent = `✅ ${campo === 'usuario' ? 'Nombre de usuario' : 'Correo'} disponible`;
            feedback.className = 'feedback valido';
        } else {
            feedback.textContent = `❌ Este ${campo === 'usuario' ? 'usuario' : 'correo'} ya está en uso`;
            feedback.className = 'feedback invalido';
        }
    } catch (error) {
        console.error('Error en validación en tiempo real:', error);
    }
}


// ==========================================
// 2. INICIO DE SESIÓN (login.html)
// ==========================================
const formLogin = document.getElementById('formLogin');
const mensajeLogin = document.getElementById('mensajeLogin');
const panelLogin = document.getElementById('panelLogin');
const panelBienvenida = document.getElementById('panelBienvenida');
const txtBienvenida = document.getElementById('txtBienvenida');
const txtSubtituloUsuario = document.getElementById('txtSubtituloUsuario');
const btnCerrarSesion = document.getElementById('btnCerrarSesion');

if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Limpiar mensaje
        mensajeLogin.className = 'mensaje';
        mensajeLogin.style.display = 'none';

        const usuario = document.getElementById('loginUsuario').value.trim();
        const password = document.getElementById('loginPassword').value.trim();

        try {
            const respuesta = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ usuario, password })
            });

            const resultado = await respuesta.json();

            if (respuesta.ok && resultado.status === 'success') {
                // Login correcto: Mostrar pantalla de bienvenida
                txtBienvenida.textContent = `¡Hola, ${resultado.usuario.nombre} ${resultado.usuario.apellido}!`;
                txtSubtituloUsuario.textContent = `Rol: ${resultado.usuario.rol} • Usuario: @${resultado.usuario.usuario} (${resultado.usuario.email})`;

                panelLogin.style.display = 'none';
                panelBienvenida.style.display = 'block';
            } else {
                // Error de credenciales
                mensajeLogin.textContent = resultado.message || 'Credenciales incorrectas.';
                mensajeLogin.className = 'mensaje error';
                mensajeLogin.style.display = 'block';
            }
        } catch (error) {
            console.error('Error en login:', error);
            mensajeLogin.textContent = 'Error al conectar con el servidor Node.js.';
            mensajeLogin.className = 'mensaje error';
            mensajeLogin.style.display = 'block';
        }
    });

    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener('click', () => {
            formLogin.reset();
            panelBienvenida.style.display = 'none';
            panelLogin.style.display = 'block';
        });
    }
}
