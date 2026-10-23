import type { AvailabilityResponse } from '../model/types';

export interface AvailabilityParams {
    date: string;
    time: string;
    guests: number;
}

export async function fetchAvailability(
    { date, time, guests }: AvailabilityParams,
    signal?: AbortSignal,
): Promise<AvailabilityResponse> {
    const query = new URLSearchParams({ date, time, guests: String(guests) });
    const response = await fetch(`/api/tables?${query}`, { signal, cache: 'no-store' });

    if (!response.ok) {
        throw new Error(`Availability request failed with status ${response.status}`);
    }

    return response.json();
}