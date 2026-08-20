export interface BookingFormData {
  name: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
}

export type BookingStatus = 'idle' | 'loading' | 'success';

export interface FormErrors {
  name?: string;
  phone?: string;
  date?: string;
  time?: string;
  guests?: string;
}