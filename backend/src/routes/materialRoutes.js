const express = require('express');
const router = express.Router();
const { getStock, listarMateriales } = require('../controllers/materialController');

router.get('/', listarMateriales);
router.get('/:id/stock', getStock);

module.exports = router;
