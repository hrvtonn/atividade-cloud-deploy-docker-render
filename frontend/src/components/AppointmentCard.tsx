import { useEffect, useRef, useState, type ReactElement } from 'react';
import { Check, Clock, Mail, MoreHorizontal, Pencil, StickyNote, Trash2, XCircle } from 'lucide-react';
import type { Appointment } from '../types/appointment';
import { StatusBadge } from './StatusBadge';
import { durationLabel, formatDay, formatMonth, formatTime, initials } from '../utils/format';

export type CardAction = 'edit' | 'complete' | 'cancel' | 'delete';

interface Props {
  appointment: Appointment;
  onAction: (action: CardAction, a: Appointment) => void;
  index: number;
}

const avatarColors = [
  'from-brand-500 to-violet-500',
  'from-sky-500 to-cyan-400',
  'from-fuchsia-500 to-pink-400',
  'from-amber-500 to-orange-400',
  'from-emerald-500 to-teal-400',
];

export function AppointmentCard({ appointment: a, onAction, index }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isScheduled = a.status === 'scheduled';
  const color = avatarColors[a.clientName.length % avatarColors.length];

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => !menuRef.current?.contains(e.target as Node) && setMenuOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuOpen]);

  const act = (action: CardAction) => {
    setMenuOpen(false);
    onAction(action, a);
  };

  return (
    <article
      style={{ animationDelay: `${Math.min(index, 10) * 40}ms` }}
      className={`group glass relative flex animate-slide-up gap-4 rounded-2xl p-4 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-900/5 sm:p-5 ${menuOpen ? 'z-20' : ''
        } ${!isScheduled ? 'opacity-75 hover:opacity-100' : ''}`}
    >
      {/* Data */}
      <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-slate-50 py-2 ring-1 ring-slate-100 sm:w-16">
        <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600">{formatMonth(a.startsAt)}</span>
        <span className="text-2xl leading-none font-extrabold text-slate-900">{formatDay(a.startsAt)}</span>
      </div>

      {/* Conteúdo */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className={`truncate text-base font-bold text-slate-900 ${a.status === 'cancelled' ? 'line-through decoration-slate-300' : ''}`}>
            {a.service}
          </h3>
          <StatusBadge status={a.status} />
        </div>

        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-3.5" />
            {formatTime(a.startsAt)} – {formatTime(a.endsAt)}
            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-slate-500">
              {durationLabel(a.startsAt, a.endsAt)}
            </span>
          </span>
        </div>

        <div className="mt-3 flex items-center gap-2.5">
          <div className={`flex size-7 shrink-0 items-center justify-center rounded-full bg-linear-to-br ${color} text-[11px] font-bold text-white`}>
            {initials(a.clientName)}
          </div>
          <div className="min-w-0 text-sm">
            <p className="truncate font-semibold text-slate-700">{a.clientName}</p>
          </div>
          <a href={`mailto:${a.clientEmail}`} className="hidden min-w-0 items-center gap-1 truncate text-sm text-slate-400 hover:text-brand-600 sm:inline-flex">
            <Mail className="size-3.5 shrink-0" />
            <span className="truncate">{a.clientEmail}</span>
          </a>
        </div>

        {a.notes && (
          <p className="mt-3 flex gap-2 rounded-xl bg-amber-50/70 px-3 py-2 text-sm text-amber-900/80">
            <StickyNote className="mt-0.5 size-3.5 shrink-0 text-amber-500" />
            <span className="line-clamp-2">{a.notes}</span>
          </p>
        )}
      </div>

      {/* Ações */}
      <div className="flex shrink-0 flex-col items-end gap-2">
        <div className="relative" ref={menuRef}>
          <button className="icon-btn" onClick={() => setMenuOpen((o) => !o)} aria-label="Mais ações" id={`menu-${a.id}`}>
            <MoreHorizontal className="size-5" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 z-30 mt-1 w-48 animate-pop-in overflow-hidden rounded-xl border border-slate-100 bg-white p-1.5 shadow-xl">
              {isScheduled && (
                <>
                  <MenuItem icon={<Pencil />} label="Editar" onClick={() => act('edit')} />
                  <MenuItem icon={<Check />} label="Concluir" onClick={() => act('complete')} />
                  <MenuItem icon={<XCircle />} label="Cancelar" onClick={() => act('cancel')} />
                  <div className="my-1 h-px bg-slate-100" />
                </>
              )}
              <MenuItem icon={<Trash2 />} label="Excluir" danger onClick={() => act('delete')} />
            </div>
          )}
        </div>
        {isScheduled && (
          <button
            onClick={() => act('complete')}
            className="mt-auto hidden items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 opacity-0 transition group-hover:opacity-100 hover:bg-emerald-100 sm:inline-flex"
            id={`complete-${a.id}`}
          >
            <Check className="size-3.5" /> Concluir
          </button>
        )}
      </div>
    </article>
  );
}

function MenuItem({ icon, label, onClick, danger }: { icon: ReactElement; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition [&>svg]:size-4 ${danger ? 'text-rose-700 hover:bg-rose-50' : 'text-slate-700 hover:bg-slate-50'
        }`}
    >
      {icon}
      {label}
    </button>
  );
}
