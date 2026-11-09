const { queryAll, queryOne, execute } = require('../config/database');
const { detectarOrdenesDuplicadas } = require('../services/duplicadosService');

const APPROVAL_THRESHOLD = Number(process.env.APPROVAL_THRESHOLD_AMOUNT) || 250000;

function consultarPosiblesDuplicados(req, res) {
  try {
    const maxHoras = req.query.horas ? Number(req.query.horas) : undefined;
    const tolerancia = req.query.tolerancia ? Number(req.query.tolerancia) : undefined;

    const resultado = detectarOrdenesDuplicadas({ maxHoras, tolerancia });
    return res.status(200).json(resultado);
  } catch (err) {
    console.error('Error en consultarPosiblesDuplicados:', err);
    return res.status(500).json({ error: 'Internal Server Error', mensaje: err.message });
  }
}

function listarOrdenes(req, res) {
  try {
    const sql = `
      SELECT 
        oc.id,
        oc.numero_oc,
        oc.proveedor_id,
        p.nombre AS proveedor_nombre,
        oc.fecha_emision,
        oc.area_solicitante,
        oc.estado,
        oc.monto_total,
        (
          SELECT json_group_array(
            json_object(
              'material_id', d.material_id,
              'codigo', m.codigo_estandar,
              'descripcion', m.descripcion,
              'cantidad', d.cantidad,
              'precio_unitario', d.precio_unitario
            )
          )
          FROM detalle_orden d
          JOIN materiales m ON d.material_id = m.id
          WHERE d.orden_compra_id = oc.id
        ) AS detalle_json
      FROM ordenes_compra oc
      JOIN proveedores p ON oc.proveedor_id = p.id
      ORDER BY oc.id DESC;
    `;

    const ordenesRaw = queryAll(sql);
    const ordenes = ordenesRaw.map(o => ({
      ...o,
      detalle: o.detalle_json ? JSON.parse(o.detalle_json) : []
    }));

    return res.status(200).json({ total: ordenes.length, ordenes });
  } catch (err) {
    console.error('Error en listarOrdenes:', err);
    return res.status(500).json({ error: 'Internal Server Error', mensaje: err.message });
  }
}

function crearOrden(req, res) {
  try {
    const body = req.body || {};
    const { numero_oc, proveedor_id, area_solicitante, items, monto_total, estado } = body;

    if (!numero_oc || !proveedor_id || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        mensaje: 'Campos requeridos: numero_oc, proveedor_id, area_solicitante y arreglo items.'
      });
    }

    let totalCalculado = 0;
    for (const item of items) {
      if (!item.material_id || !item.cantidad || !item.precio_unitario) {
        return res.status(400).json({
          error: 'Bad Request',
          mensaje: 'Cada ítem debe contener material_id, cantidad y precio_unitario.'
        });
      }
      totalCalculado += Number(item.cantidad) * Number(item.precio_unitario);
    }

    const montoFinal = monto_total ? Number(monto_total) : totalCalculado;
    let estadoFinal = estado || 'APROBADA';
    let requiereAprobacion = false;

    if (montoFinal > APPROVAL_THRESHOLD) {
      estadoFinal = 'PENDIENTE_APROBACION';
      requiereAprobacion = true;
    }

    const ocResult = execute(`
      INSERT INTO ordenes_compra (numero_oc, proveedor_id, area_solicitante, estado, monto_total)
      VALUES (?, ?, ?, ?, ?);
    `, [numero_oc, proveedor_id, area_solicitante || 'Bodega Central', estadoFinal, montoFinal]);

    const ocId = Number(ocResult.lastInsertRowid);

    for (const item of items) {
      execute(`
        INSERT INTO detalle_orden (orden_compra_id, material_id, cantidad, precio_unitario)
        VALUES (?, ?, ?, ?);
      `, [ocId, item.material_id, Number(item.cantidad), Number(item.precio_unitario)]);
    }

    return res.status(201).json({
      mensaje: 'Orden de compra registrada exitosamente.',
      orden_id: ocId,
      numero_oc,
      estado: estadoFinal,
      monto_total: montoFinal,
      requiere_aprobacion_gerencial: requiereAprobacion,
      umbral_aprobacion: APPROVAL_THRESHOLD
    });
  } catch (err) {
    console.error('Error en crearOrden:', err);
    if (err.message && err.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'Bad Request', mensaje: `El número de orden ${req.body.numero_oc} ya existe.` });
    }
    return res.status(500).json({ error: 'Internal Server Error', mensaje: err.message });
  }
}

function aprobarOrden(req, res) {
  try {
    const { id } = req.params;
    const ordenId = parseInt(id, 10);

    const orden = queryOne('SELECT * FROM ordenes_compra WHERE id = ?;', [ordenId]);
    if (!orden) {
      return res.status(404).json({ error: 'Not Found', mensaje: `No se encontró la orden de compra #${ordenId}.` });
    }

    execute("UPDATE ordenes_compra SET estado = 'APROBADA' WHERE id = ?;", [ordenId]);

    return res.status(200).json({
      mensaje: `Orden ${orden.numero_oc} aprobada exitosamente por gerencia.`,
      orden_id: ordenId,
      numero_oc: orden.numero_oc,
      estado: 'APROBADA'
    });
  } catch (err) {
    console.error('Error en aprobarOrden:', err);
    return res.status(500).json({ error: 'Internal Server Error', mensaje: err.message });
  }
}

function anularOrden(req, res) {
  try {
    const { id } = req.params;
    const ordenId = parseInt(id, 10);

    const orden = queryOne('SELECT * FROM ordenes_compra WHERE id = ?;', [ordenId]);
    if (!orden) {
      return res.status(404).json({ error: 'Not Found', mensaje: `No se encontró la orden de compra #${ordenId}.` });
    }

    execute("UPDATE ordenes_compra SET estado = 'ANULADA' WHERE id = ?;", [ordenId]);

    return res.status(200).json({
      mensaje: `Orden ${orden.numero_oc} ANULADA exitosamente. Fuga prevenida.`,
      orden_id: ordenId,
      numero_oc: orden.numero_oc,
      estado: 'ANULADA',
      monto_anulado: orden.monto_total
    });
  } catch (err) {
    console.error('Error en anularOrden:', err);
    return res.status(500).json({ error: 'Internal Server Error', mensaje: err.message });
  }
}

module.exports = {
  consultarPosiblesDuplicados,
  listarOrdenes,
  crearOrden,
  aprobarOrden,
  anularOrden
};

