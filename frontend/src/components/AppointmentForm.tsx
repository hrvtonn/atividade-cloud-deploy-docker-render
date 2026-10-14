import { useState, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import type { Appointment, AppointmentPayload } from '../types/appointment';
import { fromLocalInput, toLocalInput } from '../utils/format';

interface Props {
  initial?: Appointment | null;
  onSubmit: (data: AppointmentPayload) => Promise<void>;
  onCancel: () => void;
}

const SERVICES = ['Consulta', 'Corte de cabelo', 'Manicure', 'Massagem', 'Reunião', 'Avaliação'];

function defaultRange() {
  const start = new Date();
  start.setDate(start.getDate() + 1);
  start.setHours(9, 0, 0, 0);
  const end = new Date(start.getTime() + 60 * 60000);
  return { start: toLocalInput(start), end: toLocalInput(end) };
}

export function AppointmentForm({ initial, onSubmit, onCancel }: Props) {
  const range = defaultRange();
  const [form, setForm] = useState({
    clientName: initial?.clientName ?? '',
    clientEmail: initial?.clientEmail ?? '',
    service: initial?.service ?? '',
    startsAt: initial ? toLocalInput(initial.startsAt) : range.start,
    endsAt: initial ? toLocalInput(initial.endsAt) : range.end,
    notes: initial?.notes ?? '',
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  // Ao mudar o início, mantém a duração atual
  const onStartChange = (value: string) => {
    setForm((f) => {
      const duration = +new Date(f.endsAt) - +new Date(f.startsAt);
      const next = new Date(new Date(value).getTime() + (duration > 0 ? duration : 3600000));
      return { ...f, startsAt: value, endsAt: value ? toLocalInput(next) : f.endsAt };
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (new Date(form.endsAt) <= new Date(form.startsAt)) {
      setError('O horário de término deve ser posterior ao de início.');
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        clientName: form.clientName.trim(),
        clientEmail: form.clientEmail.trim(),
        service: form.service.trim(),
        startsAt: fromLocalInput(form.startsAt),
        endsAt: fromLocalInput(form.endsAt),
        notes: form.notes.trim() || null,
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" id="appointment-form">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label" htmlFor="clientName">Nome do cliente</label>
          <input id="clientName" className="input" required minLength={2} maxLength={120}
            placeholder="Ex.: Maria Silva" value={form.clientName} onChange={set('clientName')} />
        </div>
        <div>
          <label className="label" htmlFor="clientEmail">E-mail</label>
          <input id="clientEmail" type="email" className="input" required maxLength={160}
            placeholder="maria@email.com" value={form.clientEmail} onChange={set('clientEmail')} />
        </div>
        <div>
          <label className="label" htmlFor="service">Serviço</label>
          <input id="service" className="input" required minLength={2} maxLength={120} list="service-suggestions"
            placeholder="Ex.: Consulta" value={form.service} onChange={set('service')} />
          <datalist id="service-suggestions">
            {SERVICES.map((s) => <option key={s} value={s} />)}
          </datalist>
        </div>
        <div>
          <label className="label" htmlFor="startsAt">Início</label>
          <input id="startsAt" type="datetime-local" className="input" required
            value={form.startsAt} onChange={(e) => onStartChange(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="endsAt">Término</label>
          <input id="endsAt" type="datetime-local" className="input" required min={form.startsAt}
            value={form.endsAt} onChange={set('endsAt')} />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="notes">Observações <span className="font-normal normal-case text-slate-400">(opcional)</span></label>
          <textarea id="notes" className="input min-h-24 resize-y" maxLength={1000}
            placeholder="Alguma informação importante sobre o atendimento…" value={form.notes} onChange={set('notes')} />
        </div>
      </div>

      {error && (
        <div className="animate-fade-in rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      )}

      <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className="btn-ghost" id="form-cancel">Cancelar</button>
        <button type="submit" disabled={saving} className="btn-primary" id="form-submit">
          {saving && <Loader2 className="size-4 animate-spin" />}
          {initial ? 'Salvar alterações' : 'Criar agendamento'}
        </button>
      </div>
    </form>
  );
}
