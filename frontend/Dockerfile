# Usa la imagen oficial de Node.js LTS en Alpine Linux
FROM node:20-alpine

# Directorio de trabajo en el contenedor
WORKDIR /app

# Copia los archivos de dependencias
COPY package*.json ./

# Instala todas las dependencias
RUN npm install

# Copia el resto del código del frontend
COPY . .

# Expone el puerto por defecto de Vite
EXPOSE 5173

# Arranca el servidor de desarrollo de Vite con soporte para host externo
CMD ["npm", "run", "dev", "--", "--host"]
