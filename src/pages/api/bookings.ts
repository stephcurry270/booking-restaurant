import type { NextApiRequest, NextApiResponse } from 'next';
import type { ApiError, CreatedBooking } from '@/entities/table';
import { BookingFailure, createBooking } from '@/server/bookingService';
import { getRepo } from '@/server/bookingRepo';
import { getRestaurantNow } from '@/server/time';
import { parseBookingBody } from '@/server/validation';

const FAILURES: Record<BookingFailure, { status: number; message: string }> = {
    PAST_SLOT: { status: 400, message: 'Это время уже прошло, выберите другое' },
    TABLE_NOT_FOUND: { status: 400, message: 'Такого столика нет' },
    TABLE_TOO_SMALL: { status: 400, message: 'Столик слишком мал для вашей компании' },
    TABLE_TAKEN: { status: 409, message: 'Столик только что заняли, выберите другой' },
    NO_TABLES: { status: 409, message: 'На это время свободных столиков нет' },
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<CreatedBooking | ApiError>,
) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
    }

    const parsed = parseBookingBody(req.body);
    if (!parsed.ok) {
        return res.status(400).json({ error: 'VALIDATION', fields: parsed.fields });
    }

    try {
        const result = await createBooking(getRepo(), parsed.data, getRestaurantNow());

        if (!result.ok) {
            const { status, message } = FAILURES[result.code];
            return res.status(status).json({ error: result.code, message });
        }

        return res.status(201).json(result.booking);
    } catch (error) {
        console.error('POST /api/bookings failed', error);
        return res.status(500).json({ error: 'INTERNAL' });
    }
}