const { queryOne, execute } = require('../config/database');
const { obtenerAlertasActivas } = require('../services/reordenService');

function consultarAlertas(req, res) {
  try {
    const alertas = obtenerAlertasActivas();
    return res.status(200).json({
      total_alertas_activas: alertas.length,
      alertas
    });
  } catch (err) {
    console.error('Error en consultarAlertas:', err);
    return res.status(500).json({ error: 'Internal Server Error', mensaje: err.message });
  }
}

function resolverAlerta(req, res) {
  try {
    const { id } = req.params;
    const alertaId = parseInt(id, 10);

    if (isNaN(alertaId) || alertaId <= 0) {
      return res.status(400).json({ error: 'Bad Request', mensaje: 'ID de alerta inválido.' });
    }

    const alerta = queryOne('SELECT * FROM alertas_reorden WHERE id = ?;', [alertaId]);
    if (!alerta) {
      return res.status(404).json({ error: 'Not Found', mensaje: `No se encontró la alerta con ID ${alertaId}.` });
    }

    execute("UPDATE alertas_reorden SET estado_resolucion = 'RESUELTA' WHERE id = ?;", [alertaId]);

    return res.status(200).json({
      mensaje: `Alerta #${alertaId} marcada como RESUELTA exitosamente.`,
      alerta_id: alertaId,
      estado_resolucion: 'RESUELTA'
    });
  } catch (err) {
    console.error('Error en resolverAlerta:', err);
    return res.status(500).json({ error: 'Internal Server Error', mensaje: err.message });
  }
}

module.exports = {
  consultarAlertas,
  resolverAlerta
};

