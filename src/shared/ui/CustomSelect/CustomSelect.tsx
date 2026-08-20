import { useState, useRef, useEffect } from 'react';
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
}

export const CustomSelect = <T extends string | number>({
  options,
  value,
  onChange,
  placeholder  = 'Выберите...',
  error,
}: CustomSelectProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: T) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={styles.selectContainer} ref={containerRef}>
      <div
        tabIndex={0}
        role="button"
        aria-expanded={isOpen}
        className={`${styles.selectHeader} ${error ? styles.error : ''} ${isOpen ? styles.open : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen((prev) => !prev);
          }
        }}
      >
        <span className={!selectedOption ? styles.placeholder : ''}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className={`${styles.arrow} ${isOpen ? styles.arrowUp : ''}`}>▾</span>
      </div>

      {isOpen && (
        <div className={styles.dropdownList} role="listbox">
          {options.map((opt) => (
            <div
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              className={`${styles.dropdownItem} ${opt.value === value ? styles.selected : ''}`}
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