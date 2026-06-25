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
11. [GET /categorias](#11-get-categorias)
12. [GET /subcategorias/armas](#12-get-subcategoriasarmas)
13. [POST /categorias](#13-post-categorias)
14. [POST /subcategorias](#14-post-subcategorias)
15. [PUT /skins/:id](#15-put-skinsid)
16. [PATCH /skins/:id/rareza](#16-patch-skinsidrareza)
17. [PATCH /categorias/:id/descripcion](#17-patch-categoriasiddescripcion)
18. [DELETE /categorias/:id](#18-delete-categoriasid)
19. [DELETE /subcategorias/:id](#19-delete-subcategoriasid)
20. [PUT /subcategorias/:id](#20-put-subcategoriasid)

---

## 1. GET /armas

Devuelve todas las armas registradas con su categoría, subcategoría y listado de skins.

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
    "categoria": "Rifles",
    "subcategoria": "Rifles de Asalto",
    "id_subcategoria": 1,
    "id_categoria": 1,
    "skins": [
      { "id": 1, "nombre_skin": "Asiimov", "rareza": "Covert" },
      { "id": 2, "nombre_skin": "Redline", "rareza": "Classified" }
    ]
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
  "id_subcategoria": 1,
  "nombre": "AK-47",
  "bando": "T",
  "precio": "2700.00",
  "dano_base": 36,
  "balas_cargador": 30,
  "categoria": "Rifles",
  "subcategoria": "Rifles de Asalto",
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

Crea una nueva arma en la base de datos. Permite asociarla opcionalmente a una subcategoría (`id_subcategoria`).

**Request**
```
POST /api/armas
```

**Body**
```json
{
  "id_categoria": 1,
  "id_subcategoria": 1,
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
| `id_subcategoria` | integer (opcional) | Debe pertenecer a la misma `id_categoria` si se especifica |
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
  "id_subcategoria": 1,
  "nombre": "AWP",
  "bando": "AM",
  "precio": "4750.00",
  "dano_base": 115,
  "balas_cargador": 10
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

---

## 5. PUT /armas/:id

Reemplaza todos los atributos de un arma.

**Request**
```
PUT /api/armas/1
```

**Body**
```json
{
  "id_categoria": 1,
  "id_subcategoria": 1,
  "nombre": "AK-47",
  "bando": "T",
  "precio": 2900,
  "dano_base": 36,
  "balas_cargador": 30
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

---

## 7. PATCH /armas/:id/precio

Modifica **únicamente** el precio de un arma.

---

## 8. PATCH /armas/:id/cargador

Modifica **únicamente** las balas del cargador de un arma.

---

## 9. DELETE /armas/:id

Elimina un arma (borrado en cascada para skins).

---

## 10. DELETE /skins/:id

Elimina una skin por su ID.

---

## 11. GET /categorias

Obtiene la lista de todas las categorías con la cantidad de armas asociadas a cada una.

**Request**
```
GET /api/categorias
```

**Response 200 OK**
```json
[
  {
    "id": 1,
    "nombre": "Rifles",
    "descripcion": "Rifles de asalto y francotiradoras...",
    "cantidad_armas": 2
  },
  {
    "id": 2,
    "nombre": "Pistolas",
    "descripcion": "Armas secundarias...",
    "cantidad_armas": 1
  }
]
```

---

## 12. GET /subcategorias/armas

Obtiene la lista de subcategorías con un arreglo de las respectivas armas asignadas a cada una.

**Request**
```
GET /api/subcategorias/armas
```

**Response 200 OK**
```json
[
  {
    "id": 1,
    "id_categoria": 1,
    "categoria": "Rifles",
    "nombre": "Rifles de Asalto",
    "descripcion": "Rifles automáticos...",
    "armas": [
      {
        "id": 1,
        "nombre": "AK-47",
        "bando": "T",
        "precio": "2700.00",
        "dano_base": 36,
        "balas_cargador": 30
      }
    ]
  }
]
```

---

## 13. POST /categorias

Crea una nueva categoría.

**Request**
```
POST /api/categorias
```

**Body**
```json
{
  "nombre": "Granadas",
  "descripcion": "Equipamiento arrojadizo y utilidades tácticas."
}
```

**Response 201 Created**
```json
{
  "id": 4,
  "nombre": "Granadas",
  "descripcion": "Equipamiento arrojadizo y utilidades tácticas."
}
```

---

## 14. POST /subcategorias

Crea una nueva subcategoría vinculada a una categoría principal.

**Request**
```
POST /api/subcategorias
```

**Body**
```json
{
  "id_categoria": 1,
  "nombre": "Fusiles de Tirador",
  "descripcion": "Fusiles semiautomáticos de precisión."
}
```

**Response 201 Created**
```json
{
  "id": 4,
  "id_categoria": 1,
  "nombre": "Fusiles de Tirador",
  "descripcion": "Fusiles semiautomáticos de precisión."
}
```

---

## 15. PUT /skins/:id

Reemplaza el nombre y la rareza de una skin existente.

**Request**
```
PUT /api/skins/1
```

**Body**
```json
{
  "nombre_skin": "Asiimov Dorada",
  "rareza": "Covert"
}
```

**Response 200 OK**
```json
{
  "id": 1,
  "id_arma": 1,
  "nombre_skin": "Asiimov Dorada",
  "rareza": "Covert"
}
```

---

## 16. PATCH /skins/:id/rareza

Actualiza únicamente la rareza de una skin.

**Request**
```
PATCH /api/skins/1/rareza
```

**Body**
```json
{
  "rareza": "Classified"
}
```

**Response 200 OK**
```json
{
  "id": 1,
  "nombre_skin": "Asiimov Dorada",
  "rareza": "Classified"
}
```

---

## 17. PATCH /categorias/:id/descripcion

Actualiza únicamente la descripción de una categoría.

**Request**
```
PATCH /api/categorias/1/descripcion
```

**Body**
```json
{
  "descripcion": "Rifles de Counter-Strike 2."
}
```

**Response 200 OK**
```json
{
  "id": 1,
  "nombre": "Rifles",
  "descripcion": "Rifles de Counter-Strike 2."
}
```

---

## 18. DELETE /categorias/:id

Elimina una categoría. Impide la eliminación si existen armas vinculadas directamente a la categoría (`ON DELETE RESTRICT`).

**Request**
```
DELETE /api/categorias/4
```

**Response 200 OK**
```json
{
  "message": "Categoría \"Granadas\" eliminada correctamente."
}
```

---

## 19. DELETE /subcategorias/:id

Elimina una subcategoría. Las armas que pertenecían a ella seguirán existiendo y vinculadas a su categoría principal, pero con `id_subcategoria = NULL` (`ON DELETE SET NULL`).

**Request**
```
DELETE /api/subcategorias/4
```

**Response 200 OK**
```json
{
  "message": "Subcategoría \"Fusiles de Tirador\" eliminada correctamente."
}
```

---

## 20. PUT /subcategorias/:id

Reemplaza **todos** los atributos de una subcategoría.

**Request**
```
PUT /api/subcategorias/1
```

**Body**
```json
{
  "id_categoria": 1,
  "nombre": "Rifles de Asalto Pesados",
  "descripcion": "Rifles automáticos de alto calibre para combate de medio alcance."
}
```

| Campo | Tipo | Restricciones |
|---|---|---|
| `id_categoria` | integer | Obligatorio. Debe existir en tabla `categorias` |
| `nombre` | string | Obligatorio. Único en la tabla |
| `descripcion` | string/null | Opcional. Texto descriptivo |

**Response 200 OK**
```json
{
  "id": 1,
  "id_categoria": 1,
  "nombre": "Rifles de Asalto Pesados",
  "descripcion": "Rifles automáticos de alto calibre para combate de medio alcance."
}
```

**Response 404 Not Found**
```json
{
  "error": "Subcategoría con id 999 no encontrada.",
  "status": 404
}
```