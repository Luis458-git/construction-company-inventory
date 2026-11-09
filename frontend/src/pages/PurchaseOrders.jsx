import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { getOrdenes, getPosiblesDuplicados, aprobarOrden, anularOrden } from '../services/ordersService';
import { formatCurrency, formatDate } from '../utils/formatters';
import { ShieldAlert, CheckCircle, XCircle } from 'lucide-react';

function PurchaseOrders() {
  const [ordenes, setOrdenes] = useState([]);
  const [duplicados, setDuplicados] = useState({ duplicados_detectados: [], total_fuga_estimada: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  async function loadData() {
    try {
      const [ordRes, dupRes] = await Promise.all([
        getOrdenes(),
        getPosiblesDuplicados()
      ]);
      setOrdenes(ordRes.ordenes || []);
      setDuplicados(dupRes);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  const handleAprobar = async (id, numOc) => {
    try {
      await aprobarOrden(id);
      setSuccessMsg(`Orden ${numOc} aprobada exitosamente.`);
      await loadData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleAnular = async (id, numOc) => {
    try {
      await anularOrden(id);
      setSuccessMsg(`Orden ${numOc} anulada. Fuga prevenida.`);
      await loadData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case 'APROBADA': return <Badge variant="success">Aprobada</Badge>;
      case 'PENDIENTE': return <Badge variant="warning">Pendiente</Badge>;
      case 'PENDIENTE_APROBACION': return <Badge variant="warning" pulse>Pend. Aprobación</Badge>;
      case 'ANULADA': return <Badge variant="critical">Anulada</Badge>;
      default: return <Badge>{estado}</Badge>;
    }
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner"></div><p>Cargando órdenes...</p></div>;
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1 className="page-title">Auditoría de Fugas — Órdenes de Compra</h1>
      </div>

      {successMsg && <div className="toast-success">{successMsg}</div>}
      {error && <div className="error-message">{error}</div>}

      {/* Sección de Duplicados */}
      {duplicados.duplicados_detectados.length > 0 && (
        <div className="section">
          <h2 className="section-title">
            <ShieldAlert size={20} className="text-critical" />
            Compras Duplicadas Detectadas
          </h2>
          <p className="mb-2 text-muted">
            Fuga total estimada: <strong className="text-critical">{formatCurrency(duplicados.total_fuga_estimada)}</strong>
          </p>

          {duplicados.duplicados_detectados.map((dup, idx) => (
            <div key={idx} className="duplicate-pair">
              <div className="duplicate-pair-header">
                <ShieldAlert size={16} />
                {dup.orden_original} vs {dup.orden_sospechosa} — {dup.articulo}
              </div>
              <div className="duplicate-details">
                <div className="duplicate-detail-item">
                  <strong>Proveedor:</strong> {dup.proveedor}
                </div>
                <div className="duplicate-detail-item">
                  <strong>Artículo:</strong> {dup.articulo} ({dup.codigo_articulo})
                </div>
                <div className="duplicate-detail-item">
                  <strong>Cantidad Original:</strong> {dup.cantidad} | <strong>Sospechosa:</strong> {dup.cantidad_sospechosa || dup.cantidad}
                </div>
                <div className="duplicate-detail-item">
                  <strong>Diferencia:</strong> {dup.diferencia_horas}h | <strong>Fuga:</strong> <span className="text-critical">{formatCurrency(dup.fuga_potencial_monto)}</span>
                </div>
              </div>
              <div className="duplicate-actions">
                <Button variant="success" size="sm" onClick={() => handleAprobar(dup.orden_original_id, dup.orden_original)}>
                  <CheckCircle size={14} /> Aprobar {dup.orden_original}
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleAnular(dup.orden_sospechosa_id, dup.orden_sospechosa)}>
                  <XCircle size={14} /> Anular {dup.orden_sospechosa}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tabla de Órdenes */}
      <Card title="Todas las Órdenes de Compra">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>N° OC</th>
                <th>Proveedor</th>
                <th>Fecha Emisión</th>
                <th>Área Solicitante</th>
                <th>Monto Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ordenes.length === 0 ? (
                <tr><td colSpan={7} className="table-empty">No hay órdenes registradas.</td></tr>
              ) : (
                ordenes.map(orden => (
                  <tr key={orden.id}>
                    <td><strong>{orden.numero_oc}</strong></td>
                    <td>{orden.proveedor_nombre}</td>
                    <td>{formatDate(orden.fecha_emision)}</td>
                    <td>{orden.area_solicitante}</td>
                    <td><strong>{formatCurrency(orden.monto_total)}</strong></td>
                    <td>{getEstadoBadge(orden.estado)}</td>
                    <td>
                      {(orden.estado === 'PENDIENTE' || orden.estado === 'PENDIENTE_APROBACION') && (
                        <div className="flex gap-1">
                          <Button variant="success" size="sm" onClick={() => handleAprobar(orden.id, orden.numero_oc)}>
                            Aprobar
                          </Button>
                          <Button variant="danger" size="sm" onClick={() => handleAnular(orden.id, orden.numero_oc)}>
                            Anular
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default PurchaseOrders;

