# Bot de Notificaciones de WhatsApp (BuilderBot + Baileys)

Este proyecto es un bot de WhatsApp diseñado específicamente para funcionar como un **endpoint de envío de mensajes y notificaciones automáticas** desde aplicaciones externas. 

A diferencia de los bots de chat convencionales, **este bot no posee flujos de conversación interactiva con el cliente**, garantizando que se use únicamente para canales informativos y de alerta de tu sistema. El único flujo reactivo implementado es una prueba de estado del servidor.

---

## Características Principales

* 🚀 **Endpoint HTTP Seguro**: Expone una ruta `POST /v1/messages` para que tu aplicación envíe notificaciones (de texto o multimedia).
* 🔒 **Seguridad con API Key**: El endpoint de notificaciones está protegido mediante un token configurado por variable de entorno (`API_KEY`) para evitar envíos no autorizados.
* 📎 **Soporte Multimedia**: Permite adjuntar imágenes, PDFs, audios o videos en tus notificaciones pasando la URL directa del archivo.
* 🖥️ **Prueba de Estado**: Posee un único comando de WhatsApp (`test server`) que devuelve la fecha y hora actual del servidor en su zona horaria respectiva.
* 🐳 **Listo para Docker y Coolify**: Viene preconfigurado con un `Dockerfile` multi-etapa optimizado y un `docker-compose.yml` con volumen de persistencia para mantener la sesión de WhatsApp activa.

---

## Requisitos de Configuración (`.env`)

Crea un archivo `.env` en la raíz del proyecto basado en `.env.example`:

* `PORT`: Puerto en el que escucha el servidor HTTP (por defecto `3008`).
* `TZ`: Zona horaria del servidor (ej. `America/Caracas`, `Europe/Madrid`).
* `API_KEY`: Clave secreta que debes proveer en las cabeceras HTTP de tus peticiones (`x-api-key` o `Authorization: Bearer`).

---

## Cómo Ejecutar el Proyecto Localmente

1. **Instalar dependencias**:
   ```bash
   npm install
   ```
2. **Compilar el proyecto**:
   ```bash
   npm run build
   ```
3. **Iniciar el bot**:
   ```bash
   npm start
   ```
4. **Vincular WhatsApp**: Escanea el código QR que se imprimirá en la consola utilizando la función "Dispositivos Vinculados" en tu teléfono móvil.

---

## Despliegue en Coolify

Este repositorio está optimizado para su despliegue en un clic mediante **Coolify**:

1. Sube este código a tu repositorio de Git.
2. En Coolify, crea un nuevo recurso tipo **Application** y apunta a tu repositorio.
3. Configura el build para que use **Docker Compose**. Coolify detectará automáticamente el archivo `docker-compose.yml`.
4. En la configuración de variables de entorno de Coolify, establece `PORT`, `TZ` y tu `API_KEY` secreta.
5. Haz clic en **Deploy**.
6. Una vez desplegado, ve a la sección **Logs** de Coolify para escanear el código QR por única vez. Las sesiones quedarán guardadas en el volumen persistente mapeado.

---

## Ejemplos de Integración

Para ver ejemplos detallados sobre cómo enviar notificaciones desde tu aplicación usando **cURL**, **Node.js/JavaScript**, **PowerShell** y **Python**, consulta el archivo de guía creado en la raíz:

👉 **[ejemplo-peticion.md](file:///c:/Proyectos/BuilderBot/ejemplo-peticion.md)**