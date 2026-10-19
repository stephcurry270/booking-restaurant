import { useState, useRef, useEffect, useId, KeyboardEvent, ReactNode } from 'react';
import { ChevronDownIcon } from '../icons';
import styles from './CustomSelect.module.scss';

export interface Option<T extends string | number = string | number> {
  value: T;
  label: string;
}

interface CustomSelectProps<T extends string | number> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  placeholder?: string;
  error?: string | boolean;
  icon?: ReactNode;
  id?: string;
  labelledBy?: string;
  describedBy?: string;
}

export const CustomSelect = <T extends string | number>({
                                                          options,
                                                          value,
                                                          onChange,
                                                          placeholder = 'Выберите...',
                                                          error,
                                                          icon,
                                                          id,
                                                          labelledBy,
                                                          describedBy,
                                                        }: CustomSelectProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const selectedIndex = options.findIndex((opt) => opt.value === value);
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : undefined;
  const optionId = (index: number) => `${listId}-option-${index}`;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Прокручиваем список к элементу, выбранному с клавиатуры
  useEffect(() => {
    if (!isOpen || activeIndex < 0) return;
    const item = listRef.current?.children[activeIndex] as HTMLElement | undefined;
    item?.scrollIntoView?.({ block: 'nearest' });
  }, [isOpen, activeIndex]);

  const openList = () => {
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setIsOpen(true);
  };

  const handleSelect = (optionValue: T) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) openList();
        else setActiveIndex((i) => Math.min(i + 1, options.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (!isOpen) openList();
        else setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case 'Home':
        if (isOpen) {
          e.preventDefault();
          setActiveIndex(0);
        }
        break;
      case 'End':
        if (isOpen) {
          e.preventDefault();
          setActiveIndex(options.length - 1);
        }
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (!isOpen) openList();
        else if (options[activeIndex]) handleSelect(options[activeIndex].value);
        break;
      case 'Escape':
        if (isOpen) {
          e.preventDefault();
          setIsOpen(false);
        }
        break;
    }
  };

  return (
      <div className={styles.selectContainer} ref={containerRef}>
        <div
            id={id}
            tabIndex={0}
            role="combobox"
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-controls={isOpen ? listId : undefined}
            aria-activedescendant={isOpen && activeIndex >= 0 ? optionId(activeIndex) : undefined}
            aria-labelledby={labelledBy}
            aria-describedby={describedBy}
            aria-invalid={error ? true : undefined}
            className={`${styles.selectHeader} ${error ? styles.error : ''} ${isOpen ? styles.open : ''}`}
            onClick={() => (isOpen ? setIsOpen(false) : openList())}
            onKeyDown={handleKeyDown}
            onBlur={() => setIsOpen(false)}
        >
        <span className={styles.valueGroup}>
          {icon && <span className={styles.icon}>{icon}</span>}
          <span className={!selectedOption ? styles.placeholder : ''}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>
          <span className={`${styles.arrow} ${isOpen ? styles.arrowUp : ''}`}>
          <ChevronDownIcon size={16} />
        </span>
        </div>

        {isOpen && (
            <div
                id={listId}
                ref={listRef}
                className={styles.dropdownList}
                role="listbox"
                aria-labelledby={labelledBy}
                // Не даём фокусу уйти с поля при клике по списку или полосе прокрутки
                onMouseDown={(e) => e.preventDefault()}
            >
              {options.map((opt, index) => (
                  <div
                      key={opt.value}
                      id={optionId(index)}
                      role="option"
                      aria-selected={opt.value === value}
                      className={[
                        styles.dropdownItem,
                        opt.value === value ? styles.selected : '',
                        index === activeIndex ? styles.active : '',
                      ].join(' ')}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => handleSelect(opt.value)}
                  >
                    {opt.label}
                  </div>
              ))}
            </div>
        )}
      </div>
  );
};
