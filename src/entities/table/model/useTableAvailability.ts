import { useEffect, useState } from 'react';
import { AvailabilityParams, fetchAvailability } from '../api/fetchAvailability';
import type { AvailabilityResponse } from '../model/types';

interface Result {
    key: string;
    data?: AvailabilityResponse;
    failed?: boolean;
}

/**
 * Загружает занятость столиков. Передайте null, чтобы не загружать (например, пока окно закрыто).
 * Состояние «загрузка» вычисляется из того, совпадает ли последний результат с текущим запросом,
 * поэтому внутри эффекта нет синхронных setState.
 */
export function useTableAvailability(params: AvailabilityParams | null) {
    const [result, setResult] = useState<Result | null>(null);
    const [attempt, setAttempt] = useState(0);

    const date = params?.date;
    const time = params?.time;
    const guests = params?.guests;
    const key = date && time && guests ? `${date}|${time}|${guests}|${attempt}` : null;

    useEffect(() => {
        if (!date || !time || !guests || key === null) return;

        const controller = new AbortController();

        fetchAvailability({ date, time, guests }, controller.signal)
            .then((data) => setResult({ key, data }))
            .catch((error: unknown) => {
                if ((error as Error).name !== 'AbortError') setResult({ key, failed: true });
            });

        return () => controller.abort();
    }, [date, time, guests, key]);

    const isCurrent = key !== null && result?.key === key;

    return {
        data: isCurrent ? result?.data : undefined,
        isLoading: key !== null && !isCurrent,
        isError: isCurrent && Boolean(result?.failed),
        retry: () => setAttempt((n) => n + 1),
    };
}