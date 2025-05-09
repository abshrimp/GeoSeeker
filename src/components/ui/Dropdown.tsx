import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import './Dropdown.css';

interface DropdownOption {
    value: string;
    label: string;
}

interface DropdownProps {
    options: DropdownOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    disabled?: boolean;
    fullWidth?: boolean;
    className?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
    options,
    value,
    onChange,
    placeholder = 'Select an option',
    label,
    disabled = false,
    fullWidth = false,
    className = '',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(option => option.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div className={`dropdown-root${fullWidth ? ' dropdown-fullwidth' : ''} ${className}`} ref={dropdownRef}>
            {label && <label className="dropdown-label">{label}</label>}
            <button
                type="button"
                className={`dropdown-btn${fullWidth ? ' dropdown-btn-fullwidth' : ''}${disabled ? ' dropdown-btn-disabled' : ''}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                disabled={disabled}
            >
                <span className="dropdown-btn-text">
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <span className="dropdown-btn-chevron">
                    <ChevronDown className="dropdown-chevronicon" />
                </span>
            </button>

            {isOpen && (
                <div className="dropdown-listbox">
                    <ul tabIndex={-1} role="listbox" aria-labelledby="listbox-label" aria-activedescendant="listbox-option-0">
                        {options.map((option, index) => (
                            <li
                                key={option.value}
                                className={`dropdown-option${option.value === value ? ' dropdown-option-selected' : ''}`}
                                id={`listbox-option-${index}`}
                                role="option"
                                aria-selected={option.value === value}
                                onClick={() => handleSelect(option.value)}
                            >
                                <span className={`dropdown-option-text${option.value === value ? ' dropdown-option-text-selected' : ''}`}>
                                    {option.label}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Dropdown;