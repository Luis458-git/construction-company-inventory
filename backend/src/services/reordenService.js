const { queryAll, queryOne, execute } = require('../config/database');

/**
 * Servicio: Lógica de Punto de Reorden y Stock de Seguridad
 * Fórmulas:
 * SS = d * L
 * PR = (d * L) + SS
 */

function calcularParametrosReorden(demandaDiaria, leadTimeDias) {
  const ss = demandaDiaria * leadTimeDias;
  const pr = (demandaDiaria * leadTimeDias) + ss;
  return { ss, pr };
}

function obtenerStockActual(materialId) {
  const sql = `
    SELECT 
      COALESCE(SUM(CASE 
        WHEN tipo_movimiento IN ('ENTRADA', 'AJUSTE_POSITIVO') THEN cantidad 
        WHEN tipo_movimiento IN ('SALIDA', 'AJUSTE_NEGATIVO') THEN -cantidad 
        ELSE 0 
      END), 0) AS stock_actual
    FROM movimientos
    WHERE material_id = ?;
  `;
  const result = queryOne(sql, [materialId]);
  return result ? Number(result.stock_actual) : 0;
}

function obtenerEstadoMaterial(materialId) {
  const material = queryOne('SELECT * FROM materiales WHERE id = ?;', [materialId]);
  if (!material) return null;

  const { ss, pr } = calcularParametrosReorden(
    Number(material.demanda_promedio_diaria),
    Number(material.tiempo_entrega_dias)
  );

  const stockActual = obtenerStockActual(materialId);
  const requiereReposicion = stockActual <= pr;

  let estado = 'OK';
  if (stockActual <= pr) {
    estado = 'CRITICO';
  } else if (stockActual <= pr * 1.25) {
    estado = 'PROXIMO_A_REORDEN';
  }

  return {
    material_id: material.id,
    codigo_estandar: material.codigo_estandar,
    descripcion: material.descripcion,
    categoria: material.categoria,
    unidad: material.unidad,
    demanda_promedio_diaria: material.demanda_promedio_diaria,
    tiempo_entrega_dias: material.tiempo_entrega_dias,
    stock_seguridad: ss,
    punto_reorden: pr,
    stock_actual: stockActual,
    estado,
    requiere_reposicion: requiereReposicion
  };
}

function evaluarYDispararAlerta(materialId, stockActual, puntoReorden) {
  if (stockActual <= puntoReorden) {
    const alertaExistente = queryOne(`
      SELECT * FROM alertas_reorden 
      WHERE material_id = ? AND estado_resolucion = 'PENDIENTE'
      ORDER BY id DESC LIMIT 1;
    `, [materialId]);

    if (!alertaExistente) {
      execute(`
        INSERT INTO alertas_reorden (material_id, stock_al_disparar, punto_reorden_calculado, estado_resolucion)
        VALUES (?, ?, ?, 'PENDIENTE');
      `, [materialId, stockActual, puntoReorden]);
      return true;
    }
  }
  return false;
}

function obtenerAlertasActivas() {
  const sql = `
    SELECT 
      a.id AS alerta_id,
      a.material_id,
      m.codigo_estandar,
      m.descripcion,
      m.categoria,
      m.unidad,
      a.stock_al_disparar,
      a.punto_reorden_calculado,
      a.fecha_alerta,
      a.estado_resolucion,
      (a.punto_reorden_calculado - a.stock_al_disparar) AS deficit_unidades
    FROM alertas_reorden a
    JOIN materiales m ON a.material_id = m.id
    WHERE a.estado_resolucion = 'PENDIENTE'
    ORDER BY a.fecha_alerta DESC;
  `;
  return queryAll(sql);
}

module.exports = {
  calcularParametrosReorden,
  obtenerStockActual,
  obtenerEstadoMaterial,
  evaluarYDispararAlerta,
  obtenerAlertasActivas
};

