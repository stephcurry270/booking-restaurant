import { useId } from 'react';
import type { BookingFormData, FormErrors, SubmitResult } from '../../model/types';
import { useBookingForm } from '../../model/useBookingForm';
import { toLocalDateString } from '../../model/dateUtils';
import { TablePicker } from '../TablePicker/TablePicker';
import { CustomSelect } from '@/shared/ui/CustomSelect/CustomSelect';
import { CalendarIcon, ClockIcon, PhoneIcon, UserIcon, UsersIcon } from '@/shared/ui/icons';
import { GUEST_OPTIONS, PRIVACY_POLICY_URL, TIME_SLOTS } from '@/shared/config/constants';
import styles from './BookingForm.module.scss';

interface BookingFormProps {
  onSubmit: (data: BookingFormData) => Promise<SubmitResult>;
  isLoading: boolean;
}

const timeOptions = TIME_SLOTS.map((slot) => ({
  value: slot,
  label: slot,
}));

export const BookingForm = ({ onSubmit, isLoading }: BookingFormProps) => {
  const {
    formData,
    errors,
    submitError,
    tableResetNotice,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    selectTable,
  } = useBookingForm({ onSubmit });

  const formId = useId();
  const fieldId = (name: keyof BookingFormData) => `${formId}-${name}`;
  const labelId = (name: keyof BookingFormData) => `${fieldId(name)}-label`;
  const errorId = (name: keyof FormErrors) => `${fieldId(name)}-error`;
  const describedBy = (name: keyof FormErrors) => (errors[name] ? errorId(name) : undefined);

  const renderError = (name: keyof FormErrors) =>
      errors[name] && (
          <span id={errorId(name)} className={styles.errorText} role="alert">
        {errors[name]}
      </span>
      );

  const inputClass = (name: keyof FormErrors) =>
      `${styles.withIcon} ${errors[name] ? styles.inputError : ''}`;

  // Локальная дата (toISOString даёт UTC и ночью может вернуть «вчера»)
  const today = toLocalDateString();

  return (
      <div className={styles.card}>
        <h1 className={styles.title}>Бронирование столика</h1>
        <p className={styles.subtitle}>
          Выберите свой идеальный столик онлайн! Укажите количество гостей, желаемую дату и время.
        </p>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.field}>
            <label htmlFor={fieldId('name')} className={styles.label}>
              Имя
            </label>
            <div className={styles.inputWrapper}>
              <UserIcon className={styles.icon} />
              <input
                  id={fieldId('name')}
                  type="text"
                  name="name"
                  autoComplete="name"
                  placeholder="Введите свое имя"
                  value={formData.name}
                  onChange={handleChange}
                  className={inputClass('name')}
                  aria-invalid={!!errors.name}
                  aria-describedby={describedBy('name')}
              />
            </div>
            {renderError('name')}
          </div>

          <div className={styles.field}>
            <label htmlFor={fieldId('phone')} className={styles.label}>
              Телефон
            </label>
            <div className={styles.inputWrapper}>
              <PhoneIcon className={styles.icon} />
              <input
                  id={fieldId('phone')}
                  type="tel"
                  name="phone"
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="+7 (___) ___-__-__"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass('phone')}
                  aria-invalid={!!errors.phone}
                  aria-describedby={describedBy('phone')}
              />
            </div>
            {renderError('phone')}
          </div>

          <div className={styles.field}>
          <span id={labelId('guests')} className={styles.label}>
            Количество гостей
          </span>
            <CustomSelect
                id={fieldId('guests')}
                options={GUEST_OPTIONS}
                value={formData.guests}
                onChange={(val) => setFieldValue('guests', val)}
                placeholder="Количество гостей"
                icon={<UsersIcon />}
                error={!!errors.guests}
                labelledBy={labelId('guests')}
                describedBy={describedBy('guests')}
            />
            {renderError('guests')}
          </div>

          <div className={styles.field}>
            <label htmlFor={fieldId('date')} className={styles.label}>
              Дата
            </label>
            <div className={styles.inputWrapper}>
              <CalendarIcon className={styles.icon} />
              <input
                  id={fieldId('date')}
                  type="date"
                  name="date"
                  min={today}
                  value={formData.date}
                  onChange={handleChange}
                  className={inputClass('date')}
                  aria-invalid={!!errors.date}
                  aria-describedby={describedBy('date')}
              />
            </div>
            {renderError('date')}
          </div>

          <div className={styles.field}>
          <span id={labelId('time')} className={styles.label}>
            Время
          </span>
            <CustomSelect
                id={fieldId('time')}
                options={timeOptions}
                value={formData.time}
                onChange={(val) => setFieldValue('time', val)}
                placeholder="Выберите время"
                icon={<ClockIcon />}
                error={!!errors.time}
                labelledBy={labelId('time')}
                describedBy={describedBy('time')}
            />
            {renderError('time')}
          </div>

          <div className={styles.field}>
          <span id={labelId('tableId')} className={styles.label}>
            Столик <span className={styles.optional}>(необязательно)</span>
          </span>
            <TablePicker
                id={fieldId('tableId')}
                labelledBy={labelId('tableId')}
                date={formData.date}
                time={formData.time}
                guests={formData.guests}
                value={formData.tableId}
                onChange={selectTable}
                resetNotice={tableResetNotice}
            />
          </div>

          <div className={styles.field}>
            <label
                className={`${styles.checkbox} ${errors.consent ? styles.checkboxInvalid : ''}`}
            >
              <input
                  id={fieldId('consent')}
                  type="checkbox"
                  name="consent"
                  checked={formData.consent}
                  onChange={handleChange}
                  aria-invalid={!!errors.consent}
                  aria-describedby={describedBy('consent')}
              />
              <span>
              С{' '}
                <a href={PRIVACY_POLICY_URL} className={styles.link}>
                политикой конфиденциальности
              </a>{' '}
                ознакомлен
            </span>
            </label>
            {renderError('consent')}
          </div>

          {submitError && (
              <p className={styles.submitError} role="alert">
                {submitError}
              </p>
          )}

          <button type="submit" disabled={isLoading} className={styles.submitButton}>
            {isLoading ? 'Бронирую...' : 'Забронировать'}
          </button>
        </form>
      </div>
  );
};
