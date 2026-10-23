import { isValidDate, isValidTime } from './time';

type Fields = Record<string, string>;

export interface AvailabilityQuery {
    date: string;
    time: string;
    guests: number;
}

export interface BookingInput extends AvailabilityQuery {
    name: string;
    phone: string;
    /** null — «любой свободный» */
    tableId: number | null;
}

export type Parsed<T> = { ok: true; data: T } | { ok: false; fields: Fields };

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

function checkSlot(date: unknown, time: unknown, guests: unknown, fields: Fields) {
    if (typeof date !== 'string' || !isValidDate(date)) fields.date = 'Некорректная дата';
    if (typeof time !== 'string' || !isValidTime(time)) fields.time = 'Некорректное время';
    if (!Number.isInteger(guests) || (guests as number) < 1 || (guests as number) > 12) {
        fields.guests = 'Количество гостей от 1 до 12';
    }
}

export function parseAvailabilityQuery(
    query: Record<string, string | string[] | undefined>,
): Parsed<AvailabilityQuery> {
    const date = first(query.date);
    const time = first(query.time);
    const guests = first(query.guests) === undefined ? 1 : Number(first(query.guests));

    const fields: Fields = {};
    checkSlot(date, time, guests, fields);
    if (Object.keys(fields).length > 0) return { ok: false, fields };

    return { ok: true, data: { date: date as string, time: time as string, guests } };
}

export function normalizePhone(value: string): string | null {
    const digits = value.replace(/\D/g, '');
    if (digits.length === 11 && (digits[0] === '7' || digits[0] === '8')) {
        return `+7${digits.slice(1)}`;
    }
    return null;
}

export function parseBookingBody(body: unknown): Parsed<BookingInput> {
    const fields: Fields = {};
    const b = (typeof body === 'object' && body !== null ? body : {}) as Record<string, unknown>;

    const name = typeof b.name === 'string' ? b.name.trim() : '';
    if (name.length < 2 || name.length > 100) fields.name = 'Имя должно содержать минимум 2 символа';

    const phone = typeof b.phone === 'string' ? normalizePhone(b.phone) : null;
    if (!phone) fields.phone = 'Введите номер полностью: +7 (XXX) XXX-XX-XX';

    checkSlot(b.date, b.time, b.guests, fields);

    let tableId: number | null = null;
    if (b.tableId !== undefined && b.tableId !== null) {
        if (Number.isInteger(b.tableId)) tableId = b.tableId as number;
        else fields.tableId = 'Некорректный столик';
    }

    if (Object.keys(fields).length > 0) return { ok: false, fields };

    return {
        ok: true,
        data: {
            name,
            phone: phone as string,
            date: b.date as string,
            time: b.time as string,
            guests: b.guests as number,
            tableId,
        },
    };
}