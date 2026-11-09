import React, { useState, useEffect } from 'react';

const pageTitles = {
  dashboard: '📊 Dashboard General',
  inventory: '📦 Inventario de Materiales',
  movements: '🔄 Movimientos & Trazabilidad',
  orders: '🔍 Auditoría de Fugas (OC)',
  alerts: '⚠️ Alertas de Reorden',
};

function Navbar({ activeTab }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="navbar">
      <h2 className="navbar-title">{pageTitles[activeTab] || 'Dashboard'}</h2>
      <div className="navbar-right">
        <div className="navbar-status">
          <span className="navbar-status-dot"></span>
          Sistema Activo
        </div>
        <span className="navbar-time">
          {time.toLocaleDateString('es-CR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          {' · '}
          {time.toLocaleTimeString('es-CR')}
        </span>
      </div>
    </header>
  );
}

export default Navbar;

