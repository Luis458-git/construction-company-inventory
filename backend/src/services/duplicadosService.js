const { queryAll } = require('../config/database');

const DEFAULT_TIME_WINDOW_HOURS = Number(process.env.DUPLICATE_TIME_WINDOW_HOURS) || 72;
const DEFAULT_QTY_TOLERANCE_PERCENT = Number(process.env.DUPLICATE_QTY_TOLERANCE_PERCENT) || 5;

/**
 * Función pura: Evalúa si dos órdenes constituyen una duplicidad
 */
function esDuplicado(itemA, itemB, config = {}) {
  const maxHoras = config.maxHoras ?? DEFAULT_TIME_WINDOW_HOURS;
  const tolerancia = config.tolerancia ?? DEFAULT_QTY_TOLERANCE_PERCENT;

  if (itemA.orden_id === itemB.orden_id) return false;
  if (itemA.proveedor_id !== itemB.proveedor_id) return false;
  if (itemA.material_id !== itemB.material_id) return false;

  const cantA = Number(itemA.cantidad);
  const cantB = Number(itemB.cantidad);
  const diffCant = Math.abs(cantA - cantB);
  const maxPermitido = cantA * (tolerancia / 100);

  if (diffCant > maxPermitido) return false;

  const dateA = new Date(itemA.fecha_emision).getTime();
  const dateB = new Date(itemB.fecha_emision).getTime();
  const diffHoras = Math.abs(dateB - dateA) / (1000 * 60 * 60);

  if (diffHoras > maxHoras) return false;

  return {
    esDuplicado: true,
    diferenciaHoras: Math.round(diffHoras * 10) / 10,
    variacionPorcentaje: Math.round((diffCant / cantA) * 1000) / 10
  };
}

/**
 * Consulta la base de datos y detecta órdenes duplicadas activas
 */
function detectarOrdenesDuplicadas(options = {}) {
  const sql = `
    SELECT 
      oc.id AS orden_id,
      oc.numero_oc,
      oc.proveedor_id,
      p.nombre AS proveedor_nombre,
      oc.fecha_emision,
      oc.estado,
      oc.monto_total,
      d.material_id,
      m.codigo_estandar,
      m.descripcion AS material_descripcion,
      d.cantidad,
      d.precio_unitario,
      (d.cantidad * d.precio_unitario) AS monto_linea
    FROM ordenes_compra oc
    JOIN proveedores p ON oc.proveedor_id = p.id
    JOIN detalle_orden d ON oc.id = d.orden_compra_id
    JOIN materiales m ON d.material_id = m.id
    WHERE oc.estado != 'ANULADA'
    ORDER BY oc.fecha_emision ASC, oc.id ASC;
  `;

  const lineas = queryAll(sql);
  const duplicadosDetectados = [];
  const paresProcesados = new Set();

  for (let i = 0; i < lineas.length; i++) {
    for (let j = i + 1; j < lineas.length; j++) {
      const a = lineas[i];
      const b = lineas[j];

      const fechaA = new Date(a.fecha_emision).getTime();
      const fechaB = new Date(b.fecha_emision).getTime();
      const original = fechaA <= fechaB ? a : b;
      const sospechosa = fechaA <= fechaB ? b : a;

      const parKey = `${original.orden_id}-${sospechosa.orden_id}-${original.material_id}`;
      if (paresProcesados.has(parKey)) continue;

      const evaluacion = esDuplicado(original, sospechosa, options);
      if (evaluacion && evaluacion.esDuplicado) {
        paresProcesados.add(parKey);

        duplicadosDetectados.push({
          orden_original: original.numero_oc,
          orden_sospechosa: sospechosa.numero_oc,
          orden_original_id: original.orden_id,
          orden_sospechosa_id: sospechosa.orden_id,
          proveedor: original.proveedor_nombre,
          articulo: original.material_descripcion,
          codigo_articulo: original.codigo_estandar,
          cantidad: original.cantidad,
          cantidad_sospechosa: sospechosa.cantidad,
          diferencia_horas: Math.floor(evaluacion.diferenciaHoras),
          diferencia_horas_exacta: evaluacion.diferenciaHoras,
          fuga_potencial_monto: Number(sospechosa.monto_total || (sospechosa.cantidad * sospechosa.precio_unitario)),
          fecha_original: original.fecha_emision,
          fecha_sospechosa: sospechosa.fecha_emision
        });
      }
    }
  }

  return {
    duplicados_detectados: duplicadosDetectados,
    total_fuga_estimada: duplicadosDetectados.reduce((acc, curr) => acc + curr.fuga_potencial_monto, 0),
    criterios_aplicados: {
      ventana_max_horas: options.maxHoras ?? DEFAULT_TIME_WINDOW_HOURS,
      tolerancia_cantidad_porc: options.tolerancia ?? DEFAULT_QTY_TOLERANCE_PERCENT
    }
  };
}

module.exports = {
  esDuplicado,
  detectarOrdenesDuplicadas
};

