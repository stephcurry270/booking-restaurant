import { KeyboardEvent, useMemo } from 'react';
import { HALL_DECOR, PLAN_TABLES } from '../config/hallLayout';
import { CHAIR_RADIUS, getChairs } from '../lib/chairs';
import { seatsLabel } from '../lib/format';
import type { PlanTable, TableAvailability, TableStatus } from '../model/types'
import styles from './HallMap.module.scss';

interface HallMapProps {
    /** Статусы столиков. Пока undefined (идёт загрузка), схема показывается приглушённой */
    tables?: TableAvailability[];
    selectedId: number | null;
    onSelect: (id: number) => void;
}

const STATUS_LABEL: Record<TableStatus, string> = {
    free: 'свободен',
    busy: 'занят',
    too_small: 'мало мест для вашей компании',
};

const cx = (...names: (string | false | undefined)[]) => names.filter(Boolean).join(' ');

const labelPosition = (table: PlanTable) =>
    table.shape === 'round'
        ? { x: table.x, y: table.y }
        : { x: table.x + table.w / 2, y: table.y + table.h / 2 };

export const HallMap = ({ tables, selectedId, onSelect }: HallMapProps) => {
    const statusById = useMemo(
        () => new Map(tables?.map((table) => [table.id, table.status])),
        [tables],
    );
    const hasTooSmall = tables?.some((table) => table.status === 'too_small');
    const { width, height, walls, zones, sofas, bar } = HALL_DECOR;

    const handleKeyDown = (event: KeyboardEvent<SVGGElement>, id: number) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onSelect(id);
        }
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.scroll}>
                <svg
                    className={styles.svg}
                    viewBox={`0 0 ${width} ${height}`}
                    role="group"
                    aria-label="Схема зала"
                >
                    {walls.map((d) => (
                        <path key={d} d={d} className={styles.wall} />
                    ))}

                    {zones.map((zone) => (
                        <g key={`${zone.x}-${zone.y}`}>
                            <rect x={zone.x} y={zone.y} width={zone.w} height={zone.h} className={styles.zone} />
                            {zone.label && (
                                <text
                                    x={zone.x + zone.w / 2}
                                    y={zone.y + zone.h / 2}
                                    className={styles.zoneLabel}
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                >
                                    {zone.label}
                                </text>
                            )}
                        </g>
                    ))}

                    {sofas.map((sofa) => (
                        <rect
                            key={`${sofa.x}-${sofa.y}`}
                            x={sofa.x}
                            y={sofa.y}
                            width={sofa.w}
                            height={sofa.h}
                            rx={4}
                            className={styles.sofa}
                        />
                    ))}

                    <rect x={bar.x} y={bar.y} width={bar.w} height={bar.h} rx={6} className={styles.bar} />
                    <text
                        x={bar.x + bar.w / 2}
                        y={bar.y + bar.h / 2}
                        className={styles.barLabel}
                        textAnchor="middle"
                        dominantBaseline="central"
                    >
                        Бар
                    </text>
                    {bar.stools.map((x) => (
                        <circle key={x} cx={x} cy={bar.stoolY} r={7} className={styles.stool} />
                    ))}

                    {PLAN_TABLES.map((table) => {
                        const status = statusById.get(table.id);
                        const isSelected = table.id === selectedId;
                        const isInteractive = status === 'free';
                        const label = [
                            `Столик ${table.id}`,
                            seatsLabel(table.seats),
                            isSelected ? 'выбран' : status ? STATUS_LABEL[status] : 'загрузка',
                        ].join(', ');
                        const position = labelPosition(table);

                        return (
                            <g
                                key={table.id}
                                className={cx(
                                    styles.table,
                                    status ? styles[status === 'too_small' ? 'tooSmall' : status] : styles.pending,
                                    isSelected && styles.selected,
                                )}
                                role="button"
                                tabIndex={isInteractive ? 0 : -1}
                                aria-pressed={isSelected}
                                aria-disabled={!isInteractive}
                                aria-label={label}
                                onClick={isInteractive ? () => onSelect(table.id) : undefined}
                                onKeyDown={isInteractive ? (event) => handleKeyDown(event, table.id) : undefined}
                            >
                                <title>{label}</title>

                                {getChairs(table).map((chair) => (
                                    <circle
                                        key={`${chair.x}-${chair.y}`}
                                        cx={chair.x}
                                        cy={chair.y}
                                        r={CHAIR_RADIUS}
                                        className={styles.chair}
                                    />
                                ))}

                                {table.shape === 'round' ? (
                                    <circle cx={table.x} cy={table.y} r={table.r} className={styles.shape} />
                                ) : (
                                    <rect
                                        x={table.x}
                                        y={table.y}
                                        width={table.w}
                                        height={table.h}
                                        rx={6}
                                        className={styles.shape}
                                    />
                                )}

                                <text
                                    x={position.x}
                                    y={position.y}
                                    className={styles.number}
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                >
                                    {table.id}
                                </text>
                            </g>
                        );
                    })}
                </svg>
            </div>

            <p className={styles.hint}>Схему можно прокручивать вбок, чтобы увидеть весь зал</p>

            <ul className={styles.legend}>
                <li>
                    <span className={cx(styles.swatch, styles.swatchFree)} />
                    Свободен
                </li>
                <li>
                    <span className={cx(styles.swatch, styles.swatchSelected)} />
                    Выбран
                </li>
                <li>
                    <span className={cx(styles.swatch, styles.swatchBusy)} />
                    Занят
                </li>
                {hasTooSmall && (
                    <li>
                        <span className={cx(styles.swatch, styles.swatchSmall)} />
                        Мало мест
                    </li>
                )}
            </ul>
        </div>
    );
};
