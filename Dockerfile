FROM node:20-alpine

WORKDIR /app

COPY . .

RUN npm ci

RUN npx prisma generate

RUN npm run build

EXPOSE 8080

ENV NODE_ENV=production

CMD ["npm", "start"]
