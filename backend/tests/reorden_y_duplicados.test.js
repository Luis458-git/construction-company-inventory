const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');

process.env.DB_FILE = ':memory:';

const { calcularParametrosReorden, obtenerStockActual, obtenerEstadoMaterial } = require('../src/services/reordenService');
const { esDuplicado, detectarOrdenesDuplicadas } = require('../src/services/duplicadosService');
const { initDatabase } = require('../src/config/database');

before(() => {
  initDatabase();
});

describe('Servicio de Reorden', () => {
  it('calcula SS y PR correctamente para Cemento (d=15, L=5)', () => {
    const { ss, pr } = calcularParametrosReorden(15, 5);
    assert.equal(ss, 75);
    assert.equal(pr, 150);
  });

  it('calcula SS y PR correctamente para Block (d=300, L=4)', () => {
    const { ss, pr } = calcularParametrosReorden(300, 4);
    assert.equal(ss, 1200);
    assert.equal(pr, 2400);
  });

  it('obtiene stock actual del material 1 (Cemento) desde movimientos', () => {
    const stock = obtenerStockActual(1);
    assert.equal(typeof stock, 'number');
    assert.ok(stock >= 0, 'Stock debe ser >= 0');
  });

  it('obtiene estado completo del material 1', () => {
    const estado = obtenerEstadoMaterial(1);
    assert.ok(estado, 'Estado no debe ser null');
    assert.equal(estado.material_id, 1);
    assert.equal(estado.codigo_estandar, 'MAT-CEM-01');
    assert.ok(['OK', 'CRITICO', 'PROXIMO_A_REORDEN'].includes(estado.estado));
  });

  it('retorna null para un material inexistente', () => {
    const estado = obtenerEstadoMaterial(9999);
    assert.equal(estado, null);
  });
});

describe('Servicio de Duplicados', () => {
  it('detecta duplicado entre dos items iguales dentro de 72h', () => {
    const itemA = { orden_id: 1, proveedor_id: 1, material_id: 1, cantidad: 200, fecha_emision: '2026-10-02 08:30:00' };
    const itemB = { orden_id: 2, proveedor_id: 1, material_id: 1, cantidad: 200, fecha_emision: '2026-10-02 11:15:00' };
    const result = esDuplicado(itemA, itemB);
    assert.ok(result, 'Debe detectar duplicado');
    assert.equal(result.esDuplicado, true);
  });

  it('NO detecta duplicado si proveedores son distintos', () => {
    const itemA = { orden_id: 1, proveedor_id: 1, material_id: 1, cantidad: 200, fecha_emision: '2026-10-02 08:30:00' };
    const itemB = { orden_id: 2, proveedor_id: 2, material_id: 1, cantidad: 200, fecha_emision: '2026-10-02 11:15:00' };
    const result = esDuplicado(itemA, itemB);
    assert.equal(result, false);
  });

  it('NO detecta duplicado si la diferencia de horas excede 72h', () => {
    const itemA = { orden_id: 1, proveedor_id: 1, material_id: 1, cantidad: 200, fecha_emision: '2026-10-02 08:30:00' };
    const itemB = { orden_id: 2, proveedor_id: 1, material_id: 1, cantidad: 200, fecha_emision: '2026-10-10 11:15:00' };
    const result = esDuplicado(itemA, itemB);
    assert.equal(result, false);
  });

  it('NO detecta duplicado si es la misma orden', () => {
    const itemA = { orden_id: 1, proveedor_id: 1, material_id: 1, cantidad: 200, fecha_emision: '2026-10-02 08:30:00' };
    const result = esDuplicado(itemA, itemA);
    assert.equal(result, false);
  });

  it('detecta OC-1041 vs OC-1042 como duplicadas en la BD', () => {
    const resultado = detectarOrdenesDuplicadas();
    assert.ok(resultado.duplicados_detectados.length > 0, 'Debe detectar al menos un duplicado');
    const dup = resultado.duplicados_detectados.find(
      d => d.orden_original === 'OC-1041' && d.orden_sospechosa === 'OC-1042'
    );
    assert.ok(dup, 'Debe encontrar OC-1041 vs OC-1042');
  });

  it('calcula la fuga total estimada', () => {
    const resultado = detectarOrdenesDuplicadas();
    assert.ok(resultado.total_fuga_estimada > 0, 'La fuga estimada debe ser > 0');
  });

  it('detecta duplicado con variacion de cantidad dentro del 5%', () => {
    const itemA = { orden_id: 1, proveedor_id: 1, material_id: 1, cantidad: 200, fecha_emision: '2026-10-02 08:30:00' };
    const itemB = { orden_id: 2, proveedor_id: 1, material_id: 1, cantidad: 205, fecha_emision: '2026-10-02 11:15:00' };
    const result = esDuplicado(itemA, itemB);
    assert.ok(result, 'Debe detectar duplicado con variacion del 2.5%');
  });

  it('NO detecta duplicado si variacion de cantidad excede 5%', () => {
    const itemA = { orden_id: 1, proveedor_id: 1, material_id: 1, cantidad: 200, fecha_emision: '2026-10-02 08:30:00' };
    const itemB = { orden_id: 2, proveedor_id: 1, material_id: 1, cantidad: 220, fecha_emision: '2026-10-02 11:15:00' };
    const result = esDuplicado(itemA, itemB);
    assert.equal(result, false);
  });

  it('permite configurar ventana de horas personalizada', () => {
    const itemA = { orden_id: 1, proveedor_id: 1, material_id: 1, cantidad: 200, fecha_emision: '2026-10-02 08:30:00' };
    const itemB = { orden_id: 2, proveedor_id: 1, material_id: 1, cantidad: 200, fecha_emision: '2026-10-05 09:30:00' };
    const result72 = esDuplicado(itemA, itemB, { maxHoras: 72 });
    assert.equal(result72, false, 'No duplicado si excede 72h');
    const result96 = esDuplicado(itemA, itemB, { maxHoras: 96 });
    assert.ok(result96, 'Duplicado en 96h');
  });
});
