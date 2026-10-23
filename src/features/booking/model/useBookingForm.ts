import { useState, ChangeEvent, FocusEvent, FormEvent } from 'react';
import type { BookingFormData, FormErrors, SubmitResult } from './types';
import { validateBookingForm, validatePhone } from './validation';
import { formatPhone } from '@/shared/lib/phoneMask';

const INITIAL_STATE: BookingFormData = {
  name: '',
  phone: '',
  date: '',
  time: '',
  guests: 1,
  tableId: null,
  consent: false,
};

/** Поля, от которых зависит занятость столиков: при их смене выбор столика сбрасывается */
const SLOT_FIELDS: (keyof BookingFormData)[] = ['date', 'time', 'guests'];

interface UseBookingFormProps {
  onSubmit: (data: BookingFormData) => Promise<SubmitResult>;
}

export const useBookingForm = ({ onSubmit }: UseBookingFormProps) => {
  const [formData, setFormData] = useState<BookingFormData>(INITIAL_STATE);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [tableResetNotice, setTableResetNotice] = useState(false);

  const setFieldValue = <K extends keyof BookingFormData>(name: K, value: BookingFormData[K]) => {
    const resetsTable = SLOT_FIELDS.includes(name) && formData.tableId !== null;

    setFormData((prev) => ({ ...prev, [name]: value, ...(resetsTable ? { tableId: null } : {}) }));
    setSubmitError(null);
    if (resetsTable) setTableResetNotice(true);

    setErrors((prev) => {
      if (!prev[name] && !(name === 'date' && prev.time)) return prev;

      const next = { ...prev, [name]: undefined };
      // Ошибка «время уже прошло» зависит от даты, поэтому сбрасываем её при смене даты
      if (name === 'date') next.time = undefined;
      return next;
    });
  };

  const selectTable = (tableId: number | null) => {
    setFormData((prev) => ({ ...prev, tableId }));
    setTableResetNotice(false);
    setSubmitError(null);
  };

  // Обычные <input>: name, phone, date, consent. Гости, время и столик выбираются не через них.
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationErrors = validateBookingForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitError(null);
    const result = await onSubmit(formData);

    if (!result.ok) {
      setSubmitError(result.message);

      // Столик заняли, пока пользователь заполнял форму: сбрасываем выбор,
      // но не через selectTable — он бы стёр только что показанное сообщение об ошибке
      if (result.code === 'TABLE_TAKEN') {
        setFormData((prev) => ({ ...prev, tableId: null }));
        setTableResetNotice(true);
      }
    }
  };

  const resetForm = () => {
    setFormData(INITIAL_STATE);
    setErrors({});
    setSubmitError(null);
    setTableResetNotice(false);
  };

  return {
    formData,
    errors,
    submitError,
    tableResetNotice,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue,
    selectTable,
  };
};