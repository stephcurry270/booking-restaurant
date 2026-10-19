import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import {
  BookingForm,
  ConfirmationScreen,
  BookingFormData,
  BookingStatus,
} from '@/features/booking';
import styles from '@/styles/Home.module.scss';

const FAKE_REQUEST_DELAY_MS = 1500;

export default function HomePage() {
  const [status, setStatus] = useState<BookingStatus>('idle');
  const [bookingData, setBookingData] = useState<BookingFormData | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Не оставляем таймер висеть после ухода со страницы
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleSubmit = (data: BookingFormData) => {
    if (status === 'loading') return;

    setStatus('loading');
    setBookingData(data);

    timerRef.current = setTimeout(() => {
      setStatus('success');
      timerRef.current = null;
    }, FAKE_REQUEST_DELAY_MS);
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
