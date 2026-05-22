# Ejemplos de Envío de Notificaciones (POST /v1/messages)

Este documento contiene ejemplos prácticos de cómo realizar peticiones al bot de WhatsApp para enviar notificaciones desde diferentes tecnologías.

Asegúrate de reemplazar:
* `http://localhost:3008` por la URL pública o IP de tu servidor (ej. `https://tu-bot.dominio.com`).
* `test_api_key` por la clave API real configurada en tu variable de entorno `API_KEY`.
* `54911xxxxxxx` por el número de WhatsApp de destino (debe incluir código de país, sin el signo `+` ni espacios).

---

## Parámetros del JSON

* `number` (Obligatorio - String): El número de teléfono con el código de país, sin signos ni espacios.
* `message` (Obligatorio - String): El texto que deseas enviar (o el pie de foto si envías multimedia).
* `mediaUrl` o `urlMedia` (Opcional - String): URL directa de internet a un archivo de imagen (JPG/PNG), documento (PDF), audio (MP3) o video (MP4) que deseas adjuntar al mensaje.

---

## 1. cURL (Línea de comandos)

### Ejemplo de Solo Texto
```bash
curl -X POST http://localhost:3008/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: test_api_key" \
  -d '{
    "number": "54911xxxxxxx",
    "message": "Hola, esto es una notificación automática desde la aplicación."
  }'
```

### Ejemplo con Archivo Adjunto (Imagen/PDF)
```bash
curl -X POST http://localhost:3008/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: test_api_key" \
  -d '{
    "number": "54911xxxxxxx",
    "message": "Hola! Adjunto el PDF de la factura solicitada.",
    "mediaUrl": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
  }'
```

---

## 2. JavaScript / Node.js (Fetch API)

```javascript
const sendNotification = async (number, message, mediaUrl = null) => {
    try {
        const payload = { number, message };
        if (mediaUrl) {
            payload.mediaUrl = mediaUrl; // O también 'urlMedia': mediaUrl
        }

        const response = await fetch('http://localhost:3008/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': 'test_api_key' // O usar 'Authorization': 'Bearer test_api_key'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log('Respuesta:', data);
    } catch (error) {
        console.error('Error al enviar la notificación:', error);
    }
};

// Ejemplo: Enviar con una imagen adjunta
sendNotification('54911xxxxxxx', 'Mira esta imagen:', 'https://example.com/imagen.jpg');
```

---

## 3. PowerShell (Windows)

```powershell
$headers = @{
    "x-api-key" = "test_api_key"
}

# Ejemplo con PDF adjunto
$body = @{
    number = "54911xxxxxxx"
    message = "Hola, adjunto el documento."
    mediaUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3008/v1/messages" -Method Post -Headers $headers -Body $body -ContentType "application/json"
$response
```

---

## 4. Python

```python
import requests

url = "http://localhost:3008/v1/messages"
headers = {
    "x-api-key": "test_api_key",
    "Content-Type": "application/json"
}

# Ejemplo con imagen adjunta
payload = {
    "number": "54911xxxxxxx",
    "message": "Hola, adjunto la imagen.",
    "mediaUrl": "https://example.com/imagen.jpg"
}

response = requests.post(url, json=payload, headers=headers)
print(response.status_code)
print(response.json())
```
