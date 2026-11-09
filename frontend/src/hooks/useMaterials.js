import { useState, useEffect, useCallback } from 'react';
import { getMateriales, getMaterialStock } from '../services/materialsService';

export function useMaterials() {
  const [materiales, setMateriales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMateriales();
      setMateriales(data.materiales || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  return { materiales, loading, error, refetch: fetchMaterials, getMaterialStock };
}

