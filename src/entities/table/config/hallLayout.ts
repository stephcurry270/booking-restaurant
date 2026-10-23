import type { HallDecor, HallTable, PlanTable } from '@/entities/table/model/types'

/**
 * Прототип схемы зала (viewBox 840×600). Нумерация сквозная: сверху вниз и слева направо по зонам.
 *  1–4   — диванная зона у входа
 *  5–8   — левая часть зала
 *  9–21  — центральная часть
 *  22–31 — нижний ряд
 * Это единственный источник правды: и карта, и сервер (список столиков и число мест) берут данные отсюда.
 */
export const PLAN_TABLES: PlanTable[] = [
    // --- диванная зона ---
    { id: 1, seats: 2, shape: 'rect', x: 65, y: 60, w: 62, h: 37, chairSides: ['bottom'] },
    { id: 2, seats: 8, shape: 'rect', x: 186, y: 56, w: 59, h: 64, chairSides: ['right', 'bottom'] },
    { id: 3, seats: 2, shape: 'rect', x: 300, y: 38, w: 32, h: 43, chairSides: [] },
    { id: 4, seats: 2, shape: 'rect', x: 300, y: 86, w: 32, h: 39, chairSides: [] },

    // --- левая часть ---
    { id: 5, seats: 12, shape: 'rect', x: 67, y: 183, w: 35, h: 89, chairSides: ['right'] },
    { id: 6, seats: 4, shape: 'rect', x: 163, y: 167, w: 49, h: 30, chairSides: ['top', 'bottom'] },
    { id: 7, seats: 4, shape: 'rect', x: 238, y: 220, w: 42, h: 56, chairSides: ['left', 'right'] },
    { id: 8, seats: 4, shape: 'round', x: 329, y: 218, r: 21 },

    // --- центр ---
    { id: 9, seats: 4, shape: 'round', x: 258, y: 358, r: 19 },
    { id: 10, seats: 4, shape: 'round', x: 270, y: 452, r: 19 },
    { id: 11, seats: 2, shape: 'round', x: 312, y: 394, r: 19 },
    { id: 12, seats: 4, shape: 'round', x: 338, y: 324, r: 19 },
    { id: 13, seats: 4, shape: 'round', x: 358, y: 444, r: 19 },
    { id: 14, seats: 2, shape: 'round', x: 392, y: 392, r: 19 },
    { id: 15, seats: 4, shape: 'round', x: 455, y: 418, r: 19 },
    { id: 16, seats: 6, shape: 'round', x: 522, y: 386, r: 23 },
    { id: 17, seats: 4, shape: 'round', x: 545, y: 448, r: 19 },
    { id: 18, seats: 4, shape: 'round', x: 585, y: 420, r: 19 },
    { id: 19, seats: 4, shape: 'round', x: 672, y: 392, r: 19 },
    { id: 20, seats: 2, shape: 'round', x: 690, y: 458, r: 19 },
    { id: 21, seats: 4, shape: 'rect', x: 734, y: 415, w: 58, h: 36, chairSides: ['top'] },

    // --- нижний ряд ---
    { id: 22, seats: 2, shape: 'rect', x: 110, y: 494, w: 48, h: 31, chairSides: ['top'] },
    { id: 23, seats: 4, shape: 'round', x: 203, y: 528, r: 21 },
    { id: 24, seats: 4, shape: 'rect', x: 255, y: 498, w: 54, h: 39, chairSides: ['top'] },
    { id: 25, seats: 4, shape: 'rect', x: 310, y: 498, w: 52, h: 39, chairSides: ['top'] },
    { id: 26, seats: 4, shape: 'round', x: 407, y: 528, r: 21 },
    { id: 27, seats: 4, shape: 'rect', x: 463, y: 498, w: 52, h: 39, chairSides: ['top'] },
    { id: 28, seats: 4, shape: 'rect', x: 515, y: 498, w: 52, h: 39, chairSides: ['top'] },
    { id: 29, seats: 4, shape: 'round', x: 620, y: 528, r: 21 },
    { id: 30, seats: 2, shape: 'rect', x: 664, y: 510, w: 40, h: 28, chairSides: ['top'] },
    { id: 31, seats: 2, shape: 'rect', x: 715, y: 498, w: 35, h: 37, chairSides: [] },
];

/** То, что нужно серверу: номер столика и число мест */
export const HALL_TABLES: HallTable[] = PLAN_TABLES.map(({ id, seats }) => ({ id, seats }));

export const HALL_DECOR: HallDecor = {
    width: 840,
    height: 600,
    walls: [
        'M 44 568 H 795',
        'M 795 285 V 568',
        'M 44 320 H 196 C 214 320 214 340 214 356 V 410 C 214 428 206 440 190 442',
        'M 370 492 V 565',
        'M 583 492 V 565',
    ],
    zones: [
        { x: 402, y: 35, w: 388, h: 170, label: 'Служебные помещения' },
        { x: 358, y: 38, w: 44, h: 127 },
        { x: 44, y: 460, w: 62, h: 102 },
    ],
    sofas: [
        { x: 43, y: 40, w: 84, h: 18 },
        { x: 170, y: 36, w: 80, h: 16 },
        { x: 168, y: 54, w: 15, h: 66 },
        { x: 277, y: 38, w: 16, h: 87 },
        { x: 336, y: 38, w: 20, h: 87 },
        { x: 48, y: 176, w: 17, h: 103 },
        { x: 736, y: 455, w: 56, h: 16 },
        { x: 114, y: 529, w: 50, h: 22 },
        { x: 248, y: 541, w: 120, h: 19 },
        { x: 458, y: 541, w: 122, h: 19 },
        { x: 754, y: 496, w: 24, h: 42 },
    ],
    bar: {
        x: 435,
        y: 218,
        w: 307,
        h: 58,
        stoolY: 293,
        stools: [449, 484, 519, 554, 589, 624, 659, 694, 729],
    },
};