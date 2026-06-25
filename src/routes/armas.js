// Rutas para Armas
const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/armasController');
const {
    validarArma,
    validarPrecio,
    validarCargador
} = require('../middlewares/validacion');

// GET
router.get('/armas', ctrl.getAllArmas);
router.get('/armas/:id', ctrl.getArmaById);

// POST
router.post('/armas', validarArma, ctrl.createArma);

// PUT
router.put('/armas/:id', validarArma, ctrl.replaceArma);

// PATCH
router.patch('/armas/:id/precio', validarPrecio, ctrl.updatePrecio);
router.patch('/armas/:id/cargador', validarCargador, ctrl.updateCargador);

// DELETE
router.delete('/armas/:id', ctrl.deleteArma);

module.exports = router;