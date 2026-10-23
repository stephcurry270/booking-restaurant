export interface BookingFormData {
  name: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  /** null — «любой свободный столик» */
  tableId: number | null;
  consent: boolean;
}

export type BookingStatus = 'idle' | 'loading' | 'success';

export interface FormErrors {
  name?: string;
  phone?: string;
  date?: string;
  time?: string;
  guests?: string;
  tableId?: string;
  consent?: string;
}

export type SubmitResult = { ok: true } | { ok: false; code: string; message: string };