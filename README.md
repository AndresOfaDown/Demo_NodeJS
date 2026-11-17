# 🔐 Demostración Práctica: Registro y Login en Node.js
### Materia: Tecnología Web (INF513) - UAGRM | Ing. Evans Balcázar

Este proyecto reproduce fielmente el diseño y la funcionalidad del sistema de **Registro y Login de Usuarios**, utilizando **Node.js** y **Express** como servidor backend asíncrono.

---

## 🚀 Características Principales

1. **Crear una Cuenta (`registro.html`):**
   * Formulario idéntico con campos: *Nombre, Apellido, Nombre de usuario, Correo electrónico, Teléfono y Contraseña*.
   * **Validación Asíncrona en Tiempo Real:** Mientras el usuario escribe, Node.js verifica en segundo plano si el nombre de usuario o el correo ya están registrados (`POST /api/validar`) y muestra:
     * `✅ usuario disponible`
     * `❌ Este usuario ya está en uso`
   * Al registrarse, los datos se guardan de forma asíncrona no bloqueante en `data/usuarios.json`.

2. **Iniciar Sesión (`login.html`):**
   * Formulario de autenticación (`POST /api/login`).
   * Valida credenciales contra `usuarios.json`.
   * Muestra mensaje de bienvenida personalizado al iniciar sesión sin recargar la página.

---

## ▶️ Cómo Ejecutar el Sistema

En tu terminal:
```bash
cd demo_nodejs
npm start
```
*(O en modo desarrollo con auto-recarga: `npm run dev`)*.

Abre tu navegador en:
👉 **`http://localhost:3000`** *(te llevará automáticamente a `registro.html`)*

O ingresa directamente a:
* **Registro:** `http://localhost:3000/registro.html`
* **Login:** `http://localhost:3000/login.html`

---

## 🔑 Usuarios de Prueba Ya Registrados
* Usuario: `ebalcazar` | Contraseña: `123`
* Usuario: `cfernandez` | Contraseña: `123`
