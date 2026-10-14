import { CalendarCheck2, CalendarClock, CalendarDays, CalendarX2 } from 'lucide-react';
import type { Appointment } from '../types/appointment';
import { isToday } from '../utils/format';

export function StatsCards({ items }: { items: Appointment[] }) {
  const scheduled = items.filter((a) => a.status === 'scheduled');
  const stats = [
    {
      label: 'Hoje',
      value: scheduled.filter((a) => isToday(a.startsAt)).length,
      icon: CalendarDays,
      tint: 'from-brand-500 to-violet-500',
      glow: 'bg-brand-400',
    },
    { label: 'Agendados', value: scheduled.length, icon: CalendarClock, tint: 'from-sky-500 to-cyan-400', glow: 'bg-sky-400' },
    {
      label: 'Concluídos',
      value: items.filter((a) => a.status === 'completed').length,
      icon: CalendarCheck2,
      tint: 'from-emerald-500 to-teal-400',
      glow: 'bg-emerald-400',
    },
    {
      label: 'Cancelados',
      value: items.filter((a) => a.status === 'cancelled').length,
      icon: CalendarX2,
      tint: 'from-rose-500 to-pink-400',
      glow: 'bg-rose-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {stats.map((s, i) => (
        <div
          key={s.label}
          style={{ animationDelay: `${i * 60}ms` }}
          className="glass group relative animate-slide-up overflow-hidden rounded-2xl p-4 transition hover:-translate-y-0.5 sm:p-5"
        >
          <div className={`absolute -top-8 -right-8 size-24 rounded-full ${s.glow} opacity-10 blur-2xl transition group-hover:opacity-25`} />
          <div className={`mb-3 inline-flex size-10 items-center justify-center rounded-xl bg-linear-to-br ${s.tint} text-white shadow-lg`}>
            <s.icon className="size-5" />
          </div>
          <p className="text-3xl font-extrabold tracking-tight text-slate-900 tabular-nums">{s.value}</p>
          <p className="text-sm font-medium text-slate-500">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
