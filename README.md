# 🔐 Demostración Práctica: Login en Node.js (Nativo vs. Express)
### Materia: Tecnología Web (INF513) - UAGRM | Ing. Evans Balcázar

Este proyecto es una demostración **simple y concisa** de un sistema de **Inicio de Sesión (Login)** con Node.js, diseñada específicamente para responder a la pregunta del docente:
> *"¿Para qué usamos un framework como Express si Node.js ya tiene su propio servidor web?"*

---

## 📁 Archivos del Proyecto

* **`server.js` (Con Framework - Express):**  
  Implementa el servidor y la API de login en solo **~30 líneas de código**. Muestra cómo Express simplifica el parseo de JSON y el enrutamiento.
* **`servidor_nativo.js` (Sin Framework - Node.js Puro):**  
  El mismo sistema pero hecho con el módulo `http` nativo de Node.js. Muestra cómo toca recibir los datos en *chunks de buffer* y servir los archivos HTML/CSS manualmente.
* **`public/` (Frontend):**  
  Página web simple (`index.html`, `styles.css`, `app.js`) que envía las credenciales mediante la `Fetch API` en segundo plano.

---

## ▶️ 1. Cómo Ejecutar el Sistema

Abre tu terminal en la carpeta `demo_nodejs`:

### Opción A: Servidor con Express (Recomendado)
```bash
npm start
```
Abre tu navegador en: 👉 **`http://localhost:3000`**

### Opción B: Servidor Nativo (Sin Framework)
```bash
npm run nativo
```
Abre tu navegador en: 👉 **`http://localhost:3001`**

---

## 🔑 Credenciales de Prueba

* **Usuario:** `admin` | **Contraseña:** `123`
* **Usuario:** `estudiante` | **Contraseña:** `123`
*(Si ingresas cualquier otro dato, Node.js responderá con un error 401 en JSON).*

---

## 💡 El Punto Fuerte para tu Exposición

En tu exposición puedes abrir los dos archivos de código (`servidor_nativo.js` y `server.js`) uno al lado del otro y explicar:

1. **En Node.js Nativo (Sin Express):**
   * Tuvimos que escuchar eventos `req.on('data')` y `req.on('end')` para juntar los fragmentos de memoria.
   * Tuvimos que leer los archivos HTML y CSS con `fs.readFile` y escribir las cabeceras HTTP (`Content-Type`) a mano.
2. **En Node.js con Express:**
   * El parseo de JSON se hace en 1 línea: `app.use(express.json())`.
   * Servir la web se hace en 1 línea: `app.use(express.static('public'))`.
   * El código es un 60% más corto, más legible y mantenible.
