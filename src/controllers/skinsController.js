const db = require('../config/db');
const { manejarErrorPg, validarIdParam } = require('../utils/dbHelpers');

// POST /api/armas/:id/skins — Crea una skin vinculada a un arma existente
const createSkin = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!validarIdParam(id, next)) return;

        const { nombre_skin, rareza } = req.body;

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

// PUT /api/skins/:id — Reemplaza todos los campos de una skin
const replaceSkin = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!validarIdParam(id, next)) return;

        const { nombre_skin, rareza } = req.body;

        const result = await db.query(
            `UPDATE skins
             SET nombre_skin=$1, rareza=$2
             WHERE id=$3
             RETURNING *`,
            [nombre_skin, rareza, id]
        );

        if (result.rowCount === 0) {
            const err = new Error(`Skin con id ${id} no encontrada.`);
            err.status = 404;
            return next(err);
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        manejarErrorPg(error, next);
    }
};

// PATCH /api/skins/:id/rareza — Actualiza únicamente la rareza de una skin
const updateRareza = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!validarIdParam(id, next)) return;

        const { rareza } = req.body;

        const result = await db.query(
            `UPDATE skins
             SET rareza=$1
             WHERE id=$2
             RETURNING id, nombre_skin, rareza`,
            [rareza, id]
        );

        if (result.rowCount === 0) {
            const err = new Error(`Skin con id ${id} no encontrada.`);
            err.status = 404;
            return next(err);
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        manejarErrorPg(error, next);
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
    createSkin,
    replaceSkin,
    updateRareza,
    deleteSkin
};
