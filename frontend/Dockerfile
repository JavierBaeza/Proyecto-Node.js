# Etapa de compilación (Build stage)
FROM node:20-alpine AS build

WORKDIR /app

# Copiamos package.json y package-lock.json para cachear la instalación de dependencias
COPY package*.json ./

# Instalamos todas las dependencias
RUN npm install

# Copiamos todo el código fuente del frontend
COPY . .

# Construimos los archivos estáticos de producción (se guardarán en /app/dist)
RUN npm run build

# Etapa de servidor web (Production stage con Nginx)
FROM nginx:stable-alpine

# Copiamos los archivos compilados al directorio por defecto de Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copiamos la configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponemos el puerto de Nginx
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
