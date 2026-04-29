// Lógica de negocio y consultas SQL
// El controlador es responsable ÚNICAMENTE de:
//   1. Leer los datos validados de req (params, body)
//   2. Ejecutar la consulta SQL correspondiente
//   3. Responder con el resultado o delegar el error al manejador global
//
// NO valida datos (eso lo hace el middleware) y NO define rutas (eso lo hace
// el router).

const db = require('../config/db');

// Helper: maneja códigos de error específicos de PostgreSQL.
// Centraliza la interpretación de errores para no repetirla en cada controlador.
const manejarErrorPg = (error, next) => {
    if (error.code === '23505') {
        const err = new Error('Ya existe un registro con ese nombre.');
        err.status = 400;
        return next(err);
    }
    if (error.code === '23503') {
        // FK inválida: id_categoria o id_arma no existe
        const err = new Error('La referencia (id_categoria o id_arma) no existe.');
        err.status = 400;
        return next(err);
    }
    if (error.code === '23514') {
        // Violación de CHECK constraint (bando, rareza, precio negativo, etc.)
        const err = new Error('Valor inválido para un campo restringido (bando, rareza, precio, etc.).');
        err.status = 400;
        return next(err);
    }
    next(error);
};

// Helper: valida que el parámetro :id de la URL sea un entero válido.
// Evita que queries reciban strings como 'abc' y devuelvan un 500 de PostgreSQL.
const validarIdParam = (id, next) => {
    if (isNaN(id) || !Number.isInteger(Number(id)) || Number(id) <= 0) {
        const err = new Error('El parámetro id debe ser un entero positivo.');
        err.status = 400;
        next(err);
        return false;
    }
    return true;
};

// GET
// GET /api/armas — Devuelve todas las armas con el nombre de su categoría
const getAllArmas = async (req, res, next) => {
    try {
        const result = await db.query(`
            SELECT
                a.id, a.nombre, a.bando, a.precio,
                a.dano_base, a.balas_cargador,
                c.nombre AS categoria
            FROM armas a
            JOIN categorias c ON a.id_categoria = c.id
            ORDER BY c.nombre, a.nombre
        `);
        res.status(200).json(result.rows);
    } catch (error) {
        next(error);
    }
};


// GET /api/armas/:id — Devuelve el detalle de un arma con sus skins
const getArmaById = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!validarIdParam(id, next)) return;

        const armaResult = await db.query(
            `SELECT a.*, c.nombre AS categoria
             FROM armas a
             JOIN categorias c ON a.id_categoria = c.id
             WHERE a.id = $1`,
            [id]
        );

        if (armaResult.rowCount === 0) {
            const err = new Error(`Arma con id ${id} no encontrada.`);
            err.status = 404;
            return next(err);
        }

        const skinsResult = await db.query(
            'SELECT id, nombre_skin, rareza FROM skins WHERE id_arma = $1 ORDER BY rareza',
            [id]
        );

        res.status(200).json({
            ...armaResult.rows[0],
            skins: skinsResult.rows
        });
    } catch (error) {
        next(error);
    }
};

