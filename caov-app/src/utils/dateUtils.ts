// ============================================================
// CAOV — Date Utilities
// ============================================================

export function formatMatchDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-AR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semana${Math.floor(diffDays/7) > 1 ? 's' : ''}`;
  return formatDate(dateStr);
}

export function isPast(dateStr: string): boolean {
  return new Date(dateStr) < new Date();
}

export function isFuture(dateStr: string): boolean {
  return new Date(dateStr) > new Date();
}

export function formatMonth(month: number, year: number): string {
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
}
