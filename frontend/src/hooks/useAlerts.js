import { useState, useEffect, useCallback } from 'react';
import { getAlertasReorden, resolverAlerta } from '../services/alertsService';

export function useAlerts() {
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAlertasReorden();
      setAlertas(data.alertas || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  return { alertas, loading, error, refetch: fetchAlerts, resolverAlerta };
}

