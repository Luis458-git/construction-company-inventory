import { fetchAPI } from './api';

export function getOrdenes() {
  return fetchAPI('/ordenes');
}

export function getPosiblesDuplicados() {
  return fetchAPI('/ordenes/posibles-duplicados');
}

export function crearOrden(data) {
  return fetchAPI('/ordenes', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export function aprobarOrden(id) {
  return fetchAPI(`/ordenes/${id}/aprobar`, { method: 'PUT' });
}

export function anularOrden(id) {
  return fetchAPI(`/ordenes/${id}/anular`, { method: 'PUT' });
}

