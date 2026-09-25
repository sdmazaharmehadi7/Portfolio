import React from 'react';

/**
 * Divider
 * Thin hairline border divider matching the monochrome technical design system.
 */
export default function Divider({
  spacing = 'md',
  className = '',
  style = {}
}) {
  const marginStyles = {
    sm: 'var(--space-6, 1.5rem)',
    md: 'var(--space-12, 3rem)',
    lg: 'var(--space-20, 5rem)',
    none: '0'
  }[spacing] || 'var(--space-12, 3rem)';

  return (
    <hr
      className={`divider ${className}`.trim()}
      style={{
        border: 'none',
        borderTop: '1px solid var(--color-border, rgba(255, 255, 255, 0.10))',
        width: '100%',
        margin: `${marginStyles} 0`,
        ...style
      }}
    />
  );
}
