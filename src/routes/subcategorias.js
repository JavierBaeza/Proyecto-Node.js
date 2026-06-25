// Rutas para Subcategorías
const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/subcategoriasController');
const {
    validarSubcategoria
} = require('../middlewares/validacion');

// GET
router.get('/subcategorias/armas', ctrl.getSubcategoriasWithArmas);

// POST
router.post('/subcategorias', validarSubcategoria, ctrl.createSubcategoria);

// PUT
router.put('/subcategorias/:id', validarSubcategoria, ctrl.replaceSubcategoria);

// DELETE
router.delete('/subcategorias/:id', ctrl.deleteSubcategoria);

module.exports = router;
