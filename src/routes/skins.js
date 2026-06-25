// Rutas para Skins
const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/skinsController');
const {
    validarSkin,
    validarRarezaSkin
} = require('../middlewares/validacion');

// POST (vincular skin a un arma)
router.post('/armas/:id/skins', validarSkin, ctrl.createSkin);

// PUT
router.put('/skins/:id', validarSkin, ctrl.replaceSkin);

// PATCH
router.patch('/skins/:id/rareza', validarRarezaSkin, ctrl.updateRareza);

// DELETE
router.delete('/skins/:id', ctrl.deleteSkin);

module.exports = router;
