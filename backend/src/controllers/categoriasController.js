const db = require('../config/db');
const { manejarErrorPg, validarIdParam } = require('../utils/dbHelpers');

// GET /api/categorias — Devuelve todas las categorías con su cantidad de armas
const getAllCategorias = async (req, res, next) => {
    try {
        const result = await db.query(`
            SELECT c.id, c.nombre, c.descripcion, COUNT(a.id)::integer AS cantidad_armas
            FROM categorias c
            LEFT JOIN armas a ON c.id = a.id_categoria
            GROUP BY c.id, c.nombre, c.descripcion
            ORDER BY c.nombre
        `);
        res.status(200).json(result.rows);
    } catch (error) {
        next(error);
    }
};

// POST /api/categorias — Crea una nueva categoría
const createCategoria = async (req, res, next) => {
    try {
        const { nombre, descripcion } = req.body;
        const result = await db.query(
            `INSERT INTO categorias (nombre, descripcion)
             VALUES ($1, $2)
             RETURNING *`,
            [nombre, descripcion]
        );
        res.status(201).json(result.rows[0]);
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
            [nombre, descripcion, id]
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

// PATCH /api/categorias/:id/descripcion — Actualiza únicamente la descripción de una categoría
const updateDescripcion = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!validarIdParam(id, next)) return;

        const { descripcion } = req.body;
        const result = await db.query(
            `UPDATE categorias
             SET descripcion=$1
             WHERE id=$2
             RETURNING id, nombre, descripcion`,
            [descripcion, id]
        );

        if (result.rowCount === 0) {
            const err = new Error(`Categoría con id ${id} no encontrada.`);
            err.status = 404;
            return next(err);
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

// DELETE /api/categorias/:id — Elimina una categoría (falla si hay armas/subcategorías por ON DELETE RESTRICT)
const deleteCategoria = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!validarIdParam(id, next)) return;

        const result = await db.query(
            'DELETE FROM categorias WHERE id=$1 RETURNING id, nombre',
            [id]
        );

        if (result.rowCount === 0) {
            const err = new Error(`Categoría con id ${id} no encontrada.`);
            err.status = 404;
            return next(err);
        }

        res.status(200).json({
            message: `Categoría "${result.rows[0].nombre}" eliminada correctamente.`
        });
    } catch (error) {
        manejarErrorPg(error, next);
    }
};

module.exports = {
    getAllCategorias,
    createCategoria,
    replaceCategoria,
    updateDescripcion,
    deleteCategoria
};
