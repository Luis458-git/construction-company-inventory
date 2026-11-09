const { queryAll } = require('../config/database');
const { obtenerEstadoMaterial } = require('../services/reordenService');

function getStock(req, res) {
  try {
    const { id } = req.params;
    const materialId = parseInt(id, 10);

    if (isNaN(materialId) || materialId <= 0) {
      return res.status(400).json({
        error: 'Bad Request',
        mensaje: 'El ID de material provisto no es válido.'
      });
    }

    const estado = obtenerEstadoMaterial(materialId);
    if (!estado) {
      return res.status(404).json({
        error: 'Not Found',
        mensaje: `No se encontró el material con ID ${materialId}.`
      });
    }

    return res.status(200).json(estado);
  } catch (err) {
    console.error('Error en getStock:', err);
    return res.status(500).json({ error: 'Internal Server Error', mensaje: err.message });
  }
}

function listarMateriales(req, res) {
  try {
    const materiales = queryAll('SELECT id FROM materiales ORDER BY id ASC;');
    const listaCompleta = materiales.map(m => obtenerEstadoMaterial(m.id));

    return res.status(200).json({
      total: listaCompleta.length,
      materiales: listaCompleta
    });
  } catch (err) {
    console.error('Error en listarMateriales:', err);
    return res.status(500).json({ error: 'Internal Server Error', mensaje: err.message });
  }
}

module.exports = {
  getStock,
  listarMateriales
};

