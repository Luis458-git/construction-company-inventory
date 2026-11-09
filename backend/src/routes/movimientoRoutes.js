const express = require('express');
const router = express.Router();
const { registrarMovimiento, listarMovimientos } = require('../controllers/movimientoController');

router.post('/', registrarMovimiento);
router.get('/', listarMovimientos);

module.exports = router;
