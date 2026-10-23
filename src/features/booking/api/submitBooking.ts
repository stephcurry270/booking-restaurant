import type { CreatedBooking } from '@/entities/table';
import type { BookingFormData } from '../model/types';

export class BookingApiError extends Error {
    constructor(
        public readonly code: string,
        message: string,
    ) {
        super(message);
        this.name = 'BookingApiError';
    }
}

export async function submitBooking(data: BookingFormData): Promise<CreatedBooking> {
    const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: data.name,
            phone: data.phone,
            date: data.date,
            time: data.time,
            guests: data.guests,
            tableId: data.tableId,
        }),
    })

    const body = await response.json().catch(() => null);

    if (!response.ok) {
        throw new BookingApiError(
            body?.error ?? 'INTERNAL',
            body?.message ??
            (body?.error === 'VALIDATION'
                ? 'Проверьте введённые данные'
                : 'Не удалось отправить бронь. Попробуйте ещё раз.'),
        );
    }

    return body as CreatedBooking;
}