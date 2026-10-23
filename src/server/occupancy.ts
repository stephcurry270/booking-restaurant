import { daysBetween, RestaurantNow, weekdayOf } from './time';

/**
 * Бета-модель загрузки зала. Все числа можно подкручивать здесь.
 *
 * Вероятность, что столик занят «посторонними гостями» =
 *   загрузка по часу × коэффициент дня недели × коэффициент «насколько заранее смотрим».
 */

/** Загрузка по часам: пики — обед (около 13:00) и вечер (19:00–21:00) */
export const HOURLY_LOAD: Record<number, number> = {
    12: 0.35,
    13: 0.55,
    14: 0.5,
    15: 0.25,
    16: 0.2,
    17: 0.3,
    18: 0.6,
    19: 0.85,
    20: 0.9,
    21: 0.7,
    22: 0.4,
};

/** Вс, Пн, Вт, Ср, Чт, Пт, Сб */
const WEEKDAY_FACTOR = [1.1, 0.85, 0.85, 0.9, 1.0, 1.2, 1.2];

/** Чем дальше дата, тем больше шанс найти свободный столик */
export function leadFactor(daysAhead: number): number {
    if (daysAhead <= 0) return 1;
    if (daysAhead === 1) return 0.8;
    if (daysAhead <= 3) return 0.65;
    if (daysAhead <= 7) return 0.5;
    return 0.35;
}

const MAX_OCCUPANCY = 0.97;

export function occupancyProbability(date: string, time: string, now: RestaurantNow): number {
    const hour = Number(time.slice(0, 2));
    const base = HOURLY_LOAD[hour] ?? 0.3;
    const p = base * WEEKDAY_FACTOR[weekdayOf(date)] * leadFactor(daysBetween(now.date, date));

    return Math.min(MAX_OCCUPANCY, Math.max(0, p));
}

/** Детерминированное «случайное» число 0..1 по строке: один и тот же запрос всегда даёт один результат */
function hash01(key: string): number {
    let h = 0x811c9dc5;
    for (let i = 0; i < key.length; i++) {
        h ^= key.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
    }
    // финальное перемешивание битов
    h ^= h >>> 16;
    h = Math.imul(h, 0x85ebca6b);
    h ^= h >>> 13;
    h = Math.imul(h, 0xc2b2ae35);
    h ^= h >>> 16;

    return (h >>> 0) / 0x100000000;
}

export function isTableBusyBySimulation(
    tableId: number,
    date: string,
    time: string,
    now: RestaurantNow,
): boolean {
    return hash01(`${date}|${time}|${tableId}`) < occupancyProbability(date, time, now);
}