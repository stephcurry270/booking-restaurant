import { BookingFormData } from '../../model/types';
import { useBookingForm } from '../../model/useBookingForm';
import { CustomSelect } from '@/shared/ui/CustomSelect/CustomSelect'; // Подключаем компонент
import { GUEST_OPTIONS, TIME_SLOTS } from '@/shared/config/constants';
import styles from './BookingForm.module.scss';

interface BookingFormProps {
  onSubmit: (data: BookingFormData) => void;
  isLoading: boolean;
}

export const BookingForm = ({ onSubmit, isLoading }: BookingFormProps) => {
  const { formData, errors, handleChange, handleBlur, handleSubmit, setFieldValue } =
    useBookingForm({ onSubmit });

  const today = new Date().toISOString().split('T')[0];

  const timeOptions = TIME_SLOTS.map((slot) => ({
    value: slot,
    label: slot,
  }));

  return (
    <div className={styles.card}>
      <h1 className={styles.title}>Бронирование столика</h1>
      <p className={styles.subtitle}>
        Выберите свой идеальный столик онлайн! Укажите количество гостей, желаемую дату и время.
      </p>

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <div className={styles.field}>
          <input
            type="text"
            name="name"
            placeholder="Введите свое имя"
            value={formData.name}
            onChange={handleChange}
            className={errors.name ? styles.inputError : ''}
          />
          {errors.name && <span className={styles.errorText}>{errors.name}</span>}
        </div>

        <div className={styles.field}>
          <input
            type="tel"
            name="phone"
            placeholder="Номер телефона (+7XXXXXXXXXX)"
            value={formData.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            className={errors.phone ? styles.inputError : ''}
          />
          {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
        </div>

        <div className={styles.field}>
          <CustomSelect
            options={GUEST_OPTIONS}
            value={formData.guests}
            onChange={(val) => setFieldValue('guests', val)}
            placeholder="Количество гостей"
            error={!!errors.guests}
          />
          {errors.guests && <span className={styles.errorText}>{errors.guests}</span>}
        </div>

        <div className={styles.field}>
          <input
            type="date"
            name="date"
            min={today}
            value={formData.date}
            onChange={handleChange}
            className={errors.date ? styles.inputError : ''}
          />
          {errors.date && <span className={styles.errorText}>{errors.date}</span>}
        </div>

        <div className={styles.field}>
          <CustomSelect
            options={timeOptions}
            value={formData.time}
            onChange={(val) => setFieldValue('time', val)}
            placeholder="Выберите время"
            error={!!errors.time}
          />
          {errors.time && <span className={styles.errorText}>{errors.time}</span>}
        </div>

        <button type="submit" disabled={isLoading} className={styles.submitButton}>
          {isLoading ? 'Бронирую...' : 'Забронировать'}
        </button>
      </form>
    </div>
  );
};