# CS2 Weapons Wiki API

API RESTful para una Wiki de armas de Counter-Strike 2, construida con **Node.js**, **Express.js** y **PostgreSQL**.

Proyecto desarrollado para la asignatura de Node.js.

---

## Tecnologías utilizadas

- **Node.js** — entorno de ejecución
- **Express.js** — framework web para definir rutas y middlewares
- **pg (node-postgres)** — cliente PostgreSQL para consultas SQL puras
- **dotenv** — gestión de variables de entorno

---

## Estructura del proyecto

```
cs2_wiki/
├── docker/
│   └── init.sql                   # Script de inicialización de la base de datos
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
├── docker-compose.yml             # Configuración de servicios Docker (App, BD, etc.)
├── Dockerfile                     # Instrucciones para construir la imagen Docker
├── ENDPOINTS.md                   # Documentación detallada de los endpoints
├── package-lock.json              # Árbol de versiones exactas de dependencias
└── package.json                   # Dependencias y scripts del proyecto
```

---

## Instalación y configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/cs2_wiki.git
cd cs2_wiki
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
PGHOST=localhost
PGPORT=5432
PGDATABASE=cs2_wiki_db
PGUSER=postgres
PGPASSWORD=tu_contraseña
PORT=3000
```

### 4. Crear la base de datos

Ejecuta el script `cs2_wiki_schema.sql` en pgAdmin o psql:

```bash
psql -U postgres -d cs2_wiki_db -f cs2_wiki_schema.sql
```

Esto creará las tablas `categorias`, `armas` y `skins`, e insertará los datos de semilla.

### 5. Iniciar el servidor

```bash
node src/app.js
```

Deberías ver en consola:

```
Conexión a PostgreSQL establecida correctamente.
CS2 Wiki API corriendo en http://localhost:3000
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
| `armas → categorias` | `RESTRICT` — no se puede borrar una categoría con armas |
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

Consulta el archivo `ENDPOINTS.md` para ver el detalle completo de cada endpoint.

---

## Arquitectura

El proyecto sigue una arquitectura de **3 capas**:

```
Request → Router → Middleware de validación → Controlador → PostgreSQL → Response
```

- **Router** (`routes/`): solo define la URL y el método HTTP
- **Middleware** (`middlewares/`): valida el body antes de llegar al controlador
- **Controlador** (`controllers/`): ejecuta la consulta SQL y responde

Los errores se propagan con `next(error)` hasta el **manejador global** al final de `app.js`, evitando repetir bloques `try/catch` con lógica de respuesta en cada endpoint.

---

## Colección Postman

Importa el archivo `CS2_Wiki_API.postman_collection.json` en Postman para tener los 10 endpoints listos con sus bodies configurados.

**File → Import → selecciona el archivo `.json`**

---

## Autor

Desarrollado por **Grupo 3** — Asignatura Node.js