import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { getAlertasReorden, resolverAlerta } from '../services/alertsService';
import { formatDate, formatNumber } from '../utils/formatters';
import { Bell, CheckCircle } from 'lucide-react';

function Alerts() {
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  async function loadData() {
    try {
      const res = await getAlertasReorden();
      setAlertas(res.alertas || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  const handleResolver = async (id) => {
    try {
      await resolverAlerta(id);
      setSuccessMsg(`Alerta #${id} marcada como resuelta.`);
      await loadData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner"></div><p>Cargando alertas...</p></div>;
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1 className="page-title">Alertas de Reorden</h1>
        <Badge variant={alertas.length > 0 ? 'critical' : 'success'} pulse={alertas.length > 0}>
          {alertas.length} alertas activas
        </Badge>
      </div>

      {successMsg && <div className="toast-success">{successMsg}</div>}
      {error && <div className="error-message">{error}</div>}

      {alertas.length === 0 ? (
        <Card>
          <div className="text-center" style={{ padding: '40px' }}>
            <CheckCircle size={48} style={{ color: 'var(--success)', marginBottom: '12px' }} />
            <h3>Sin alertas activas</h3>
            <p className="text-muted">Todos los materiales están dentro de los niveles aceptables de stock.</p>
          </div>
        </Card>
      ) : (
        <Card title="Alertas Pendientes de Resolución" icon={<Bell size={18} />}>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Material</th>
                  <th>Código</th>
                  <th>Categoría</th>
                  <th>Stock al Disparar</th>
                  <th>Punto Reorden</th>
                  <th>Déficit</th>
                  <th>Fecha Alerta</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {alertas.map(alerta => {
                  const deficit = alerta.punto_reorden_calculado - alerta.stock_al_disparar;
                  return (
                    <tr key={alerta.alerta_id}>
                      <td>#{alerta.alerta_id}</td>
                      <td><strong>{alerta.descripcion}</strong></td>
                      <td><code>{alerta.codigo_estandar}</code></td>
                      <td>{alerta.categoria}</td>
                      <td className="text-critical"><strong>{formatNumber(alerta.stock_al_disparar)}</strong></td>
                      <td>{formatNumber(alerta.punto_reorden_calculado)}</td>
                      <td className="text-critical"><strong>-{formatNumber(deficit)} {alerta.unidad}</strong></td>
                      <td>{formatDate(alerta.fecha_alerta)}</td>
                      <td><Badge variant="critical" pulse>Pendiente</Badge></td>
                      <td>
                        <Button variant="success" size="sm" onClick={() => handleResolver(alerta.alerta_id)}>
                          <CheckCircle size={14} /> Resolver
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

export default Alerts;

