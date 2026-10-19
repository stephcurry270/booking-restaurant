const pad = (n: number) => String(n).padStart(2, '0');

export function toLocalDateString(date: Date = new Date()): string {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseLocalDate(value: string): Date | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) return null;

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = new Date(year, month - 1, day);

    const isReal =
        date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;

    return isReal ? date : null;
}

export function startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function isSlotInPast(date: string, time: string, now: Date = new Date()): boolean {
    const day = parseLocalDate(date);
    const timeMatch = /^(\d{2}):(\d{2})$/.exec(time);
    if (!day || !timeMatch) return false;

    const slot = new Date(
        day.getFullYear(),
        day.getMonth(),
        day.getDate(),
        Number(timeMatch[1]),
        Number(timeMatch[2]),
    );

    return slot.getTime() <= now.getTime();
}

export function formatDateRu(value: string): string {
    const date = parseLocalDate(value);
    if (!date) return value;

    return new Intl.DateTimeFormat('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(date);
}