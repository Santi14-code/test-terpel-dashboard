FROM node:20-alpine
# Ajusta según tu stack (node, python, go, etc.)

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

EXPOSE 8080
CMD ["npm", "start"]
