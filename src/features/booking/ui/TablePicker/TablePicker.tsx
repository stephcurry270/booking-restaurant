import { useState } from 'react';
import { HALL_TABLES, HallMap, seatsLabel, useTableAvailability } from '@/entities/table';
import { GUEST_OPTIONS } from '@/shared/config/constants';
import { MapPinIcon } from '@/shared/ui/icons';
import { Modal } from '@/shared/ui/Modal/Modal';
import { formatDateRu } from '../../model/dateUtils';
import styles from './TablePicker.module.scss';

interface TablePickerProps {
    id: string;
    /** id подписи поля */
    labelledBy: string;
    date: string;
    time: string;
    guests: number;
    /** null — «любой свободный» */
    value: number | null;
    onChange: (tableId: number | null) => void;
    /** Показать пояснение, что выбор сброшен из-за смены даты, времени или числа гостей */
    resetNotice?: boolean;
}

const seatsOf = (tableId: number | null) => HALL_TABLES.find((t) => t.id === tableId)?.seats;

export const TablePicker = ({
                                id,
                                labelledBy,
                                date,
                                time,
                                guests,
                                value,
                                onChange,
                                resetNotice,
                            }: TablePickerProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [draft, setDraft] = useState<number | null>(value);

    const canOpen = Boolean(date && time);
    const valueId = `${id}-value`;

    // Занятость грузим только пока окно открыто
    const { data, isLoading, isError, retry } = useTableAvailability(
        isOpen ? { date, time, guests } : null,
    );

    const open = () => {
        setDraft(value);
        setIsOpen(true);
    };
    const close = () => setIsOpen(false);
    const confirm = () => {
        onChange(draft);
        close();
    };
    const chooseAny = () => {
        onChange(null);
        close();
    };
    const toggleDraft = (tableId: number) => setDraft((prev) => (prev === tableId ? null : tableId));

    const selectedSeats = seatsOf(value);
    const draftSeats = seatsOf(draft);

    let triggerText = 'Любой свободный';
    if (!canOpen) triggerText = 'Сначала выберите дату и время';
    else if (value !== null && selectedSeats) {
        triggerText = `Столик № ${value} · ${seatsLabel(selectedSeats)}`;
    }

    let statusText = '';
    if (draft !== null && draftSeats) statusText = `Столик № ${draft} · ${seatsLabel(draftSeats)}`;
    else if (isLoading) statusText = 'Загружаю занятость столиков…';
    else if (data) {
        statusText =
            data.freeCount === 0
                ? 'На это время свободных столиков нет. Попробуйте другое время.'
                : `Свободно столиков: ${data.freeCount}`;
    }

    const guestsLabel = GUEST_OPTIONS.find((option) => option.value === guests)?.label ?? `${guests}`;

    return (
        <>
            <button
                type="button"
                id={id}
                className={styles.trigger}
                disabled={!canOpen}
                aria-haspopup="dialog"
                aria-labelledby={`${labelledBy} ${valueId}`}
                onClick={open}
            >
        <span className={styles.valueGroup}>
          <span className={styles.icon}>
            <MapPinIcon />
          </span>
          <span id={valueId} className={canOpen ? undefined : styles.placeholder}>
            {triggerText}
          </span>
        </span>
                {canOpen && <span className={styles.action}>{value === null ? 'Выбрать на схеме' : 'Изменить'}</span>}
            </button>

            {resetNotice && value === null && (
                <p className={styles.notice} role="status">
                    Выбор столика сброшен: вы изменили дату, время или количество гостей.
                </p>
            )}

            <Modal
                open={isOpen}
                onClose={close}
                title="Выберите столик"
                description={canOpen ? `${formatDateRu(date)}, ${time} · ${guestsLabel}` : undefined}
                footer={
                    isOpen && (
                        <>
                            <p className={styles.status} role="status">
                                {statusText}
                            </p>
                            <div className={styles.actions}>
                                <button
                                    type="button"
                                    className={styles.secondary}
                                    onClick={chooseAny}
                                    disabled={data?.freeCount === 0}
                                >
                                    Любой свободный
                                </button>
                                <button
                                    type="button"
                                    className={styles.primary}
                                    onClick={confirm}
                                    disabled={draft === null}
                                >
                                    {draft === null ? 'Выберите столик' : `Выбрать столик № ${draft}`}
                                </button>
                            </div>
                        </>
                    )
                }
            >
                {isOpen && (
                    <>
                        {isError && (
                            <p className={styles.error} role="alert">
                                Не удалось загрузить занятость столиков.{' '}
                                <button type="button" className={styles.link} onClick={retry}>
                                    Повторить
                                </button>
                            </p>
                        )}
                        <HallMap tables={data?.tables} selectedId={draft} onSelect={toggleDraft} />
                    </>
                )}
            </Modal>
        </>
    );
};
