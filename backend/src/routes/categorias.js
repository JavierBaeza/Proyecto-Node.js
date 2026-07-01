// Rutas para Categorías
const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/categoriasController');
const {
    validarCategoria,
    validarDescripcionCategoria
} = require('../middlewares/validacion');

// GET
router.get('/categorias', ctrl.getAllCategorias);

// POST
router.post('/categorias', validarCategoria, ctrl.createCategoria);

// PUT
router.put('/categorias/:id', validarCategoria, ctrl.replaceCategoria);

// PATCH
router.patch('/categorias/:id/descripcion', validarDescripcionCategoria, ctrl.updateDescripcion);

// DELETE
router.delete('/categorias/:id', ctrl.deleteCategoria);

module.exports = router;
