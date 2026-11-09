import { fetchAPI } from './api';

export function getAlertasReorden() {
  return fetchAPI('/alertas/reorden');
}

export function resolverAlerta(id) {
  return fetchAPI(`/alertas/${id}/resolver`, { method: 'PUT' });
}

