import React from 'react';
import Badge from '../ui/Badge';

function RecentMovementsTable({ movimientos }) {
  if (!movimientos || movimientos.length === 0) {
    return <p className="text-muted text-center">No hay movimientos recientes.</p>;
  }

  const getTypeBadge = (tipo) => {
    switch (tipo) {
      case 'ENTRADA': return <Badge variant="success">Entrada</Badge>;
      case 'SALIDA': return <Badge variant="critical">Salida</Badge>;
      case 'TRASLADO': return <Badge variant="info">Traslado</Badge>;
      default: return <Badge variant="default">{tipo}</Badge>;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('es-CR', {
      month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Material</th>
            <th>Tipo</th>
            <th>Cantidad</th>
            <th>Bodega</th>
            <th>Doc. Ref.</th>
          </tr>
        </thead>
        <tbody>
          {movimientos.map((mov, idx) => (
            <tr key={mov.movimiento_id || idx}>
              <td>{formatDate(mov.fecha_registro)}</td>
              <td>{mov.material_descripcion || mov.codigo_estandar || `Mat #${mov.material_id}`}</td>
              <td>{getTypeBadge(mov.tipo_movimiento)}</td>
              <td><strong>{Number(mov.cantidad).toLocaleString()}</strong></td>
              <td>{mov.bodega_origen || '—'}</td>
              <td><code>{mov.documento_referencia || '—'}</code></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RecentMovementsTable;

