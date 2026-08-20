import { useState, ChangeEvent, FormEvent } from 'react';
import { BookingFormData, FormErrors } from './types';
import { validateBookingForm, validatePhone } from './validation';

const INITIAL_STATE: BookingFormData = {
  name: '',
  phone: '',
  date: '',
  time: '',
  guests: 1,
};

interface UseBookingFormProps {
  onSubmit: (data: BookingFormData) => void;
}

export const useBookingForm = ({ onSubmit }: UseBookingFormProps) => {
  const [formData, setFormData] = useState<BookingFormData>(INITIAL_STATE);
  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === 'guests' ? Number(value) : value,
    }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const setFieldValue = (name: keyof BookingFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleBlur = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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