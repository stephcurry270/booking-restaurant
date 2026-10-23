// Глубокий импорт намеренно: публичный index сущности содержит React-компоненты и SCSS,
// которые не должны попадать в серверный бандл API-роутов.
import { HALL_TABLES } from '@/entities/table/config/hallLayout';
import type { HallTable, TableAvailability } from '@/entities/table/model/types';
import { isTableBusyBySimulation } from './occupancy';
import type { RestaurantNow } from './time';

interface BuildAvailabilityParams {
    date: string;
    time: string;
    guests: number;
    now: RestaurantNow;
    /** Столики, занятые реальными бронями на это окно времени */
    bookedTableIds: Set<number>;
    tables?: HallTable[];
}

export function buildAvailability({
                                      date,
                                      time,
                                      guests,
                                      now,
                                      bookedTableIds,
                                      tables = HALL_TABLES,
                                  }: BuildAvailabilityParams): TableAvailability[] {
    return tables.map((table) => {
        const isBusy =
            bookedTableIds.has(table.id) || isTableBusyBySimulation(table.id, date, time, now);

        if (isBusy) return { ...table, status: 'busy' };
        if (table.seats < guests) return { ...table, status: 'too_small' };
        return { ...table, status: 'free' };
    });
}

/** Свободные подходящие столики: сначала самые маленькие из достаточных */
export function pickCandidates(tables: TableAvailability[], guests: number): TableAvailability[] {
    return tables
        .filter((t) => t.status === 'free' && t.seats >= guests)
        .sort((a, b) => a.seats - b.seats || a.id - b.id);
}