import { BookingFormData } from '../../model/types';
import styles from './ConfirmationScreen.module.scss';

interface ConfirmationScreenProps {
  bookingData: BookingFormData;
  onReset: () => void;
}

export const ConfirmationScreen = ({ bookingData, onReset }: ConfirmationScreenProps) => {
  return (
    <div className={styles.card}>
      <div className={styles.iconWrapper}>✓</div>
      <h2 className={styles.title}>Столик забронирован!</h2>
      <p className={styles.subtitle}>
        Мы ждем вас! Детали вашего бронирования отправлены и сохранены.
      </p>

      <div className={styles.detailsList}>
        <div className={styles.detailItem}>
          <span className={styles.label}>Имя:</span>
          <span className={styles.value}>{bookingData.name}</span>
        </div>
        <div className={styles.detailItem}>
          <span className={styles.label}>Телефон:</span>
          <span className={styles.value}>{bookingData.phone}</span>
        </div>
        <div className={styles.detailItem}>
          <span className={styles.label}>Гостей:</span>
          <span className={styles.value}>{bookingData.guests}</span>
        </div>
        <div className={styles.detailItem}>
          <span className={styles.label}>Дата:</span>
          <span className={styles.value}>{bookingData.date}</span>
        </div>
        <div className={styles.detailItem}>
          <span className={styles.label}>Время:</span>
          <span className={styles.value}>{bookingData.time}</span>
        </div>
      </div>

      <button onClick={onReset} className={styles.resetButton}>
        Забронировать еще
      </button>
    </div>
  );
};