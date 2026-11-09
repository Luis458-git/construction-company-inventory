import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { getMovimientos, registrarMovimiento } from '../services/movementsService';
import { getMateriales } from '../services/materialsService';
import { formatDate } from '../utils/formatters';
import { Plus } from 'lucide-react';

function Movements() {
  const [movimientos, setMovimientos] = useState([]);
  const [materiales, setMateriales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [form, setForm] = useState({
    material_id: '',
    tipo_movimiento: 'ENTRADA',
    cantidad: '',
    bodega_origen: 'Bodega Central',
    bodega_destino: '',
    documento_referencia: '',
    usuario_id: 'usr_admin'
  });

  async function loadData() {
    try {
      const [movRes, matRes] = await Promise.all([
        getMovimientos({ limit: 50 }),
        getMateriales()
      ]);
      setMovimientos(movRes.movimientos || []);
      setMateriales(matRes.materiales || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        material_id: Number(form.material_id),
        cantidad: Number(form.cantidad)
      };
      await registrarMovimiento(payload);
      setShowModal(false);
      setSuccessMsg('Movimiento registrado exitosamente.');
      setForm({ material_id: '', tipo_movimiento: 'ENTRADA', cantidad: '', bodega_origen: 'Bodega Central', bodega_destino: '', documento_referencia: '', usuario_id: 'usr_admin' });
      await loadData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getTypeBadge = (tipo) => {
    switch (tipo) {
      case 'ENTRADA': return <Badge variant="success">Entrada</Badge>;
      case 'SALIDA': return <Badge variant="critical">Salida</Badge>;
      case 'TRASLADO': return <Badge variant="info">Traslado</Badge>;
      case 'AJUSTE': return <Badge variant="warning">Ajuste</Badge>;
      case 'AJUSTE_POSITIVO': return <Badge variant="success">Ajuste +</Badge>;
      case 'AJUSTE_NEGATIVO': return <Badge variant="critical">Ajuste -</Badge>;
      default: return <Badge>{tipo}</Badge>;
    }
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner"></div><p>Cargando movimientos...</p></div>;
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1 className="page-title">Movimientos & Trazabilidad</h1>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={16} /> Registrar Movimiento
        </Button>
      </div>

      {successMsg && <div className="toast-success">{successMsg}</div>}
      {error && <div className="error-message">{error}</div>}

      <Card>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>Material</th>
                <th>Tipo</th>
                <th>Cantidad</th>
                <th>Bodega Origen</th>
                <th>Bodega Destino</th>
                <th>Doc. Ref.</th>
                <th>Usuario</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.length === 0 ? (
                <tr><td colSpan={9} className="table-empty">No hay movimientos registrados.</td></tr>
              ) : (
                movimientos.map((mov, idx) => (
                  <tr key={mov.movimiento_id || idx}>
                    <td>{mov.movimiento_id}</td>
                    <td>{formatDate(mov.fecha_registro)}</td>
                    <td><strong>{mov.material_descripcion || `Material #${mov.material_id}`}</strong></td>
                    <td>{getTypeBadge(mov.tipo_movimiento)}</td>
                    <td><strong>{Number(mov.cantidad).toLocaleString()}</strong></td>
                    <td>{mov.bodega_origen || '—'}</td>
                    <td>{mov.bodega_destino || '—'}</td>
                    <td><code>{mov.documento_referencia || '—'}</code></td>
                    <td>{mov.usuario_id}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Registrar Movimiento">
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Material</label>
              <select className="form-select" name="material_id" value={form.material_id} onChange={handleChange} required>
                <option value="">Seleccionar material...</option>
                {materiales.map(m => (
                  <option key={m.material_id} value={m.material_id}>
                    {m.codigo_estandar} — {m.descripcion}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Tipo de Movimiento</label>
              <select className="form-select" name="tipo_movimiento" value={form.tipo_movimiento} onChange={handleChange}>
                <option value="ENTRADA">Entrada</option>
                <option value="SALIDA">Salida</option>
                <option value="TRASLADO">Traslado</option>
                <option value="AJUSTE_POSITIVO">Ajuste Positivo</option>
                <option value="AJUSTE_NEGATIVO">Ajuste Negativo</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Cantidad</label>
              <input className="form-input" type="number" name="cantidad" min="1" value={form.cantidad} onChange={handleChange} required placeholder="Ej: 100" />
            </div>
            <div className="form-group">
              <label className="form-label">Bodega Origen</label>
              <input className="form-input" type="text" name="bodega_origen" value={form.bodega_origen} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Bodega Destino</label>
              <input className="form-input" type="text" name="bodega_destino" value={form.bodega_destino} onChange={handleChange} placeholder="Ej: Obra Torre Los Álamos" />
            </div>
            <div className="form-group">
              <label className="form-label">Documento Referencia</label>
              <input className="form-input" type="text" name="documento_referencia" value={form.documento_referencia} onChange={handleChange} placeholder="Ej: OC-1041, VALE-890" />
            </div>
            <div className="form-group">
              <label className="form-label">Usuario ID</label>
              <input className="form-input" type="text" name="usuario_id" value={form.usuario_id} onChange={handleChange} required />
            </div>
          </div>
          <div className="modal-footer">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Registrando...' : 'Registrar Movimiento'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Movements;

