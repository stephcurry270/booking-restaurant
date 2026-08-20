import { useState } from 'react';
import Head from 'next/head';
import {
  BookingForm,
  ConfirmationScreen,
  BookingFormData,
  BookingStatus
} from '@/features/booking';
import styles from '@/styles/Home.module.scss';

export default function HomePage() {
  const [status, setStatus] = useState<BookingStatus>('idle');
  const [bookingData, setBookingData] = useState<BookingFormData | null>(null);

  const handleSubmit = (bookingData: BookingFormData) => {
    setStatus('loading');
    setBookingData(bookingData);

    // Имитация отправки формы на 1.5 секунды по ТЗ[cite: 1]
    setTimeout(() => {
      setStatus('success');
    }, 1500);
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
          {status === 'success' && bookingData ? (
            <ConfirmationScreen bookingData={bookingData} onReset={handleReset} />
          ) : (
            <BookingForm onSubmit={handleSubmit} isLoading={status === 'loading'} />
          )}
        </div>
      </main>
    </>
  );
}
