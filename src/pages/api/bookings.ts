import type { NextApiRequest, NextApiResponse } from 'next';
import type { ApiError, AvailabilityResponse } from '@/entities/table';
import { getAvailability } from '@/server/bookingService';
import { getRepo } from '@/server/bookingsRepo';
import { getRestaurantNow } from '@/server/time';
import { parseAvailabilityQuery } from '@/server/validation';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<AvailabilityResponse | ApiError>,
) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');
        return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
    }

    const parsed = parseAvailabilityQuery(req.query);
    if (!parsed.ok) {
        return res.status(400).json({ error: 'VALIDATION', fields: parsed.fields });
    }

    try {
        const data = await getAvailability(getRepo(), parsed.data, getRestaurantNow());
        // Занятость меняется с каждой бронью — не кэшируем
        res.setHeader('Cache-Control', 'no-store');
        return res.status(200).json(data);
    } catch (error) {
        console.error('GET /api/tables failed', error);
        return res.status(500).json({ error: 'INTERNAL' });
    }
}