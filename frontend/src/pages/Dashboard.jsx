import React, { useState, useEffect } from 'react';
import KpiCards from '../components/dashboard/KpiCards';
import StockChart from '../components/dashboard/StockChart';
import RecentMovementsTable from '../components/dashboard/RecentMovementsTable';
import AlertBanner from '../components/dashboard/AlertBanner';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { getMateriales } from '../services/materialsService';
import { getMovimientos } from '../services/movementsService';
import { getAlertasReorden } from '../services/alertsService';
import { getPosiblesDuplicados } from '../services/ordersService';
import { formatNumber } from '../utils/formatters';
import { AlertTriangle, Package, Activity } from 'lucide-react';

function Dashboard({ onNavigate }) {
  const [materiales, setMateriales] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [duplicados, setDuplicados] = useState({ duplicados_detectados: [], total_fuga_estimada: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [matRes, movRes, alertRes, dupRes] = await Promise.all([
          getMateriales(),
          getMovimientos({ limit: 5 }),
          getAlertasReorden(),
          getPosiblesDuplicados()
        ]);
        setMateriales(matRes.materiales || []);
        setMovimientos(movRes.movimientos || []);
        setAlertas(alertRes.alertas || []);
        setDuplicados(dupRes);
      } catch (err) {
        console.error('Error loading dashboard:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">Error al cargar datos: {error}. Asegúrese de que el servidor backend esté corriendo en el puerto 3000.</div>;
  }

  const criticalMaterials = materiales.filter(m => m.estado === 'CRITICO');

  return (
    <div className="dashboard-page">
      <KpiCards materiales={materiales} alertas={alertas} duplicados={duplicados} />

      {duplicados.duplicados_detectados.length > 0 && (
        <AlertBanner duplicados={duplicados.duplicados_detectados} />
      )}

      {criticalMaterials.length > 0 && (
        <div className="section">
          <h2 className="section-title">
            <AlertTriangle size={20} />
            Alertas Activas de Reposición
          </h2>
          <div className="health-cards-grid">
            {criticalMaterials.map(mat => (
              <Card key={mat.material_id} variant="critical" className="health-card">
                <div className="health-card-header">
                  <Package size={20} />
                  <span className="health-card-title">{mat.descripcion}</span>
                  <Badge variant="critical" pulse>Crítico</Badge>
                </div>
                <div className="health-card-body">
                  <div className="health-stat">
                    <span className="health-label">Stock Actual</span>
                    <span className="health-value">{formatNumber(mat.stock_actual)} {mat.unidad}</span>
                  </div>
                  <div className="health-stat">
                    <span className="health-label">Punto Reorden</span>
                    <span className="health-value">{formatNumber(mat.punto_reorden)}</span>
                  </div>
                  <div className="health-stat deficit">
                    <span className="health-label">Déficit</span>
                    <span className="health-value">-{formatNumber(mat.punto_reorden - mat.stock_actual)} {mat.unidad}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="dashboard-grid">
        <div className="chart-section">
          <Card title="Stock Actual vs Punto de Reorden" icon={<Activity size={18} />}>
            <StockChart materiales={materiales} />
          </Card>
        </div>
        <div className="movements-section">
          <Card title="Movimientos Recientes">
            <RecentMovementsTable movimientos={movimientos} />
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

