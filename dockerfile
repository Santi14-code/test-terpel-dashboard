FROM node:20-alpine

WORKDIR /app

# Copiar todo primero
COPY . .

# Instalar dependencias
RUN npm ci

# Generar Prisma
RUN npx prisma generate

# Build de Next
RUN npm run build

EXPOSE 8080

ENV NODE_ENV=production

CMD ["npm", "start"]
