import { TIME_SLOTS } from '@/shared/config/constants';

/** Часовой пояс ресторана. Vercel работает в UTC, поэтому «сегодня» считаем явно. */
export const RESTAURANT_TIME_ZONE = process.env.RESTAURANT_TIME_ZONE || 'Europe/Moscow';

/** На сколько занимается столик после брони */
export const BOOKING_DURATION_MINUTES = 120;

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const DAY_MS = 86_400_000;

export interface RestaurantNow {
    /** YYYY-MM-DD в часовом поясе ресторана */
    date: string;
    /** минуты от полуночи */
    minutes: number;
}

export function isValidDate(value: string): boolean {
    const match = DATE_RE.exec(value);
    if (!match) return false;

    const [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])];
    const date = new Date(Date.UTC(y, m - 1, d));

    return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

export function isValidTime(value: string): boolean {
    return TIME_SLOTS.includes(value);
}

export function getRestaurantNow(
    now: Date = new Date(),
    timeZone: string = RESTAURANT_TIME_ZONE,
): RestaurantNow {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
    }).formatToParts(now);

    const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '0';

    return {
        date: `${get('year')}-${get('month')}-${get('day')}`,
        minutes: Number(get('hour')) * 60 + Number(get('minute')),
    };
}

const utcDay = (date: string) => {
    const [y, m, d] = date.split('-').map(Number);
    return Date.UTC(y, m - 1, d);
};

/** Сколько дней от `from` до `to` (отрицательное, если `to` раньше) */
export const daysBetween = (from: string, to: string) =>
    Math.round((utcDay(to) - utcDay(from)) / DAY_MS);

/** 0 — воскресенье … 6 — суббота */
export const weekdayOf = (date: string) => new Date(utcDay(date)).getUTCDay();

export const timeToMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
};

export function isSlotInPast(date: string, time: string, now: RestaurantNow): boolean {
    const diff = daysBetween(now.date, date);
    return diff < 0 || (diff === 0 && timeToMinutes(time) <= now.minutes);
}

/** «YYYY-MM-DD HH:MM:00» (наивное время ресторана) со сдвигом в минутах; корректно переходит через полночь */
export function toTimestamp(date: string, time: string, addMinutes = 0): string {
    const [y, m, d] = date.split('-').map(Number);
    const ts = new Date(Date.UTC(y, m - 1, d, 0, timeToMinutes(time) + addMinutes));
    const p = (n: number) => String(n).padStart(2, '0');

    return `${ts.getUTCFullYear()}-${p(ts.getUTCMonth() + 1)}-${p(ts.getUTCDate())} ${p(
        ts.getUTCHours(),
    )}:${p(ts.getUTCMinutes())}:00`;
}