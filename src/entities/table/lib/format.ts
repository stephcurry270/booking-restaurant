/** 1 место, 2 места, 5 мест */
export function seatsLabel(count: number): string {
    const mod10 = count % 10;
    const mod100 = count % 100;

    if (mod10 === 1 && mod100 !== 11) return `${count} место`;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return `${count} места`;
    return `${count} мест`;
}