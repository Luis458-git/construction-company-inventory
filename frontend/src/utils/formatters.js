export function formatCurrency(amount) {
  return '¢' + Number(amount).toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatDate(dateString) {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-CR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  });
}

export function formatNumber(num) {
  return Number(num).toLocaleString('es-CR');
}

export function getStatusColor(estado) {
  switch (estado) {
    case 'CRITICO': return 'critical';
    case 'PROXIMO_A_REORDEN': return 'warning';
    case 'OK': return 'success';
    default: return 'info';
  }
}

export function getStatusLabel(estado) {
  switch (estado) {
    case 'CRITICO': return 'Crítico';
    case 'PROXIMO_A_REORDEN': return 'Próximo a Reorden';
    case 'OK': return 'Conforme';
    default: return estado;
  }
}

