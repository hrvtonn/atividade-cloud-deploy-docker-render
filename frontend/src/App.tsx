import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { CalendarPlus, CalendarRange, RefreshCw, Search, Sparkles, WifiOff, X } from 'lucide-react';
import { appointmentsApi } from './services/api';
import { env } from './config/env';
import type { Appointment, AppointmentPayload, AppointmentStatus } from './types/appointment';
import { AppointmentCard, type CardAction } from './components/AppointmentCard';
import { AppointmentForm } from './components/AppointmentForm';
import { ConfirmDialog } from './components/ConfirmDialog';
import { Modal } from './components/Modal';
import { StatsCards } from './components/StatsCards';
import { useToast } from './components/Toast';
import { formatFullDate, formatWeekday, isToday } from './utils/format';

type StatusFilter = 'all' | AppointmentStatus;

const TABS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'scheduled', label: 'Agendados' },
  { value: 'completed', label: 'Concluídos' },
  { value: 'cancelled', label: 'Cancelados' },
];

type Confirm = { action: 'cancel' | 'delete'; appointment: Appointment } | null;

export default function App() {
  const toast = useToast();
  const [items, setItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [online, setOnline] = useState<boolean | null>(null);

  const [status, setStatus] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Appointment | null>(null);
  const [confirm, setConfirm] = useState<Confirm>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await appointmentsApi.list({
        from: from ? new Date(`${from}T00:00:00`).toISOString() : undefined,
        to: to ? new Date(`${to}T23:59:59`).toISOString() : undefined,
      });
      setItems(data);
      setOnline(true);
    } catch (err) {
      setLoadError((err as Error).message);
      setOnline(false);
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    load();
  }, [load]);

  // Filtro por status e busca é feito no cliente para manter as métricas completas
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items
      .filter((a) => status === 'all' || a.status === status)
      .filter((a) => !q || [a.clientName, a.clientEmail, a.service].some((v) => v.toLowerCase().includes(q)))
      .sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt));
  }, [items, status, search]);

  const groups = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    filtered.forEach((a) => {
      const key = new Date(a.startsAt).toDateString();
      map.set(key, [...(map.get(key) ?? []), a]);
    });
    return [...map.values()];
  }, [filtered]);

  const counts = useMemo(() => {
    const c: Record<StatusFilter, number> = { all: items.length, scheduled: 0, completed: 0, cancelled: 0 };
    items.forEach((a) => c[a.status]++);
    return c;
  }, [items]);

  const upsert = (a: Appointment) =>
    setItems((list) => (list.some((x) => x.id === a.id) ? list.map((x) => (x.id === a.id ? a : x)) : [...list, a]));

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleSubmit = async (data: AppointmentPayload) => {
    if (editing) {
      upsert(await appointmentsApi.update(editing.id, data));
      toast('success', 'Agendamento atualizado com sucesso!');
    } else {
      upsert(await appointmentsApi.create(data));
      toast('success', 'Agendamento criado com sucesso!');
    }
    setFormOpen(false);
  };

  const handleAction = async (action: CardAction, a: Appointment) => {
    if (action === 'edit') {
      setEditing(a);
      setFormOpen(true);
    } else if (action === 'complete') {
      try {
        upsert(await appointmentsApi.complete(a.id));
        toast('success', `Atendimento de ${a.clientName} concluído.`);
      } catch (err) {
        toast('error', (err as Error).message);
      }
    } else {
      setConfirm({ action, appointment: a });
    }
  };

  const runConfirm = async () => {
    if (!confirm) return;
    const { action, appointment: a } = confirm;
    try {
      if (action === 'cancel') {
        upsert(await appointmentsApi.cancel(a.id));
        toast('success', 'Agendamento cancelado.');
      } else {
        await appointmentsApi.remove(a.id);
        setItems((list) => list.filter((x) => x.id !== a.id));
        toast('success', 'Agendamento excluído.');
      }
      setConfirm(null);
    } catch (err) {
      toast('error', (err as Error).message);
    }
  };

  const hasDateFilter = from || to;

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Fundo decorativo */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-32 size-[32rem] animate-blob rounded-full bg-brand-200/60 blur-3xl" />
        <div className="absolute top-1/3 -right-40 size-[28rem] animate-blob rounded-full bg-sky-200/50 blur-3xl [animation-delay:-6s]" />
        <div className="absolute -bottom-40 left-1/3 size-[26rem] animate-blob rounded-full bg-fuchsia-200/40 blur-3xl [animation-delay:-12s]" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(15,23,42,0.06)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/60 bg-white/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-linear-to-br from-brand-600 to-violet-500 text-white shadow-lg shadow-brand-500/30">
              <CalendarRange className="size-5" />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-slate-900">
              Agenda<span className="text-brand-600">.</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              title={env.apiUrl}
              className={`hidden items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold sm:inline-flex ${
                online === false ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              <span className="relative flex size-2">
                {online && <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />}
                <span className={`relative inline-flex size-2 rounded-full ${online === false ? 'bg-rose-500' : online ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              </span>
              {online === false ? 'API offline' : online ? 'API conectada' : 'Conectando…'}
            </span>
            <button onClick={openCreate} className="btn-primary" id="new-appointment">
              <CalendarPlus className="size-4" />
              <span className="hidden sm:inline">Novo agendamento</span>
              <span className="sm:hidden">Novo</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pt-10 pb-20 sm:px-6">
        {/* Hero */}
        <section className="mb-8 animate-slide-up">
          <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 ring-1 ring-brand-100">
            <Sparkles className="size-3.5" />
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Seus{' '}
            <span className="bg-linear-to-r from-brand-600 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
              agendamentos
            </span>
          </h1>
          <p className="mt-2 max-w-xl text-slate-500">
            Organize horários, acompanhe atendimentos e mantenha sua agenda sempre em dia.
          </p>
        </section>

        <StatsCards items={items} />

        {/* Toolbar */}
        <section className="glass mt-8 flex flex-col gap-3 rounded-2xl p-3 lg:flex-row lg:items-center">
          <div className="flex gap-1 overflow-x-auto rounded-xl bg-slate-100/80 p-1">
            {TABS.map((t) => (
              <button
                key={t.value}
                id={`tab-${t.value}`}
                onClick={() => setStatus(t.value)}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition ${
                  status === t.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {t.label}
                <span
                  className={`rounded-md px-1.5 text-[11px] tabular-nums ${
                    status === t.value ? 'bg-brand-100 text-brand-700' : 'bg-slate-200/70 text-slate-500'
                  }`}
                >
                  {counts[t.value]}
                </span>
              </button>
            ))}
          </div>

          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
            <input
              id="search"
              className="input pl-10"
              placeholder="Buscar por cliente, e-mail ou serviço…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <input id="filter-from" type="date" className="input w-auto" value={from} onChange={(e) => setFrom(e.target.value)} aria-label="De" />
            <span className="text-sm text-slate-400">até</span>
            <input id="filter-to" type="date" className="input w-auto" value={to} min={from} onChange={(e) => setTo(e.target.value)} aria-label="Até" />
            {hasDateFilter && (
              <button className="icon-btn" onClick={() => { setFrom(''); setTo(''); }} aria-label="Limpar datas" id="clear-dates">
                <X className="size-4" />
              </button>
            )}
            <button className="icon-btn" onClick={load} aria-label="Atualizar" id="refresh">
              <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </section>

        {/* Lista */}
        <section className="mt-8">
          {loading && !items.length ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="glass flex h-32 animate-pulse gap-4 rounded-2xl p-5">
                  <div className="h-full w-16 rounded-xl bg-slate-200/70" />
                  <div className="flex-1 space-y-3 py-1">
                    <div className="h-4 w-1/3 rounded bg-slate-200/70" />
                    <div className="h-3 w-1/4 rounded bg-slate-200/70" />
                    <div className="h-3 w-1/2 rounded bg-slate-200/70" />
                  </div>
                </div>
              ))}
            </div>
          ) : loadError ? (
            <EmptyState
              icon={<WifiOff className="size-7" />}
              title="Não foi possível carregar"
              text={`${loadError} (${env.apiUrl})`}
              action={<button className="btn-outline" onClick={load}><RefreshCw className="size-4" /> Tentar novamente</button>}
            />
          ) : !filtered.length ? (
            <EmptyState
              icon={<CalendarPlus className="size-7" />}
              title={items.length ? 'Nenhum resultado' : 'Sua agenda está livre'}
              text={items.length ? 'Ajuste os filtros ou a busca para encontrar o que procura.' : 'Crie o primeiro agendamento e comece a organizar seus horários.'}
              action={!items.length && <button className="btn-primary" onClick={openCreate}><CalendarPlus className="size-4" /> Novo agendamento</button>}
            />
          ) : (
            <div className="space-y-8">
              {groups.map((group) => (
                <div key={group[0].startsAt}>
                  <div className="mb-3 flex items-baseline gap-3 px-1">
                    <h2 className="text-sm font-bold text-slate-900 capitalize">
                      {isToday(group[0].startsAt) ? 'Hoje' : formatWeekday(group[0].startsAt)}
                    </h2>
                    <span className="text-sm text-slate-400">{formatFullDate(group[0].startsAt)}</span>
                    <div className="h-px flex-1 bg-linear-to-r from-slate-200 to-transparent" />
                  </div>
                  <div className="grid gap-3">
                    {group.map((a, i) => (
                      <AppointmentCard key={a.id} appointment={a} index={i} onAction={handleAction} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Editar agendamento' : 'Novo agendamento'}
        subtitle={editing ? 'Atualize as informações do atendimento.' : 'Preencha os dados para reservar um horário.'}
      >
        <AppointmentForm key={editing?.id ?? 'new'} initial={editing} onSubmit={handleSubmit} onCancel={() => setFormOpen(false)} />
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        danger={confirm?.action === 'delete'}
        title={confirm?.action === 'delete' ? 'Excluir agendamento?' : 'Cancelar agendamento?'}
        message={
          confirm?.action === 'delete'
            ? `O agendamento de ${confirm.appointment.clientName} será removido permanentemente.`
            : `O horário de ${confirm?.appointment.clientName} será liberado. Esta ação não pode ser desfeita.`
        }
        confirmLabel={confirm?.action === 'delete' ? 'Excluir' : 'Cancelar agendamento'}
        onConfirm={runConfirm}
        onClose={() => setConfirm(null)}
      />
    </div>
  );
}

function EmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="glass flex animate-slide-up flex-col items-center rounded-3xl px-6 py-16 text-center">
      <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-linear-to-br from-brand-50 to-violet-100 text-brand-600 ring-1 ring-brand-100">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{text}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
