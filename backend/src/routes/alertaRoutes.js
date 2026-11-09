const express = require('express');
const router = express.Router();
const { consultarAlertas, resolverAlerta } = require('../controllers/alertaController');

router.get('/reorden', consultarAlertas);
router.put('/:id/resolver', resolverAlerta);

module.exports = router;
