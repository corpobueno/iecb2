type Status = 'pendente' | 'autorizado' | 'separacao' | 'pronto' | 'finalizado' | 'cancelado' | 'entrada' | 'ajuste';

export function handleStatus(status: Status): Status | null {
  switch (status) {
    case 'cancelado': return 'pendente';
    case 'entrada': return 'cancelado';
    case 'pendente': return 'autorizado';
    case 'autorizado': return 'separacao';
    case 'separacao': return 'pronto';
    case 'pronto': return 'finalizado';
    case 'finalizado': return 'pronto';
    default: return null;
  }
}

export function handleStatusLite(status: Status): Status | null {
  switch (status) {
    case 'pendente':
      return 'pronto';
    case 'pronto':
      return 'finalizado';
    case 'cancelado':
      return 'pronto';
    case 'finalizado':
      return 'pronto';
    default:
      return null;
  }
}