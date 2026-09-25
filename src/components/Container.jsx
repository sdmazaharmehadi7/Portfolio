import React from 'react';

/**
 * Container
 * Restricts maximum content width to 1240px with responsive horizontal padding.
 */
export default function Container({
  children,
  className = '',
  style = {},
  as: Component = 'div',
  ...props
}) {
  return (
    <Component
      className={`container ${className}`.trim()}
      style={{
        width: '100%',
        maxWidth: 'var(--container-max-width, 1240px)',
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingLeft: '1.5rem',
        paddingRight: '1.5rem',
        ...style
      }}
      {...props}
    >
      {children}
    </Component>
  );
}
