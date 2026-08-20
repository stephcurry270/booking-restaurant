import { BookingFormData, FormErrors } from '@/features/booking/model/types';

export function validatePhone(value: string): string | null {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 11 && (digits[0] === '7' || digits[0] === '8')) {
    return null;
  }
  return 'Введите номер в формате +7XXXXXXXXXX или 8XXXXXXXXXX';
}

export function validateBookingForm(data: BookingFormData): FormErrors {
  const errors: FormErrors = {};

  if (!data.name.trim() || data.name.trim().length < 2) {
    errors.name = 'Имя должно содержать минимум 2 символа';
  }

  const phoneError = validatePhone(data.phone);
  if (phoneError) errors.phone = phoneError;

  if (!data.date) {
    errors.date = 'Выберите дату';
  } else {
    const selectedDate = new Date(data.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      errors.date = 'Дата не может быть раньше сегодняшнего дня';
    }
  }

  if (!data.time) {
    errors.time = 'Выберите время';
  }

  if (!data.guests || data.guests < 1 || data.guests > 12) {
    errors.guests = 'Укажите количество гостей от 1 до 12';
  }

  return errors;
}