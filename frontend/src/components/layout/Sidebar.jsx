import React from 'react';
import { HardHat, LayoutDashboard, Package, ArrowLeftRight, ShoppingCart, Bell } from 'lucide-react';

const navItems = [
  { key: 'dashboard', label: 'Dashboard General', icon: LayoutDashboard },
  { key: 'inventory', label: 'Inventario de Materiales', icon: Package },
  { key: 'movements', label: 'Movimientos & Trazabilidad', icon: ArrowLeftRight },
  { key: 'orders', label: 'Auditoría de Fugas (OC)', icon: ShoppingCart },
  { key: 'alerts', label: 'Alertas de Reorden', icon: Bell },
];

function Sidebar({ activeTab, setActiveTab }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <HardHat size={28} />
          <h1>Constructora Del Valle S.A.</h1>
        </div>
        <div className="sidebar-badge">
          <span className="sidebar-badge-dot"></span>
          v2.4 Live
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              className={`sidebar-nav-item ${activeTab === item.key ? 'active' : ''}`}
              onClick={() => setActiveTab(item.key)}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        Sistema de Control de Inventario v2.4
      </div>
    </aside>
  );
}

export default Sidebar;

