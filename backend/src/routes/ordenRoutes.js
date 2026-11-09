const express = require('express');
const router = express.Router();
const { consultarPosiblesDuplicados, listarOrdenes, crearOrden, aprobarOrden, anularOrden } = require('../controllers/ordenController');

router.get('/posibles-duplicados', consultarPosiblesDuplicados);
router.get('/', listarOrdenes);
router.post('/', crearOrden);
router.put('/:id/aprobar', aprobarOrden);
router.put('/:id/anular', anularOrden);

module.exports = router;
