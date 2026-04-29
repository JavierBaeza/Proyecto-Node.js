# Usamos la imagen oficial de Node.js en su versión LTS sobre Alpine Linux.
# Alpine es una distribución mínima que reduce el tamaño final de la imagen.

# Etapa base: imagen oficial Node 20 LTS con Alpine
FROM node:20-alpine

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos primero solo los archivos de dependencias.
# Docker cachea cada capa: si package.json no cambia, no reinstala dependencias.
COPY package*.json ./

# Instalamos solo dependencias de producción (sin nodemon ni otras devDependencies)
RUN npm install --omit=dev

# Copiamos el resto del código fuente
COPY . .

# Puerto que expone la aplicación (debe coincidir con PORT en .env)
EXPOSE 3000

# Comando de arranque en producción
CMD ["node", "src/app.js"]