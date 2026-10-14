import type { AppointmentStatus } from '../types/appointment';

const map: Record<AppointmentStatus, { label: string; cls: string; dot: string }> = {
  scheduled: { label: 'Agendado', cls: 'bg-brand-50 text-brand-700 ring-brand-200', dot: 'bg-brand-500' },
  completed: { label: 'Concluído', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200', dot: 'bg-emerald-500' },
  cancelled: { label: 'Cancelado', cls: 'bg-rose-50 text-rose-700 ring-rose-200', dot: 'bg-rose-500' },
};

export const statusLabel = (s: AppointmentStatus) => map[s].label;

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  const s = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${s.cls}`}>
      <span className={`size-1.5 rounded-full ${s.dot} ${status === 'scheduled' ? 'animate-pulse' : ''}`} />
      {s.label}
    </span>
  );
}
