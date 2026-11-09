import { fetchAPI } from './api';

export function getMovimientos(params = {}) {
  const query = new URLSearchParams(params).toString();
  return fetchAPI(`/movimientos${query ? '?' + query : ''}`);
}

export function registrarMovimiento(data) {
  return fetchAPI('/movimientos', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

