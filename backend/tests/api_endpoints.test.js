const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');

process.env.DB_FILE = ':memory:';
process.env.PORT = '0';

const { initDatabase } = require('../src/config/database');

before(() => {
  initDatabase();
});

const app = require('../server');

// Helper para simular peticiones HTTP sin red
function makeRequest(method, url, body = null) {
  return new Promise((resolve) => {
    const { Readable } = require('stream');
    const urlObj = new URL(url, 'http://localhost');

    const req = new Readable({ read() {} });
    req.method = method;
    req.url = urlObj.pathname + urlObj.search;
    req.headers = { 'content-type': 'application/json', host: 'localhost' };
    req.query = Object.fromEntries(urlObj.searchParams);
    req.params = {};

    if (body) {
      req.body = body;
    }

    const res = {
      statusCode: 200,
      _headers: {},
      _body: '',
      status(code) { this.statusCode = code; return this; },
      json(data) { this._body = JSON.stringify(data); this._headers['content-type'] = 'application/json'; this.end(); },
      setHeader(k, v) { this._headers[k] = v; },
      getHeader(k) { return this._headers[k]; },
      end() {
        resolve({
          status: this.statusCode,
          body: this._body ? JSON.parse(this._body) : null
        });
      }
    };

    app.handle(req, res);
  });
}

describe('API Endpoints', () => {
  it('GET /api/health retorna status OK', async () => {
    const res = await makeRequest('GET', 'http://localhost/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'OK');
  });

  it('GET /api/materiales retorna lista de materiales', async () => {
    const res = await makeRequest('GET', 'http://localhost/api/materiales');
    assert.equal(res.status, 200);
    assert.ok(res.body.total > 0);
    assert.ok(Array.isArray(res.body.materiales));
  });

  it('GET /api/materiales/1/stock retorna stock del cemento', async () => {
    const res = await makeRequest('GET', 'http://localhost/api/materiales/1/stock');
    assert.equal(res.status, 200);
    assert.equal(res.body.material_id, 1);
    assert.equal(res.body.codigo_estandar, 'MAT-CEM-01');
    assert.ok('stock_actual' in res.body);
    assert.ok('punto_reorden' in res.body);
  });

  it('GET /api/materiales/9999/stock retorna 404', async () => {
    const res = await makeRequest('GET', 'http://localhost/api/materiales/9999/stock');
    assert.equal(res.status, 404);
  });

  it('GET /api/alertas/reorden retorna alertas activas', async () => {
    const res = await makeRequest('GET', 'http://localhost/api/alertas/reorden');
    assert.equal(res.status, 200);
    assert.ok('total_alertas_activas' in res.body);
    assert.ok(Array.isArray(res.body.alertas));
  });

  it('GET /api/ordenes/posibles-duplicados detecta OC-1041 vs OC-1042', async () => {
    const res = await makeRequest('GET', 'http://localhost/api/ordenes/posibles-duplicados');
    assert.equal(res.status, 200);
    assert.ok(res.body.duplicados_detectados.length > 0);
    const dup = res.body.duplicados_detectados.find(
      d => d.orden_original === 'OC-1041' && d.orden_sospechosa === 'OC-1042'
    );
    assert.ok(dup, 'Debe detectar OC-1041 vs OC-1042');
  });

  it('GET /api/ordenes retorna lista de ordenes', async () => {
    const res = await makeRequest('GET', 'http://localhost/api/ordenes');
    assert.equal(res.status, 200);
    assert.ok(res.body.total > 0);
  });

  it('GET /api/movimientos retorna movimientos', async () => {
    const res = await makeRequest('GET', 'http://localhost/api/movimientos');
    assert.equal(res.status, 200);
    assert.ok(res.body.total > 0);
  });
});
