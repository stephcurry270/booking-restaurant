import type { AvailabilityResponse, CreatedBooking, TableAvailability } from '@/entities/table';
import { buildAvailability, pickCandidates } from './availability';
import { BookingsRepo, SlotTakenError } from './bookingRepo';
import {
    BOOKING_DURATION_MINUTES,
    isSlotInPast,
    RestaurantNow,
    toTimestamp,
} from './time';
import type { AvailabilityQuery, BookingInput } from './validation';

export type BookingFailure =
    | 'PAST_SLOT'
    | 'TABLE_NOT_FOUND'
    | 'TABLE_TOO_SMALL'
    | 'TABLE_TAKEN'
    | 'NO_TABLES';

export type CreateBookingResult =
    | { ok: true; booking: CreatedBooking }
    | { ok: false; code: BookingFailure };

const slotWindow = (date: string, time: string) => ({
    startsAt: toTimestamp(date, time),
    endsAt: toTimestamp(date, time, BOOKING_DURATION_MINUTES),
});

async function loadTables(
    repo: BookingsRepo,
    { date, time, guests }: AvailabilityQuery,
    now: RestaurantNow,
): Promise<TableAvailability[]> {
    const { startsAt, endsAt } = slotWindow(date, time);
    const bookedTableIds = await repo.getBookedTableIds(startsAt, endsAt);

    return buildAvailability({ date, time, guests, now, bookedTableIds });
}

export async function getAvailability(
    repo: BookingsRepo,
    query: AvailabilityQuery,
    now: RestaurantNow,
): Promise<AvailabilityResponse> {
    const tables = await loadTables(repo, query, now);

    return {
        ...query,
        tables,
        freeCount: tables.filter((t) => t.status === 'free').length,
    };
}

export async function createBooking(
    repo: BookingsRepo,
    input: BookingInput,
    now: RestaurantNow,
): Promise<CreateBookingResult> {
    if (isSlotInPast(input.date, input.time, now)) {
        return { ok: false, code: 'PAST_SLOT' };
    }

    const tables = await loadTables(repo, input, now);
    let candidates: TableAvailability[];

    if (input.tableId !== null) {
        const chosen = tables.find((t) => t.id === input.tableId);
        if (!chosen) return { ok: false, code: 'TABLE_NOT_FOUND' };
        if (chosen.status === 'busy') return { ok: false, code: 'TABLE_TAKEN' };
        if (chosen.status === 'too_small') return { ok: false, code: 'TABLE_TOO_SMALL' };
        candidates = [chosen];
    } else {
        // «Любой свободный»: самый маленький из подходящих столиков
        candidates = pickCandidates(tables, input.guests);
        if (candidates.length === 0) return { ok: false, code: 'NO_TABLES' };
    }

    const { startsAt, endsAt } = slotWindow(input.date, input.time);

    for (const table of candidates) {
        try {
            const { id } = await repo.insert({
                name: input.name,
                phone: input.phone,
                guests: input.guests,
                tableId: table.id,
                startsAt,
                endsAt,
            });
            return { ok: true, booking: { id, tableId: table.id, startsAt } };
        } catch (error) {
            // Столик заняли между проверкой и записью — пробуем следующий
            if (error instanceof SlotTakenError) continue;
            throw error;
        }
    }

    return { ok: false, code: input.tableId !== null ? 'TABLE_TAKEN' : 'NO_TABLES' };
}

