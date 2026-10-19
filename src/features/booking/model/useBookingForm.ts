import { useState, ChangeEvent, FocusEvent, FormEvent } from 'react';
import type { BookingFormData, FormErrors } from './types';
import { validateBookingForm, validatePhone } from './validation';
import { formatPhone } from '@/shared/lib/phoneMask';

const INITIAL_STATE: BookingFormData = {
  name: '',
  phone: '',
  date: '',
  time: '',
  guests: 1,
  consent: false,
};

interface UseBookingFormProps {
  onSubmit: (data: BookingFormData) => void;
}

export const useBookingForm = ({ onSubmit }: UseBookingFormProps) => {
  const [formData, setFormData] = useState<BookingFormData>(INITIAL_STATE);
  const [errors, setErrors] = useState<FormErrors>({});

  const setFieldValue = <K extends keyof BookingFormData>(name: K, value: BookingFormData[K]) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    setErrors((prev) => {
      if (!prev[name] && !(name === 'date' && prev.time)) return prev;

      const next = { ...prev, [name]: undefined };
      // Ошибка «время уже прошло» зависит от даты, поэтому сбрасываем её при смене даты
      if (name === 'date') next.time = undefined;
      return next;
    });
  };

  // Обычные <input>: name, phone, date, consent. Гости и время выбираются через CustomSelect → setFieldValue.
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;

    switch (name) {
      case 'phone':
        setFieldValue('phone', formatPhone(value));
        break;
      case 'consent':
        setFieldValue('consent', checked);
        break;
      case 'name':
      case 'date':
        setFieldValue(name, value);
        break;
    }
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const phoneErr = validatePhone(value);
      if (phoneErr) {
        setErrors((prev) => ({ ...prev, phone: phoneErr }));
      }
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const validationErrors = validateBookingForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSubmit(formData);
  };

  const resetForm = () => {
    setFormData(INITIAL_STATE);
    setErrors({});
  };

  return {
    formData,
    errors,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue,
  };
};