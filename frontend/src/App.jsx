import React, { useState } from 'react';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Movements from './pages/Movements';
import PurchaseOrders from './pages/PurchaseOrders';
import Alerts from './pages/Alerts';
import { InventoryProvider } from './context/InventoryContext';
import { NotificationProvider } from './context/NotificationContext';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard onNavigate={setActiveTab} />;
      case 'inventory': return <Inventory />;
      case 'movements': return <Movements />;
      case 'orders': return <PurchaseOrders />;
      case 'alerts': return <Alerts />;
      default: return <Dashboard onNavigate={setActiveTab} />;
    }
  };

  return (
    <NotificationProvider>
      <InventoryProvider>
        <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
          {renderPage()}
        </Layout>
      </InventoryProvider>
    </NotificationProvider>
  );
}

export default App;
