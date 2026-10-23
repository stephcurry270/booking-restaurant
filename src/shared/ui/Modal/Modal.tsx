import { MouseEvent, ReactNode, useEffect, useId, useRef } from 'react';
import { CloseIcon } from '../icons';
import styles from './Modal.module.scss';

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: ReactNode;
    footer?: ReactNode;
}

/** Модальное окно на нативном <dialog>: Esc, ловушка фокуса и подложка работают из коробки */
export const Modal = ({ open, onClose, title, description, children, footer }: ModalProps) => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const titleId = useId();
    const descriptionId = useId();

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    // Пока окно открыто, страница под ним не прокручивается
    useEffect(() => {
        if (!open) return;

        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = previous;
        };
    }, [open]);

    // Клик по подложке: target — сам <dialog>, а не его содержимое
    const handleClick = (event: MouseEvent<HTMLDialogElement>) => {
        if (event.target === event.currentTarget) onClose();
    };

    return (
        <dialog
            ref={dialogRef}
            className={styles.dialog}
            aria-labelledby={titleId}
            aria-describedby={description ? descriptionId : undefined}
            onClose={onClose}
            onClick={handleClick}
        >
            <div className={styles.panel}>
                <header className={styles.header}>
                    <div>
                        <h2 id={titleId} className={styles.title}>
                            {title}
                        </h2>
                        {description && (
                            <p id={descriptionId} className={styles.description}>
                                {description}
                            </p>
                        )}
                    </div>
                    <button type="button" className={styles.close} aria-label="Закрыть" onClick={onClose}>
                        <CloseIcon size={18} />
                    </button>
                </header>

                <div className={styles.body}>{children}</div>

                {footer && <footer className={styles.footer}>{footer}</footer>}
            </div>
        </dialog>
    );
};
