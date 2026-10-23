export interface HallTable {
    /** Номер столика на схеме зала (он же идентификатор) */
    id: number;
    seats: number;
}

export type TableStatus = 'free' | 'busy' | 'too_small';

export interface TableAvailability extends HallTable {
    status: TableStatus;
}

export interface AvailabilityResponse {
    date: string;
    time: string;
    guests: number;
    tables: TableAvailability[];
    freeCount: number;
}

export interface ApiError {
    error: string;
    message?: string;
    fields?: Record<string, string>;
}

export interface CreatedBooking {
    id: number;
    tableId: number;
    startsAt: string;
}

/* ---------- Геометрия схемы зала (только для отрисовки карты) ---------- */

export type ChairSide = 'top' | 'right' | 'bottom' | 'left';

export interface RoundPlanTable extends HallTable {
    shape: 'round';
    /** центр */
    x: number;
    y: number;
    r: number;
}

export interface RectPlanTable extends HallTable {
    shape: 'rect';
    /** левый верхний угол */
    x: number;
    y: number;
    w: number;
    h: number;
    /** С каких сторон стоят стулья; [] — стульев нет (диванчики) */
    chairSides?: ChairSide[];
}

export type PlanTable = RoundPlanTable | RectPlanTable;

export interface Box {
    x: number;
    y: number;
    w: number;
    h: number;
}

export interface HallDecor {
    width: number;
    height: number;
    /** SVG-пути стен и перегородок */
    walls: string[];
    /** Пунктирные зоны: служебные помещения, лестница, гардероб */
    zones: (Box & { label?: string })[];
    /** Диванчики */
    sofas: Box[];
    bar: Box & { stools: number[]; stoolY: number };
}