# CS2 Weapons Wiki API

API RESTful para una Wiki de armas de Counter-Strike 2, construida con **Node.js**, **Express.js** y **PostgreSQL**.

Proyecto desarrollado para la asignatura de Node.js.

---

## Tecnologías utilizadas

- **Node.js 20 LTS** — entorno de ejecución
- **Express.js 5** — framework web para definir rutas y middlewares
- **pg (node-postgres)** — cliente PostgreSQL para consultas SQL puras
- **dotenv** — gestión de variables de entorno
- **Docker & Docker Compose** — contenerización de la app y la base de datos
- **PostgreSQL 16** — motor de base de datos relacional

---

## Estructura del proyecto

```
Proyecto-Node.js/
├── docker/
│   └── init.sql                   # Script de inicialización automática de la BD
├── src/
│   ├── config/
│   │   └── db.js                  # Pool de conexiones a PostgreSQL
│   ├── controllers/
│   │   └── armasController.js     # Lógica SQL de cada endpoint
│   ├── middlewares/
│   │   └── validacion.js          # Validaciones centralizadas del body
│   ├── routes/
│   │   └── armas.js               # Definición de rutas (Router)
│   └── app.js                     # Servidor Express + manejador global de errores
├── .env                           # Variables de entorno (no subir a Git)
├── .env.example                   # Ejemplo de variables de entorno
├── .gitignore                     # Archivos ignorados por Git
├── docker-compose.yml             # Configuración de servicios Docker (App + BD)
├── Dockerfile                     # Instrucciones para construir la imagen Docker
├── ENDPOINTS.md                   # Documentación detallada de los endpoints
├── CS2_Wiki_API.postman_collection.json  # Colección Postman lista para importar
├── package-lock.json              # Árbol de versiones exactas de dependencias
└── package.json                   # Dependencias y scripts del proyecto
```

---

## Instalación y puesta en marcha

