const pad = (n: number) => String(n).padStart(2, '0');

/** ISO -> valor aceito por <input type="datetime-local"> (horário local) */
export function toLocalInput(iso: string | Date) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** valor de datetime-local -> ISO 8601 (UTC) */
export function fromLocalInput(value: string) {
  return new Date(value).toISOString();
}

export const formatDay = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit' });

export const formatMonth = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');

export const formatWeekday = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { weekday: 'long' });

export const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

export const formatFullDate = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

export function durationLabel(start: string, end: string) {
  const minutes = Math.round((+new Date(end) - +new Date(start)) / 60000);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m}min`;
  return m ? `${h}h${pad(m)}` : `${h}h`;
}

export function isToday(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

export function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}