// POST
// POST /api/armas — Crea una nueva arma
const createArma = async (req, res, next) => {
    try {
        // nombre.trim() ya fue persistido en el middleware de validación
        const { id_categoria, nombre, bando, precio, dano_base, balas_cargador } = req.body;

        const result = await db.query(
            `INSERT INTO armas (id_categoria, nombre, bando, precio, dano_base, balas_cargador)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [id_categoria, nombre, bando, precio, dano_base, balas_cargador]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        manejarErrorPg(error, next);
    }
};

// POST /api/armas/:id/skins — Crea una skin vinculada a un arma existente
const createSkin = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!validarIdParam(id, next)) return;

        const { nombre_skin, rareza } = req.body;

        // No hacemos SELECT previo para verificar el arma:
        // la FK de la tabla skins lanza código 23503 si id_arma no existe,
        // y manejarErrorPg lo convierte en un 400 descriptivo.
        const result = await db.query(
            `INSERT INTO skins (id_arma, nombre_skin, rareza)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [id, nombre_skin, rareza]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        manejarErrorPg(error, next);
    }
};

// PUT
// PUT /api/armas/:id — Reemplaza todos los campos de un arma
const replaceArma = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!validarIdParam(id, next)) return;

        const { id_categoria, nombre, bando, precio, dano_base, balas_cargador } = req.body;

        const result = await db.query(
            `UPDATE armas
             SET id_categoria=$1, nombre=$2, bando=$3,
                 precio=$4, dano_base=$5, balas_cargador=$6
             WHERE id=$7
             RETURNING *`,
            [id_categoria, nombre, bando, precio, dano_base, balas_cargador, id]
        );

        if (result.rowCount === 0) {
            const err = new Error(`Arma con id ${id} no encontrada.`);
            err.status = 404;
            return next(err);
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        manejarErrorPg(error, next);
    }
};

// PUT /api/categorias/:id — Reemplaza todos los campos de una categoría
const replaceCategoria = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!validarIdParam(id, next)) return;

        const { nombre, descripcion } = req.body;

        const result = await db.query(
            `UPDATE categorias
             SET nombre=$1, descripcion=$2
             WHERE id=$3
             RETURNING *`,
            [nombre, descripcion || null, id]
        );

        if (result.rowCount === 0) {
            const err = new Error(`Categoría con id ${id} no encontrada.`);
            err.status = 404;
            return next(err);
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        manejarErrorPg(error, next);
    }
};

// PATCH
// PATCH /api/armas/:id/precio — Modifica únicamente el precio
const updatePrecio = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!validarIdParam(id, next)) return;

        const { precio } = req.body;

        const result = await db.query(
            `UPDATE armas SET precio=$1 WHERE id=$2
             RETURNING id, nombre, precio`,
            [precio, id]
        );

        if (result.rowCount === 0) {
            const err = new Error(`Arma con id ${id} no encontrada.`);
            err.status = 404;
            return next(err);
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};


// PATCH /api/armas/:id/cargador — Modifica únicamente las balas del cargador
const updateCargador = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!validarIdParam(id, next)) return;

        const { balas_cargador } = req.body;

        const result = await db.query(
            `UPDATE armas SET balas_cargador=$1 WHERE id=$2
             RETURNING id, nombre, balas_cargador`,
            [balas_cargador, id]
        );

        if (result.rowCount === 0) {
            const err = new Error(`Arma con id ${id} no encontrada.`);
            err.status = 404;
            return next(err);
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

// DELETE
// DELETE /api/armas/:id — Elimina un arma (sus skins se borran en cascada por FK)
const deleteArma = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!validarIdParam(id, next)) return;

        const result = await db.query(
            'DELETE FROM armas WHERE id=$1 RETURNING id, nombre',
            [id]
        );

        if (result.rowCount === 0) {
            const err = new Error(`Arma con id ${id} no encontrada.`);
            err.status = 404;
            return next(err);
        }

        res.status(200).json({
            message: `Arma "${result.rows[0].nombre}" eliminada correctamente (skins en cascada).`
        });
    } catch (error) {
        next(error);
    }
};

// DELETE /api/skins/:id — Elimina una skin por su id
const deleteSkin = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!validarIdParam(id, next)) return;

        const result = await db.query(
            'DELETE FROM skins WHERE id=$1 RETURNING id, nombre_skin',
            [id]
        );

        if (result.rowCount === 0) {
            const err = new Error(`Skin con id ${id} no encontrada.`);
            err.status = 404;
            return next(err);
        }

        res.status(200).json({
            message: `Skin "${result.rows[0].nombre_skin}" eliminada correctamente.`
        });
    } catch (error) {
        next(error);
    }
};


module.exports = {
    getAllArmas,
    getArmaById,
    createArma,
    createSkin,
    replaceArma,
    replaceCategoria,
    updatePrecio,
    updateCargador,
    deleteArma,
    deleteSkin
};