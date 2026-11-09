import { useState, useEffect, useCallback } from 'react';
import { getMovimientos, registrarMovimiento } from '../services/movementsService';

export function useMovements(limit = 50) {
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMovements = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMovimientos({ limit });
      setMovimientos(data.movimientos || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchMovements();
  }, [fetchMovements]);

  return { movimientos, loading, error, refetch: fetchMovements, registrarMovimiento };
}

