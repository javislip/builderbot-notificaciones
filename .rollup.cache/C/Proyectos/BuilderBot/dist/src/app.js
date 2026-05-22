import 'dotenv/config';
import { createBot, createProvider, createFlow, addKeyword } from '@builderbot/bot';
import { MemoryDB as Database } from '@builderbot/bot';
import { BaileysProvider as Provider } from '@builderbot/provider-baileys';
import pkg from 'body-parser';
const { json } = pkg;
const PORT = process.env.PORT ?? 3008;
const testServerFlow = addKeyword(['test server', 'test-server'])
    .addAction(async (ctx, { flowDynamic }) => {
    const timezone = process.env.TZ || 'UTC';
    try {
        const serverTime = new Date().toLocaleString('es-ES', { timeZone: timezone });
        await flowDynamic(`🖥️ *Estado del Servidor*:\n📅 Fecha y hora: ${serverTime}\n🌍 Zona horaria: ${timezone}`);
    }
    catch (error) {
        console.error('Error al obtener la fecha/hora en la zona horaria especificada:', error);
        const serverTimeFallback = new Date().toLocaleString('es-ES');
        await flowDynamic(`🖥️ *Estado del Servidor*:\n📅 Fecha y hora: ${serverTimeFallback}\n⚠️ (Error al aplicar la zona horaria ${timezone})`);
    }
});
const main = async () => {
    const adapterFlow = createFlow([testServerFlow]);
    const adapterProvider = createProvider(Provider, {
        version: [2, 3000, 1035824857]
    });
    const adapterDB = new Database();
    const { handleCtx, httpServer } = await createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    });
    adapterProvider.server.use(json());
    adapterProvider.server.post('/v1/messages', handleCtx(async (bot, req, res) => {
        try {
            const authHeader = req.headers['authorization'];
            const apiKeyHeader = req.headers['x-api-key'];
            let clientApiKey = '';
            if (apiKeyHeader) {
                clientApiKey = String(apiKeyHeader);
            }
            else if (authHeader && authHeader.startsWith('Bearer ')) {
                clientApiKey = authHeader.substring(7);
            }
            const expectedApiKey = process.env.API_KEY;
            if (expectedApiKey && clientApiKey !== expectedApiKey) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Unauthorized: Invalid API Key' }));
            }
            const { number, message, mediaUrl, urlMedia } = req.body;
            if (!number || !message) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Bad Request: "number" and "message" are required' }));
            }
            const cleanNumber = String(number).replace(/[\s+]/g, '');
            if (!/^\d+$/.test(cleanNumber)) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Bad Request: "number" must contain only digits (excluding country prefix symbols like +)' }));
            }
            const finalMediaUrl = mediaUrl || urlMedia || null;
            await bot.sendMessage(cleanNumber, message, { media: finalMediaUrl });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ status: 'success', message: 'Message sent', recipient: cleanNumber }));
        }
        catch (error) {
            console.error('Error sending message endpoint:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Internal Server Error', details: error.message }));
        }
    }));
    httpServer(+PORT);
    console.log(`Server HTTP listo en el puerto: ${PORT}`);
};
main();
