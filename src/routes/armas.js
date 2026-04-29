// Definición de rutas
// El router ahora es solo una tabla de enrutamiento:
// MÉTODO  URL -> MIDDLEWARE de validación -> CONTROLADOR
// No contiene lógica SQL ni validaciones. 
// SOLO conecta piezas.

const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/armasController');
const {
    validarArma,
    validarSkin,
    validarPrecio,
    validarCargador,
    validarCategoria
} = require('../middlewares/validacion');


// GET
router.get('/armas', ctrl.getAllArmas);
router.get('/armas/:id', ctrl.getArmaById);

// POST
// El middleware de validación se pasa ANTES del controlador en el array.
// Express los ejecuta en orden: validarArma -> createArma
router.post('/armas', validarArma, ctrl.createArma);
router.post('/armas/:id/skins', validarSkin, ctrl.createSkin);

// PUT
router.put('/armas/:id', validarArma, ctrl.replaceArma);
router.put('/categorias/:id', validarCategoria, ctrl.replaceCategoria);

// PATCH
router.patch('/armas/:id/precio', validarPrecio, ctrl.updatePrecio);
router.patch('/armas/:id/cargador', validarCargador, ctrl.updateCargador);

// DELETE
router.delete('/armas/:id', ctrl.deleteArma);
router.delete('/skins/:id', ctrl.deleteSkin);


module.exports = router;