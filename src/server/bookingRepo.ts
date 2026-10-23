import type { NeonQueryFunction } from '@neondatabase/serverless';

export interface NewBooking {
    name: string;
    phone: string;
    guests: number;
    tableId: number;
    /** «YYYY-MM-DD HH:MM:SS», время ресторана */
    startsAt: string;
    endsAt: string;
}

export interface BookingsRepo {
    /** Столики, у которых есть бронь, пересекающаяся с окном [startsAt, endsAt) */
    getBookedTableIds(startsAt: string, endsAt: string): Promise<Set<number>>;
    /** Бросает SlotTakenError, если столик на это время уже занят */
    insert(booking: NewBooking): Promise<{ id: number }>;
}

export class SlotTakenError extends Error {
    constructor() {
        super('Table is already booked for this time');
        this.name = 'SlotTakenError';
    }
}

/* ---------------- Postgres (Neon) ---------------- */

type Sql = NeonQueryFunction<false, false>;

// Код ошибки Postgres exclusion_violation (сработало ограничение на пересечение броней)
const EXCLUSION_VIOLATION = '23P01';

function createPgRepo(): BookingsRepo {
    let sqlPromise: Promise<Sql> | undefined;

    // Драйвер подгружаем лениво, чтобы локальная работа без БД его не требовала
    const getSql = () => {
        sqlPromise ??= import('@neondatabase/serverless').then(
            ({ neon }) => neon(process.env.DATABASE_URL as string) as Sql,
        );
        return sqlPromise;
    };

    return {
        async getBookedTableIds(startsAt, endsAt) {
            const sql = await getSql();
            const rows = await sql`
        select table_id from bookings
        where starts_at < ${endsAt}::timestamp and ends_at > ${startsAt}::timestamp
      `;
            return new Set(rows.map((row) => Number(row.table_id)));
        },

        async insert(b) {
            const sql = await getSql();
            try {
                const rows = await sql`
          insert into bookings (name, phone, guests, table_id, starts_at, ends_at)
          values (${b.name}, ${b.phone}, ${b.guests}, ${b.tableId},
                  ${b.startsAt}::timestamp, ${b.endsAt}::timestamp)
          returning id
        `;
                return { id: Number(rows[0].id) };
            } catch (error) {
                if ((error as { code?: string }).code === EXCLUSION_VIOLATION) {
                    throw new SlotTakenError();
                }
                throw error;
            }
        },
    };
}

/* ---------------- Память (только для локальной разработки) ---------------- */

interface StoredBooking extends NewBooking {
    id: number;
}

const globalForMemory = globalThis as unknown as { __memoryBookings?: StoredBooking[] };

function createMemoryRepo(): BookingsRepo {
    // globalThis переживает горячую перезагрузку модулей в next dev
    const store = (globalForMemory.__memoryBookings ??= []);

    // строки «YYYY-MM-DD HH:MM:SS» корректно сравниваются как текст
    const overlaps = (b: StoredBooking, startsAt: string, endsAt: string) =>
        b.startsAt < endsAt && b.endsAt > startsAt;

    return {
        async getBookedTableIds(startsAt, endsAt) {
            return new Set(store.filter((b) => overlaps(b, startsAt, endsAt)).map((b) => b.tableId));
        },

        async insert(booking) {
            const taken = store.some(
                (b) => b.tableId === booking.tableId && overlaps(b, booking.startsAt, booking.endsAt),
            );
            if (taken) throw new SlotTakenError();

            const id = store.length + 1;
            store.push({ ...booking, id });
            return { id };
        },
    };
}

/* ---------------- Выбор реализации ---------------- */

let pgRepo: BookingsRepo | undefined;

export function getRepo(): BookingsRepo {
    if (process.env.DATABASE_URL) {
        pgRepo ??= createPgRepo();
        return pgRepo;
    }

    if (process.env.NODE_ENV === 'production') {
        // В продакшене молча терять брони в памяти нельзя
        throw new Error('DATABASE_URL is not set');
    }

    return createMemoryRepo();
}

export { createMemoryRepo };