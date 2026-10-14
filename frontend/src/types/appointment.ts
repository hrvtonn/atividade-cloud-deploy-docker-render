export type AppointmentStatus = 'scheduled' | 'cancelled' | 'completed';

export interface Appointment {
  id: string;
  clientName: string;
  clientEmail: string;
  service: string;
  startsAt: string;
  endsAt: string;
  status: AppointmentStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentPayload {
  clientName: string;
  clientEmail: string;
  service: string;
  startsAt: string;
  endsAt: string;
  notes?: string | null;
}

export interface AppointmentFilters {
  status?: AppointmentStatus;
  from?: string;
  to?: string;
}
