import React from 'react';
import { Warehouse, AlertTriangle, TrendingDown, Copy } from 'lucide-react';
import Badge from '../ui/Badge';

function formatCurrency(amount) {
  return '¢' + Number(amount).toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function KpiCards({ materiales, alertas, duplicados }) {
  const stockTotal = materiales.reduce((acc, m) => acc + (m.stock_actual || 0), 0);
  const materialesCriticos = materiales.filter(m => m.estado === 'CRITICO').length;
  const fugaTotal = duplicados?.total_fuga_estimada || 0;
  const totalDuplicados = duplicados?.duplicados_detectados?.length || 0;

  return (
    <div className="kpi-grid">
      <div className="kpi-card">
        <div className="kpi-card-header">
          <div className="kpi-icon blue"><Warehouse size={20} /></div>
        </div>
        <div className="kpi-value">{stockTotal.toLocaleString('es-CR')}</div>
        <div className="kpi-label">Stock Total en Bodegas</div>
      </div>

      <div className="kpi-card">
        <div className="kpi-card-header">
          <div className="kpi-icon red"><AlertTriangle size={20} /></div>
          {materialesCriticos > 0 && (
            <Badge variant="critical" pulse>Atención requerida</Badge>
          )}
        </div>
        <div className="kpi-value">{materialesCriticos}</div>
        <div className="kpi-label">Materiales Críticos (Bajo PR)</div>
      </div>

      <div className="kpi-card">
        <div className="kpi-card-header">
          <div className="kpi-icon amber"><TrendingDown size={20} /></div>
        </div>
        <div className="kpi-value">{formatCurrency(fugaTotal)}</div>
        <div className="kpi-label">Fuga de Valor Detectada (Mes)</div>
      </div>

      <div className="kpi-card">
        <div className="kpi-card-header">
          <div className="kpi-icon red"><Copy size={20} /></div>
          {totalDuplicados > 0 && (
            <Badge variant="critical" pulse>Riesgo Alto</Badge>
          )}
        </div>
        <div className="kpi-value">{totalDuplicados}</div>
        <div className="kpi-label">Órdenes Duplicadas Detectadas</div>
      </div>
    </div>
  );
}

export default KpiCards;

