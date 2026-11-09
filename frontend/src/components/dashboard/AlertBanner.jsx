import React from 'react';
import { ShieldAlert } from 'lucide-react';
import Button from '../ui/Button';

function formatCurrency(amount) {
  return '¢' + Number(amount).toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function AlertBanner({ duplicados }) {
  if (!duplicados || duplicados.length === 0) return null;

  return (
    <div className="alert-banner">
      <div className="alert-banner-header">
        <ShieldAlert size={22} />
        <span className="alert-banner-title">
          🚨 Compra Duplicada Detectada — Fuga de Valor Potencial
        </span>
      </div>

      {duplicados.map((dup, idx) => (
        <div key={idx} className="alert-banner-comparison">
          <div className="alert-banner-order">
            <h4>{dup.orden_original}</h4>
            <p><strong>Proveedor:</strong> {dup.proveedor}</p>
            <p><strong>Artículo:</strong> {dup.articulo}</p>
            <p><strong>Cantidad:</strong> {dup.cantidad} unidades</p>
            <p><strong>Fecha:</strong> {dup.fecha_original}</p>
          </div>
          <div className="alert-banner-vs">VS</div>
          <div className="alert-banner-order">
            <h4>{dup.orden_sospechosa}</h4>
            <p><strong>Proveedor:</strong> {dup.proveedor}</p>
            <p><strong>Artículo:</strong> {dup.articulo}</p>
            <p><strong>Cantidad:</strong> {dup.cantidad_sospechosa || dup.cantidad} unidades</p>
            <p><strong>Fecha:</strong> {dup.fecha_sospechosa}</p>
            <p className="text-critical"><strong>Fuga Potencial:</strong> {formatCurrency(dup.fuga_potencial_monto)}</p>
          </div>
        </div>
      ))}

      <div className="alert-banner-actions">
        <Button variant="success" size="sm">✅ Aprobar {duplicados[0]?.orden_original}</Button>
        <Button variant="danger" size="sm">❌ Anular Duplicado {duplicados[0]?.orden_sospechosa}</Button>
      </div>
    </div>
  );
}

export default AlertBanner;