> **Requisitos previos:** tener instalados [Docker Desktop](https://www.docker.com/products/docker-desktop/) y [Git](https://git-scm.com/).  
> No es necesario instalar Node.js ni PostgreSQL de forma local.

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/Proyecto-Node.js.git
cd Proyecto-Node.js
```

### 2. Configurar variables de entorno

Copia el archivo de ejemplo y renómbralo a `.env`:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus valores. La estructura debe ser la siguiente:

```env
# Configuracion de PostgreSQL
PGUSER=tu_usuario
PGPASSWORD=tu_contraseña
PGDATABASE=cs2_wiki_db

# Configuracion de la App Node.js
# PGHOST debe ser "db" porque es el nombre del contenedor en la red de Docker
PGHOST=db
PGPORT=5432 #Asegurate que no sea un puerto que ya estes ocupando
PORT=3000

# Puerto externo para conectarte desde DBeaver o pgAdmin en Windows
EXTERNAL_DB_PORT=5434
```

> **Importante:**  
> - `PGHOST=db` es obligatorio. `db` es el nombre del servicio PostgreSQL dentro de la red interna de Docker.  
> - `EXTERNAL_DB_PORT` es el puerto que se expone en tu máquina Windows para conectarte con herramientas como DBeaver o pgAdmin. Asegúrate de que no esté ocupado por otro proceso.

### 3. Levantar los contenedores con Docker Compose

```bash
docker compose up --build
```

Este comando:
1. Construye la imagen de la API Node.js desde el `Dockerfile`.
2. Descarga la imagen oficial de PostgreSQL 16.
3. Ejecuta automáticamente `docker/init.sql`, creando las tablas `categorias`, `armas` y `skins` e insertando los datos de semilla.
4. Inicia ambos contenedores. La API espera a que la base de datos esté lista antes de arrancar.

Una vez levantados, deberías ver en la consola:

```
CS2 Wiki API corriendo en http://localhost:3000
Endpoints disponibles bajo: http://localhost:3000/api
```

Para detener los contenedores:

```bash
docker compose down
```

---

## Modelo de base de datos

El esquema está normalizado hasta la **Tercera Forma Normal (3FN)**:

```
categorias (1) ──── (N) armas (1) ──── (N) skins
```

| Tabla | Descripción |
|---|---|
| `categorias` | Agrupa las armas por tipo (Rifles, Pistolas, etc.) |
| `armas` | Entidad central con todos los atributos del arma |
| `skins` | Skins cosméticas vinculadas a un arma |

### Comportamiento de las claves foráneas

| Relación | ON DELETE |
|---|---|
| `armas → categorias` | `RESTRICT` — no se puede borrar una categoría que tenga armas |
| `skins → armas` | `CASCADE` — al borrar un arma, sus skins se eliminan automáticamente |

---

## Endpoints disponibles

La API base es: `http://localhost:3000/api`

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/armas` | Obtener todas las armas |
| GET | `/armas/:id` | Obtener un arma con sus skins |
| POST | `/armas` | Crear una nueva arma |
| POST | `/armas/:id/skins` | Añadir una skin a un arma |
| PUT | `/armas/:id` | Reemplazar todos los datos de un arma |
| PUT | `/categorias/:id` | Reemplazar todos los datos de una categoría |
| PATCH | `/armas/:id/precio` | Actualizar solo el precio de un arma |
| PATCH | `/armas/:id/cargador` | Actualizar solo las balas del cargador |
| DELETE | `/armas/:id` | Eliminar un arma (y sus skins en cascada) |
| DELETE | `/skins/:id` | Eliminar una skin |
| GET | `/categorias` | Obtener la lista de todas las categorías |
| GET | `/subcategorias/armas` | Obtener la lista de subcategorías con sus armas |
| POST | `/categorias` | Crear una nueva categoría |
| POST | `/subcategorias` | Crear una nueva subcategoría |
| PUT | `/skins/:id` | Reemplazar el nombre y la rareza de una skin |
| PATCH | `/skins/:id/rareza` | Actualizar únicamente la rareza de una skin |
| PATCH | `/categorias/:id/descripcion` | Actualizar únicamente la descripción de una categoría |
| DELETE | `/categorias/:id` | Eliminar una categoría |
| DELETE | `/subcategorias/:id` | Eliminar una subcategoría |
| PUT | `/subcategorias/:id` | Reemplazar todos los datos de una subcategoría |

Consulta el archivo `ENDPOINTS.md` para ver el detalle completo de cada endpoint (body, respuestas y códigos de estado).

---

## Arquitectura

El proyecto sigue una arquitectura de **3 capas**:

```
Request → Router → Middleware de validación → Controlador → PostgreSQL → Response
```

- **Router** (`routes/`): define la URL y el método HTTP.
- **Middleware** (`middlewares/`): valida el body antes de llegar al controlador.
- **Controlador** (`controllers/`): ejecuta la consulta SQL y retorna la respuesta.

Los errores se propagan con `next(error)` hasta el **manejador global** al final de `app.js`, evitando repetir bloques `try/catch` con lógica de respuesta en cada endpoint.

---

## Conexión desde DBeaver o pgAdmin (opcional)

Si quieres inspeccionar la base de datos desde una herramienta gráfica en tu máquina local, usa los siguientes datos de conexión:

| Campo | Valor |
|---|---|
| Host | `localhost` |
| Puerto | El valor de `EXTERNAL_DB_PORT` en tu `.env` (por defecto `5434`) |
| Base de datos | El valor de `PGDATABASE` (por defecto `cs2_wiki_db`) |
| Usuario | El valor de `PGUSER` |
| Contraseña | El valor de `PGPASSWORD` |

---

## Colección Postman

Importa el archivo `CS2_Wiki_API.postman_collection.json` en Postman para tener los 20 endpoints listos con sus bodies configurados.

**File → Import → selecciona el archivo `.json`**

---

## Autor

Desarrollado por **Grupo 3** — Asignatura Node.js