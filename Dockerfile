# Etapa 1: Construcción
FROM node:20-alpine AS builder

# Declarar build-args inyectados por Coolify para evitar advertencias y fallos
ARG COOLIFY_FQDN
ARG QR_PATH
ARG TZ
ARG API_KEY

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias optimizando uso de memoria y rendimiento
RUN npm ci --no-audit --no-fund

# Copiar todo el código fuente
COPY . .

# Compilar TypeScript a JavaScript
RUN npm run build

# Eliminar dependencias de desarrollo para reducir el tamaño final de node_modules
RUN npm prune --production

# Etapa 2: Despliegue en Producción
FROM node:20-alpine AS deploy

WORKDIR /app

# Configuración de variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3008

# Exponer el puerto del bot
EXPOSE 3008

# Copiar artefactos de compilación y dependencias de producción
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/assets ./assets

# Crear el directorio para almacenar las sesiones de WhatsApp
RUN mkdir -p /app/bot_sessions

# Comando para ejecutar la aplicación
CMD ["npm", "start"]