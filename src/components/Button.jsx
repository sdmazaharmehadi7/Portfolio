import React, { useState } from 'react';

/**
 * Button
 * Minimal, monochrome, typography-focused button / anchor component.
 * Variants: 'primary' | 'secondary' | 'ghost'
 * Sizes: 'sm' | 'md' | 'lg'
 */
export default function Button({
  children,
  variant = 'secondary',
  size = 'md',
  href,
  onClick,
  disabled = false,
  className = '',
  style = {},
  mono = false,
  ...props
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Size specifications
  const sizeStyles = {
    sm: {
      padding: '0.35rem 0.75rem',
      fontSize: 'var(--font-size-xs, 0.75rem)',
      height: '32px'
    },
    md: {
      padding: '0.5rem 1rem',
      fontSize: 'var(--font-size-sm, 0.875rem)',
      height: '40px'
    },
    lg: {
      padding: '0.75rem 1.5rem',
      fontSize: 'var(--font-size-base, 1rem)',
      height: '48px'
    }
  }[size] || sizeStyles.md;

  // Variant specifications
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: isHovered ? '#E4E4E7' : '#FFFFFF',
          color: '#000000',
          border: '1px solid #FFFFFF',
          fontWeight: 500,
          boxShadow: isHovered ? '0 4px 14px rgba(255, 255, 255, 0.08)' : 'none'
        };
      case 'ghost':
        return {
          backgroundColor: isHovered ? 'var(--color-surface, #0A0A0A)' : 'transparent',
          color: isHovered ? 'var(--color-primary, #FFFFFF)' : 'var(--color-secondary, #A1A1AA)',
          border: '1px solid transparent',
          fontWeight: 400
        };
      case 'secondary':
      default:
        return {
          backgroundColor: isHovered ? 'var(--color-surface, #0A0A0A)' : 'transparent',
          color: isHovered ? 'var(--color-primary, #FFFFFF)' : 'var(--color-secondary, #A1A1AA)',
          border: `1px solid ${isHovered ? 'var(--color-border-hover, rgba(255, 255, 255, 0.20))' : 'var(--color-border, rgba(255, 255, 255, 0.10))'}`,
          fontWeight: 400
        };
    }
  };

  const transformStyle = disabled
    ? 'none'
    : isPressed
      ? 'translateY(1px)'
      : isHovered
        ? 'translateY(-1px)'
        : 'translateY(0)';

  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    borderRadius: 'var(--radius-md, 6px)',
    fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)',
    letterSpacing: mono ? 'var(--tracking-normal)' : 'var(--tracking-tight)',
    textDecoration: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.45 : 1,
    transform: transformStyle,
    transition: 'background-color 240ms cubic-bezier(0.16, 1, 0.3, 1), border-color 240ms cubic-bezier(0.16, 1, 0.3, 1), color 240ms cubic-bezier(0.16, 1, 0.3, 1), transform 180ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 240ms cubic-bezier(0.16, 1, 0.3, 1)',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    ...sizeStyles,
    ...getVariantStyles(),
    ...style
  };

  const eventHandlers = {
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => {
      setIsHovered(false);
      setIsPressed(false);
    },
    onMouseDown: () => setIsPressed(true),
    onMouseUp: () => setIsPressed(false)
  };

  if (href && !disabled) {
    return (
      <a
        href={href}
        className={`btn btn-${variant} ${className}`.trim()}
        style={baseStyles}
        {...eventHandlers}
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={`btn btn-${variant} ${className}`.trim()}
      style={baseStyles}
      onClick={onClick}
      disabled={disabled}
      {...eventHandlers}
      {...props}
    >
      {children}
    </button>
  );
}
