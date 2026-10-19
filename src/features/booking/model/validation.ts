import type { BookingFormData, FormErrors } from './types';
import { isSlotInPast, parseLocalDate, startOfDay } from './dateUtils';

export function validatePhone(value: string): string | null {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 11 && (digits[0] === '7' || digits[0] === '8')) {
    return null;
  }
  return 'Введите номер полностью: +7 (XXX) XXX-XX-XX';
}

export function validateBookingForm(data: BookingFormData, now: Date = new Date()): FormErrors {
  const errors: FormErrors = {};

  if (!data.name.trim() || data.name.trim().length < 2) {
    errors.name = 'Имя должно содержать минимум 2 символа';
  }

  const phoneError = validatePhone(data.phone);
  if (phoneError) errors.phone = phoneError;

  let isDateValid = false;
  if (!data.date) {
    errors.date = 'Выберите дату';
  } else {
    const selectedDate = parseLocalDate(data.date);
    if (!selectedDate) {
      errors.date = 'Введите корректную дату';
    } else if (selectedDate < startOfDay(now)) {
      errors.date = 'Дата не может быть раньше сегодняшнего дня';
    } else {
      isDateValid = true;
    }
  }

  if (!data.time) {
    errors.time = 'Выберите время';
  } else if (isDateValid && isSlotInPast(data.date, data.time, now)) {
    errors.time = 'Это время уже прошло, выберите другое';
  }

  if (!Number.isInteger(data.guests) || data.guests < 1 || data.guests > 12) {
    errors.guests = 'Укажите количество гостей от 1 до 12';
  }

  if (!data.consent) {
    errors.consent = 'Необходимо ознакомиться с политикой конфиденциальности';
  }

  return errors;
}