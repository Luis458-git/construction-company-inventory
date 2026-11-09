import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMateriales } from '../services/materialsService';
import { getAlertasReorden } from '../services/alertsService';
import { getPosiblesDuplicados } from '../services/ordersService';

const InventoryContext = createContext();

export function InventoryProvider({ children }) {
  const [materiales, setMateriales] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [duplicados, setDuplicados] = useState({ duplicados_detectados: [], total_fuga_estimada: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const [matRes, alertRes, dupRes] = await Promise.all([
        getMateriales(),
        getAlertasReorden(),
        getPosiblesDuplicados()
      ]);
      setMateriales(matRes.materiales || []);
      setAlertas(alertRes.alertas || []);
      setDuplicados(dupRes || { duplicados_detectados: [], total_fuga_estimada: 0 });
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return (
    <InventoryContext.Provider value={{ materiales, alertas, duplicados, loading, error, refreshData }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory debe ser usado dentro de un InventoryProvider');
  }
  return context;
}

