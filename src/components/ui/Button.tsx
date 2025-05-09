import React from 'react';
import './Button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    fullWidth?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    className = '',
    disabled,
    ...props
}) => {
    const baseStyles = 'button-base';

    const variants = {
        primary: 'button-primary',
        secondary: 'button-secondary',
        outline: 'button-outline',
        ghost: 'button-ghost',
        danger: 'button-danger',
    };

    const sizes = {
        sm: 'button-sm',
        md: 'button-md',
        lg: 'button-lg',
    };

    const widthClass = fullWidth ? 'button-fullwidth' : '';
    const disabledClass = disabled || isLoading ? 'button-disabled' : '';

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${disabledClass} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && (
                <svg className="button-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="button-spinner-bg" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="button-spinner-fg" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            )}
            {!isLoading && leftIcon && <span className="button-lefticon">{leftIcon}</span>}
            {children}
            {!isLoading && rightIcon && <span className="button-righticon">{rightIcon}</span>}
        </button>
    );
};

export default Button;