import { env } from '../config/env';
import type { Appointment, AppointmentFilters, AppointmentPayload } from '../types/appointment';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${env.apiUrl}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init.headers },
    });
  } catch {
    throw new ApiError('Não foi possível conectar à API. Verifique se ela está no ar.', 0);
  }

  if (res.status === 204) return undefined as T;

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    let message = body?.error ?? `Erro ${res.status}`;
    if (Array.isArray(body?.details) && body.details[0]?.message) {
      message += `: ${body.details
        .map((d: { field?: string; message: string }) => (d.field ? `${d.field} — ${d.message}` : d.message))
        .join(', ')}`;
    }
    throw new ApiError(message, res.status, body?.details);
  }

  return body as T;
}

function toQuery(filters: AppointmentFilters) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => v && params.set(k, v));
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const appointmentsApi = {
  health: () => request<{ status: string; database: string }>('/health'),
  list: (filters: AppointmentFilters = {}) => request<Appointment[]>(`/appointments${toQuery(filters)}`),
  get: (id: string) => request<Appointment>(`/appointments/${id}`),
  create: (data: AppointmentPayload) =>
    request<Appointment>('/appointments', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<AppointmentPayload>) =>
    request<Appointment>(`/appointments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  cancel: (id: string) => request<Appointment>(`/appointments/${id}/cancel`, { method: 'PATCH' }),
  complete: (id: string) => request<Appointment>(`/appointments/${id}/complete`, { method: 'PATCH' }),
  remove: (id: string) => request<void>(`/appointments/${id}`, { method: 'DELETE' }),
};
