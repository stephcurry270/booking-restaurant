import { useState } from 'react';
import Head from 'next/head';
import {
  BookingForm,
  ConfirmationScreen,
  BookingApiError,
  submitBooking,
} from '@/features/booking';
import type { BookingFormData, BookingStatus, SubmitResult } from '@/features/booking';
import styles from '@/styles/Home.module.scss';

const NETWORK_ERROR_MESSAGE = 'Не удалось отправить бронь. Проверьте соединение и попробуйте ещё раз.';

export default function HomePage() {
  const [status, setStatus] = useState<BookingStatus>('idle');
  const [bookingData, setBookingData] = useState<BookingFormData | null>(null);

  const handleSubmit = async (data: BookingFormData): Promise<SubmitResult> => {
    setStatus('loading');

    try {
      const booking = await submitBooking(data);
      // Если выбран «любой свободный», сервер сам назначил столик — показываем его номер
      setBookingData({ ...data, tableId: booking.tableId });
      setStatus('success');
      return { ok: true };
    } catch (error) {
      setStatus('idle');

      if (error instanceof BookingApiError) {
        return { ok: false, code: error.code, message: error.message };
      }
      return { ok: false, code: 'NETWORK', message: NETWORK_ERROR_MESSAGE };
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setBookingData(null);
  };

  return (
      <>
        <Head>
          <title>Бронирование столика | Restaurant</title>
          <meta name="description" content="Онлайн бронирование столика" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>

        <main className={styles.main}>
          <div className={styles.container}>
            {/* key меняется при смене экрана → контейнер перемонтируется и анимация проигрывается заново */}
            <div key={status === 'success' ? 'confirmation' : 'form'} className={styles.view}>
              {status === 'success' && bookingData ? (
                  <ConfirmationScreen bookingData={bookingData} onReset={handleReset} />
              ) : (
                  <BookingForm onSubmit={handleSubmit} isLoading={status === 'loading'} />
              )}
            </div>
          </div>
        </main>
      </>
  );
}
