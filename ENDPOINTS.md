# ENDPOINTS.md — Documentación de la CS2 Wiki API

Base URL: `http://localhost:3000/api`

Todos los endpoints que reciben body esperan el header:
```
Content-Type: application/json
```

---

## Índice

1. [GET /armas](#1-get-armas)
2. [GET /armas/:id](#2-get-armasid)
3. [POST /armas](#3-post-armas)
4. [POST /armas/:id/skins](#4-post-armasidskins)
5. [PUT /armas/:id](#5-put-armasid)
6. [PUT /categorias/:id](#6-put-categoriasid)
7. [PATCH /armas/:id/precio](#7-patch-armasidprecio)
8. [PATCH /armas/:id/cargador](#8-patch-armasidcargador)
9. [DELETE /armas/:id](#9-delete-armasid)
10. [DELETE /skins/:id](#10-delete-skinsid)

---

## 1. GET /armas

Devuelve todas las armas registradas con el nombre de su categoría.

**Request**
```
GET /api/armas
```

**Response 200 OK**
```json
[
  {
    "id": 1,
    "nombre": "AK-47",
    "bando": "T",
    "precio": "2700.00",
    "dano_base": 36,
    "balas_cargador": 30,
    "categoria": "Rifles"
  },
  {
    "id": 2,
    "nombre": "M4A4",
    "bando": "CT",
    "precio": "3100.00",
    "dano_base": 33,
    "balas_cargador": 30,
    "categoria": "Rifles"
  }
]
```

---

## 2. GET /armas/:id

Devuelve el detalle de un arma específica junto con todas sus skins.

**Request**
```
GET /api/armas/1
```

**Response 200 OK**
```json
{
  "id": 1,
  "id_categoria": 1,
  "nombre": "AK-47",
  "bando": "T",
  "precio": "2700.00",
  "dano_base": 36,
  "balas_cargador": 30,
  "categoria": "Rifles",
  "skins": [
    { "id": 1, "nombre_skin": "Asiimov", "rareza": "Covert" },
    { "id": 2, "nombre_skin": "Redline", "rareza": "Classified" }
  ]
}
```

**Response 404 Not Found**
```json
{
  "error": "Arma con id 999 no encontrada.",
  "status": 404
}
```

---

## 3. POST /armas

Crea una nueva arma en la base de datos.

**Request**
```
POST /api/armas
```

**Body**
```json
{
  "id_categoria": 1,
  "nombre": "AWP",
  "bando": "AM",
  "precio": 4750,
  "dano_base": 115,
  "balas_cargador": 10
}
```

| Campo | Tipo | Restricciones |
|---|---|---|
| `id_categoria` | integer | Debe existir en tabla `categorias` |
| `nombre` | string | Único en la tabla |
| `bando` | string | Solo `"CT"`, `"T"` o `"AM"` |
| `precio` | number | Mayor o igual a 0 |
| `dano_base` | integer | Mayor que 0 |
| `balas_cargador` | integer | Mayor que 0 |

**Response 201 Created**
```json
{
  "id": 4,
  "id_categoria": 1,
  "nombre": "AWP",
  "bando": "AM",
  "precio": "4750.00",
  "dano_base": 115,
  "balas_cargador": 10
}
```

**Response 400 Bad Request — validación**
```json
{
  "errores": [
    "nombre es obligatorio y debe ser texto.",
    "bando es obligatorio. Valores permitidos: CT, T, AM."
  ]
}
```

**Response 400 Bad Request — nombre duplicado**
```json
{
  "error": "Ya existe un registro con ese nombre.",
  "status": 400
}
```

---

## 4. POST /armas/:id/skins

Añade una nueva skin a un arma existente.

**Request**
```
POST /api/armas/1/skins
```

**Body**
```json
{
  "nombre_skin": "Dragon Lore",
  "rareza": "Covert"
}
```

| Campo | Tipo | Restricciones |
|---|---|---|
| `nombre_skin` | string | Único por arma |
| `rareza` | string | Ver valores permitidos abajo |

**Valores de rareza permitidos:**
`Consumer` · `Industrial` · `Mil-Spec` · `Restricted` · `Classified` · `Covert` · `Contraband`

**Response 201 Created**
```json
{
  "id": 4,
  "id_arma": 1,
  "nombre_skin": "Dragon Lore",
  "rareza": "Covert"
}
```

**Response 404 Not Found — arma no existe**
```json
{
  "error": "El arma con id 999 no existe.",
  "status": 404
}
```

---

## 5. PUT /armas/:id

Reemplaza **todos** los atributos de un arma. Todos los campos son obligatorios.

**Request**
```
PUT /api/armas/1
```

**Body**
```json
{
  "id_categoria": 1,
  "nombre": "AK-47",
  "bando": "T",
  "precio": 2900,
  "dano_base": 36,
  "balas_cargador": 30
}
```

**Response 200 OK**
```json
{
  "id": 1,
  "id_categoria": 1,
  "nombre": "AK-47",
  "bando": "T",
  "precio": "2900.00",
  "dano_base": 36,
  "balas_cargador": 30
}
```

**Response 404 Not Found**
```json
{
  "error": "Arma con id 999 no encontrada.",
  "status": 404
}
```

---

## 6. PUT /categorias/:id

Reemplaza **todos** los atributos de una categoría.

**Request**
```
PUT /api/categorias/1
```

**Body**
```json
{
  "nombre": "Rifles de Asalto",
  "descripcion": "Rifles de alta potencia para combate a media y larga distancia."
}
```

| Campo | Tipo | Restricciones |
|---|---|---|
| `nombre` | string |
| `descripcion` | string |  (puede ser null) |

**Response 200 OK**
```json
{
  "id": 1,
  "nombre": "Rifles de Asalto",
  "descripcion": "Rifles de alta potencia para combate a media y larga distancia."
}
```

---

## 7. PATCH /armas/:id/precio

Modifica **únicamente** el precio de un arma. El resto de campos no se toca.

**Request**
```
PATCH /api/armas/1/precio
```

**Body**
```json
{
  "precio": 2500
}
```

**Response 200 OK**
```json
{
  "id": 1,
  "nombre": "AK-47",
  "precio": "2500.00"
}
```

**Response 400 Bad Request**
```json
{
  "errores": ["precio es obligatorio y debe ser un número >= 0."]
}
```

---

## 8. PATCH /armas/:id/cargador

Modifica **únicamente** las balas del cargador de un arma.

**Request**
```
PATCH /api/armas/1/cargador
```

**Body**
```json
{
  "balas_cargador": 35
}
```

**Response 200 OK**
```json
{
  "id": 1,
  "nombre": "AK-47",
  "balas_cargador": 35
}
```

**Response 400 Bad Request**
```json
{
  "errores": ["balas_cargador es obligatorio y debe ser un entero > 0."]
}
```

---

## 9. DELETE /armas/:id

Elimina un arma. Gracias a `ON DELETE CASCADE`, todas sus skins se eliminan automáticamente.

**Request**
```
DELETE /api/armas/3
```

**Response 200 OK**
```json
{
  "message": "Arma \"Glock-18\" eliminada correctamente (skins en cascada)."
}
```

**Response 404 Not Found**
```json
{
  "error": "Arma con id 999 no encontrada.",
  "status": 404
}
```

---

## 10. DELETE /skins/:id

Elimina una skin por su id. No afecta al arma asociada.

**Request**
```
DELETE /api/skins/1
```

**Response 200 OK**
```json
{
  "message": "Skin \"Asiimov\" eliminada correctamente."
}
```

**Response 404 Not Found**
```json
{
  "error": "Skin con id 999 no encontrada.",
  "status": 404
}
```

---

## Códigos de estado HTTP utilizados

| Código | Significado | Cuándo se usa |
|---|---|---|
| `200` | OK | GET, PUT, PATCH, DELETE exitosos |
| `201` | Created | POST exitoso (recurso creado) |
| `400` | Bad Request | Validación fallida, UNIQUE o CHECK violado |
| `404` | Not Found | El recurso solicitado no existe |
| `500` | Internal Server Error | Error inesperado del servidor |