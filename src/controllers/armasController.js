const db = require('../config/db');
const { manejarErrorPg, validarIdParam } = require('../utils/dbHelpers');

// GET
// GET /api/armas — Devuelve todas las armas con sus categorías, subcategorías y skins
const getAllArmas = async (req, res, next) => {
    try {
        const result = await db.query(`
            SELECT
                a.id, a.nombre, a.bando, a.precio,
                a.dano_base, a.balas_cargador,
                c.nombre AS categoria,
                s.nombre AS subcategoria,
                a.id_subcategoria,
                a.id_categoria,
                sk.id AS skin_id,
                sk.nombre_skin,
                sk.rareza
            FROM armas a
            JOIN categorias c ON a.id_categoria = c.id
            LEFT JOIN subcategorias s ON a.id_subcategoria = s.id
            LEFT JOIN skins sk ON a.id = sk.id_arma
            ORDER BY c.nombre, s.nombre, a.nombre, sk.rareza
        `);

        const armasList = [];
        const armasMap = {};
        for (const row of result.rows) {
            if (!armasMap[row.id]) {
                armasMap[row.id] = {
                    id: row.id,
                    nombre: row.nombre,
                    bando: row.bando,
                    precio: row.precio,
                    dano_base: row.dano_base,
                    balas_cargador: row.balas_cargador,
                    categoria: row.categoria,
                    subcategoria: row.subcategoria,
                    id_subcategoria: row.id_subcategoria,
                    id_categoria: row.id_categoria,
                    skins: []
                };
                armasList.push(armasMap[row.id]);
            }
            if (row.skin_id) {
                armasMap[row.id].skins.push({
                    id: row.skin_id,
                    nombre_skin: row.nombre_skin,
                    rareza: row.rareza
                });
            }
        }

        res.status(200).json(armasList);
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
            `SELECT a.*, c.nombre AS categoria, s.nombre AS subcategoria
             FROM armas a
             JOIN categorias c ON a.id_categoria = c.id
             LEFT JOIN subcategorias s ON a.id_subcategoria = s.id
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
        const { id_categoria, id_subcategoria, nombre, bando, precio, dano_base, balas_cargador } = req.body;

        const result = await db.query(
            `INSERT INTO armas (id_categoria, id_subcategoria, nombre, bando, precio, dano_base, balas_cargador)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [id_categoria, id_subcategoria !== undefined ? id_subcategoria : null, nombre, bando, precio, dano_base, balas_cargador]
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

        const { id_categoria, id_subcategoria, nombre, bando, precio, dano_base, balas_cargador } = req.body;

        const result = await db.query(
            `UPDATE armas
             SET id_categoria=$1, id_subcategoria=$2, nombre=$3, bando=$4,
                 precio=$5, dano_base=$6, balas_cargador=$7
             WHERE id=$8
             RETURNING *`,
            [id_categoria, id_subcategoria !== undefined ? id_subcategoria : null, nombre, bando, precio, dano_base, balas_cargador, id]
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

module.exports = {
    getAllArmas,
    getArmaById,
    createArma,
    replaceArma,
    updatePrecio,
    updateCargador,
    deleteArma
};