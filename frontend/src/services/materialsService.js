import { fetchAPI } from './api';

export function getMateriales() {
  return fetchAPI('/materiales');
}

export function getMaterialStock(id) {
  return fetchAPI(`/materiales/${id}/stock`);
}

