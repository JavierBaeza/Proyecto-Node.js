const db = require('../config/db');
const { manejarErrorPg, validarIdParam } = require('../utils/dbHelpers');

// GET /api/subcategorias — Devuelve la lista de subcategorías con sus respectivas armas asociadas
const getSubcategoriasWithArmas = async (req, res, next) => {
    try {
        const result = await db.query(`
            SELECT s.id AS subcategoria_id, s.nombre AS subcategoria_nombre, s.descripcion AS subcategoria_descripcion,
                   s.id_categoria, c.nombre AS categoria_nombre,
                   a.id AS arma_id, a.nombre AS arma_nombre, a.bando AS arma_bando, a.precio AS arma_precio,
                   a.dano_base AS arma_dano_base, a.balas_cargador AS arma_balas_cargador
            FROM subcategorias s
            JOIN categorias c ON s.id_categoria = c.id
            LEFT JOIN armas a ON s.id = a.id_subcategoria
            ORDER BY s.nombre, a.nombre
        `);

        const subcategoriasMap = {};
        for (const row of result.rows) {
            if (!subcategoriasMap[row.subcategoria_id]) {
                subcategoriasMap[row.subcategoria_id] = {
                    id: row.subcategoria_id,
                    id_categoria: row.id_categoria,
                    categoria: row.categoria_nombre,
                    nombre: row.subcategoria_nombre,
                    descripcion: row.subcategoria_descripcion,
                    armas: []
                };
            }
            if (row.arma_id) {
                subcategoriasMap[row.subcategoria_id].armas.push({
                    id: row.arma_id,
                    nombre: row.arma_nombre,
                    bando: row.arma_bando,
                    precio: row.arma_precio,
                    dano_base: row.arma_dano_base,
                    balas_cargador: row.arma_balas_cargador
                });
            }
        }

        res.status(200).json(Object.values(subcategoriasMap));
    } catch (error) {
        next(error);
    }
};

// POST /api/subcategorias — Crea una nueva subcategoría
const createSubcategoria = async (req, res, next) => {
    try {
        const { id_categoria, nombre, descripcion } = req.body;
        const result = await db.query(
            `INSERT INTO subcategorias (id_categoria, nombre, descripcion)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [id_categoria, nombre, descripcion]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        manejarErrorPg(error, next);
    }
};

// DELETE /api/subcategorias/:id — Elimina una subcategoría (armas asociadas quedan con id_subcategoria = NULL)
const deleteSubcategoria = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!validarIdParam(id, next)) return;

        const result = await db.query(
            'DELETE FROM subcategorias WHERE id=$1 RETURNING id, nombre',
            [id]
        );

        if (result.rowCount === 0) {
            const err = new Error(`Subcategoría con id ${id} no encontrada.`);
            err.status = 404;
            return next(err);
        }

        res.status(200).json({
            message: `Subcategoría "${result.rows[0].nombre}" eliminada correctamente.`
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getSubcategoriasWithArmas,
    createSubcategoria,
    deleteSubcategoria
};
