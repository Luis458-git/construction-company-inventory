import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { getMateriales } from '../services/materialsService';
import { getStatusColor, getStatusLabel, formatNumber } from '../utils/formatters';
import { Search, Package } from 'lucide-react';

function Inventory() {
  const [materiales, setMateriales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todos');

  useEffect(() => {
    async function load() {
      try {
        const res = await getMateriales();
        setMateriales(res.materiales || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div className="loading-container"><div className="spinner"></div><p>Cargando inventario...</p></div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  const categories = ['Todos', ...new Set(materiales.map(m => m.categoria).filter(Boolean))];

  const filtered = materiales.filter(m => {
    const matchSearch = search === '' ||
      (m.descripcion && m.descripcion.toLowerCase().includes(search.toLowerCase())) ||
      (m.codigo_estandar && m.codigo_estandar.toLowerCase().includes(search.toLowerCase()));
    const matchCategory = categoryFilter === 'Todos' || m.categoria === categoryFilter;
    return matchSearch && matchCategory;
  });

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1 className="page-title">Inventario de Materiales</h1>
        <Badge variant="info">{materiales.length} materiales registrados</Badge>
      </div>

      <div className="filters-bar">
        <div className="search-wrapper">
          <Search size={16} />
          <input
            className="search-input"
            type="text"
            placeholder="Buscar por código o descripción..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="filter-select"
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <Card>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Descripción</th>
                <th>Categoría</th>
                <th>Unidad</th>
                <th>Stock Actual</th>
                <th>PR</th>
                <th>SS</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="table-empty">No se encontraron materiales.</td></tr>
              ) : (
                filtered.map(mat => (
                  <tr key={mat.material_id}>
                    <td><code>{mat.codigo_estandar}</code></td>
                    <td><strong>{mat.descripcion}</strong></td>
                    <td>{mat.categoria}</td>
                    <td>{mat.unidad}</td>
                    <td>
                      <strong className={mat.estado === 'CRITICO' ? 'text-critical' : ''}>
                        {formatNumber(mat.stock_actual)}
                      </strong>
                    </td>
                    <td>{formatNumber(mat.punto_reorden)}</td>
                    <td>{formatNumber(mat.stock_seguridad)}</td>
                    <td>
                      <Badge variant={getStatusColor(mat.estado)} pulse={mat.estado === 'CRITICO'}>
                        {getStatusLabel(mat.estado)}
                      </Badge>
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

export default Inventory;

