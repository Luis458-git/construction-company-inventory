const API_BASE = '/api';

export async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...options
  };
  const response = await fetch(url, config);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ mensaje: 'Error desconocido' }));
    throw new Error(error.mensaje || `HTTP ${response.status}`);
  }
  return response.json();
}

