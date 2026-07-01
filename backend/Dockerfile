# Usamos la imagen oficial de Node.js en su versión LTS sobre Alpine Linux.
# Alpine es una distribución mínima que reduce el tamaño final de la imagen.

# Etapa base: imagen oficial Node 20 LTS con Alpine
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# Etapa de desarrollo: instala todas las dependencias (incluyendo nodemon)
FROM base AS development
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Etapa de producción: instala solo dependencias de producción
FROM base AS production
RUN npm install --omit=dev
COPY . .
EXPOSE 3000
CMD ["node", "src/app.js"]