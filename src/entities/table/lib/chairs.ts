import type { ChairSide, PlanTable } from '../model/types';

export const CHAIR_RADIUS = 5;
/** Расстояние от края стола до центра стула */
const CHAIR_OFFSET = 8;
/* Шаг между стульями: чтобы соседние не сливались в сплошную цепочку */
const CHAIR_STEP = CHAIR_RADIUS * 2 + 5;

export interface Chair {
    x: number;
    y: number;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

export function getChairs(table: PlanTable): Chair[] {
    if (table.shape === 'round') {
        const count = Math.min(table.seats, 8);
        const distance = table.r + CHAIR_OFFSET;

        return Array.from({ length: count }, (_, i) => {
            const angle = ((-90 + (360 * i) / count) * Math.PI) / 180;
            return {
                x: round1(table.x + distance * Math.cos(angle)),
                y: round1(table.y + distance * Math.sin(angle)),
            };
        });
    }

    const sides: ChairSide[] = table.chairSides ?? (table.w >= table.h ? ['top', 'bottom'] : ['left', 'right']);
    const sideLength = (side: ChairSide) => (side === 'top' || side === 'bottom' ? table.w : table.h);
    const capacity = (side: ChairSide) => Math.max(1, Math.floor(sideLength(side) / CHAIR_STEP));

    // Раскладываем места по сторонам по кругу, пока есть места и вместимость сторон
    const counts = sides.map(() => 0);
    let remaining = table.seats;
    let placedInRound = true;
    while (remaining > 0 && placedInRound) {
        placedInRound = false;
        sides.forEach((side, i) => {
            if (remaining > 0 && counts[i] < capacity(side)) {
                counts[i] += 1;
                remaining -= 1;
                placedInRound = true;
            }
        });
    }

    return sides.flatMap((side, i) =>
        Array.from({ length: counts[i] }, (_, k) => {
            const offset = ((k + 0.5) * sideLength(side)) / counts[i];
            switch (side) {
                case 'top':
                    return { x: round1(table.x + offset), y: table.y - CHAIR_OFFSET };
                case 'bottom':
                    return { x: round1(table.x + offset), y: table.y + table.h + CHAIR_OFFSET };
                case 'left':
                    return { x: table.x - CHAIR_OFFSET, y: round1(table.y + offset) };
                case 'right':
                    return { x: table.x + table.w + CHAIR_OFFSET, y: round1(table.y + offset) };
            }
        }),
    );
}