/**
 * ============================================================================
 * CLIENTE JAVASCRIPT (Fetch API asíncrono)
 * ============================================================================
 */

const formLogin = document.getElementById('formLogin');
const mensajeError = document.getElementById('mensajeError');
const cardLogin = document.getElementById('cardLogin');
const cardBienvenida = document.getElementById('cardBienvenida');
const txtNombreUsuario = document.getElementById('txtNombreUsuario');
const txtRolUsuario = document.getElementById('txtRolUsuario');
const btnCerrarSesion = document.getElementById('btnCerrarSesion');

// Procesar el envío del formulario mediante Fetch API (AJAX asíncrono)
formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Limpiar mensaje anterior
    mensajeError.classList.remove('show');
    mensajeError.textContent = '';

    const usuario = document.getElementById('usuario').value.trim();
    const password = document.getElementById('password').value.trim();

    try {
        // Enviar credenciales en JSON hacia Node.js
        const respuesta = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ usuario, password })
        });

        const resultado = await respuesta.json();

        if (respuesta.ok && resultado.status === 'success') {
            // Login exitoso: ocultar formulario y mostrar bienvenida
            txtNombreUsuario.textContent = `¡Hola, ${resultado.usuario.nombre}!`;
            txtRolUsuario.textContent = `Rol: ${resultado.usuario.rol} • Usuario: @${resultado.usuario.usuario}`;
            
            cardLogin.style.display = 'none';
            cardBienvenida.style.display = 'block';
        } else {
            // Mostrar error devuelto por Node.js
            mensajeError.textContent = resultado.mensaje || 'Credenciales incorrectas.';
            mensajeError.classList.add('show');
        }
    } catch (error) {
        console.error('Error al conectar con el servidor:', error);
        mensajeError.textContent = 'No se pudo conectar con el servidor Node.js.';
        mensajeError.classList.add('show');
    }
});

// Cerrar sesión
btnCerrarSesion.addEventListener('click', () => {
    formLogin.reset();
    cardBienvenida.style.display = 'none';
    cardLogin.style.display = 'block';
});
