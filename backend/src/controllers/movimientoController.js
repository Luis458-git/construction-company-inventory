const { queryAll, queryOne, execute } = require('../config/database');
const { obtenerEstadoMaterial, evaluarYDispararAlerta } = require('../services/reordenService');

const TIPOS_VALIDOS = ['ENTRADA', 'SALIDA', 'TRASLADO', 'AJUSTE', 'AJUSTE_POSITIVO', 'AJUSTE_NEGATIVO'];

function registrarMovimiento(req, res) {
  try {
    const body = req.body || {};
    const {
      material_id,
      tipo_movimiento,
      cantidad,
      bodega_origen,
      bodega_destino,
      documento_referencia,
      usuario_id
    } = body;

    if (!material_id || isNaN(Number(material_id))) {
      return res.status(400).json({ error: 'Bad Request', mensaje: 'El campo material_id es obligatorio y numérico.' });
    }

    if (!tipo_movimiento || !TIPOS_VALIDOS.includes(tipo_movimiento.toUpperCase())) {
      return res.status(400).json({ error: 'Bad Request', mensaje: `Tipo de movimiento inválido. Permitidos: ${TIPOS_VALIDOS.join(', ')}` });
    }

    const cantidadNum = Number(cantidad);
    if (isNaN(cantidadNum) || cantidadNum <= 0) {
      return res.status(400).json({ error: 'Bad Request', mensaje: 'La cantidad debe ser un número positivo mayor a cero.' });
    }

    if (!usuario_id || typeof usuario_id !== 'string') {
      return res.status(400).json({ error: 'Bad Request', mensaje: 'El campo usuario_id es obligatorio para fines de trazabilidad.' });
    }

    const material = queryOne('SELECT * FROM materiales WHERE id = ?;', [material_id]);
    if (!material) {
      return res.status(404).json({ error: 'Not Found', mensaje: `El material con ID ${material_id} no existe en la base de datos.` });
    }

    const docRef = documento_referencia || 'SIN_DOC';
    const origen = bodega_origen || 'Bodega Central';
    const destino = bodega_destino || null;

    const insertResult = execute(`
      INSERT INTO movimientos (material_id, tipo_movimiento, cantidad, bodega_origen, bodega_destino, documento_referencia, usuario_id)
      VALUES (?, ?, ?, ?, ?, ?, ?);
    `, [material_id, tipo_movimiento.toUpperCase(), cantidadNum, origen, destino, docRef, usuario_id]);

    const estadoNuevo = obtenerEstadoMaterial(material_id);
    const alertaGenerada = evaluarYDispararAlerta(
      material_id,
      estadoNuevo.stock_actual,
      estadoNuevo.punto_reorden
    );

    return res.status(201).json({
      mensaje: 'Movimiento registrado exitosamente.',
      movimiento_id: Number(insertResult.lastInsertRowid),
      material_id: estadoNuevo.material_id,
      codigo_estandar: estadoNuevo.codigo_estandar,
      descripcion: estadoNuevo.descripcion,
      nuevo_stock_actual: estadoNuevo.stock_actual,
      punto_reorden: estadoNuevo.punto_reorden,
      requiere_reposicion: estadoNuevo.requiere_reposicion,
      alerta_disparada: alertaGenerada,
      estado_inventario: estadoNuevo.estado
    });
  } catch (err) {
    console.error('Error en registrarMovimiento:', err);
    return res.status(500).json({ error: 'Internal Server Error', mensaje: err.message });
  }
}

function listarMovimientos(req, res) {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    const materialId = req.query.material_id ? parseInt(req.query.material_id, 10) : null;

    let sql = `
      SELECT 
        m.id AS movimiento_id,
        m.material_id,
        mat.codigo_estandar,
        mat.descripcion AS material_descripcion,
        m.tipo_movimiento,
        m.cantidad,
        m.bodega_origen,
        m.bodega_destino,
        m.documento_referencia,
        m.fecha_registro,
        m.usuario_id
      FROM movimientos m
      JOIN materiales mat ON m.material_id = mat.id
    `;
    const params = [];

    if (materialId) {
      sql += ' WHERE m.material_id = ?';
      params.push(materialId);
    }

    sql += ' ORDER BY m.fecha_registro DESC, m.id DESC LIMIT ?;';
    params.push(limit);

    const movimientos = queryAll(sql, params);
    return res.status(200).json({ total: movimientos.length, movimientos });
  } catch (err) {
    console.error('Error en listarMovimientos:', err);
    return res.status(500).json({ error: 'Internal Server Error', mensaje: err.message });
  }
}

module.exports = {
  registrarMovimiento,
  listarMovimientos
};

