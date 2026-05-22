import 'dotenv/config'
import { createBot, createProvider, createFlow, addKeyword } from '@builderbot/bot'
import { MemoryDB as Database } from '@builderbot/bot'
import { BaileysProvider as Provider } from '@builderbot/provider-baileys'
import pkg from 'body-parser'

const { json } = pkg

const PORT = process.env.PORT ?? 3008

/**
 * Flow: test server
 * Responds with the current date, time, and timezone of the server.
 */
const testServerFlow = addKeyword<Provider, Database>(['test server', 'test-server'])
    .addAction(async (ctx, { flowDynamic }) => {
        const timezone = process.env.TZ || 'UTC'
        try {
            const serverTime = new Date().toLocaleString('es-ES', { timeZone: timezone })
            await flowDynamic(`🖥️ *Estado del Servidor*:\n📅 Fecha y hora: ${serverTime}\n🌍 Zona horaria: ${timezone}`)
        } catch (error) {
            console.error('Error al obtener la fecha/hora en la zona horaria especificada:', error)
            const serverTimeFallback = new Date().toLocaleString('es-ES')
            await flowDynamic(`🖥️ *Estado del Servidor*:\n📅 Fecha y hora: ${serverTimeFallback}\n⚠️ (Error al aplicar la zona horaria ${timezone})`)
        }
    })

const main = async () => {
    const adapterFlow = createFlow([testServerFlow])
    
    // Configuración del proveedor Baileys con una versión específica de WhatsApp Web para estabilidad
    const adapterProvider = createProvider(Provider, {
        version: [2, 3000, 1035824857]
    })
    const adapterDB = new Database()

    const { handleCtx, httpServer } = await createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    // Añadir middleware de body-parser para interpretar JSON en Polka
    adapterProvider.server.use(json())

    /**
     * Endpoint POST: /v1/messages
     * Recibe notificaciones y las envía a través de WhatsApp.
     * Cabecera requerida: x-api-key o Authorization: Bearer
     */
    adapterProvider.server.post(
        '/v1/messages',
        handleCtx(async (bot, req, res) => {
            try {
                // Validación de API Key
                const authHeader = req.headers['authorization']
                const apiKeyHeader = req.headers['x-api-key']
                let clientApiKey = ''

                if (apiKeyHeader) {
                    clientApiKey = String(apiKeyHeader)
                } else if (authHeader && authHeader.startsWith('Bearer ')) {
                    clientApiKey = authHeader.substring(7)
                }

                const expectedApiKey = process.env.API_KEY
                if (expectedApiKey && clientApiKey !== expectedApiKey) {
                    res.writeHead(401, { 'Content-Type': 'application/json' })
                    return res.end(JSON.stringify({ error: 'Unauthorized: Invalid API Key' }))
                }

                // Validación de entrada
                const { number, message, mediaUrl, urlMedia } = req.body
                if (!number || !message) {
                    res.writeHead(400, { 'Content-Type': 'application/json' })
                    return res.end(JSON.stringify({ error: 'Bad Request: "number" and "message" are required' }))
                }

                // Limpieza del número de teléfono (quitar espacios, signos +, etc.)
                const cleanNumber = String(number).replace(/[\s+]/g, '')
                if (!/^\d+$/.test(cleanNumber)) {
                    res.writeHead(400, { 'Content-Type': 'application/json' })
                    return res.end(JSON.stringify({ error: 'Bad Request: "number" must contain only digits (excluding country prefix symbols like +)' }))
                }

                // Obtener url de multimedia si se proporciona
                const finalMediaUrl = mediaUrl || urlMedia || null

                // Enviar mensaje
                await bot.sendMessage(cleanNumber, message, { media: finalMediaUrl })
                
                res.writeHead(200, { 'Content-Type': 'application/json' })
                return res.end(JSON.stringify({ status: 'success', message: 'Message sent', recipient: cleanNumber }))
            } catch (error: any) {
                console.error('Error sending message endpoint:', error)
                res.writeHead(500, { 'Content-Type': 'application/json' })
                return res.end(JSON.stringify({ error: 'Internal Server Error', details: error.message }))
            }
        })
    )

    // Iniciar servidor HTTP
    httpServer(+PORT)
    console.log(`Server HTTP listo en el puerto: ${PORT}`)
}

main()
