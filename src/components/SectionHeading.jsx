import React from 'react';

/**
 * SectionHeading
 * Typography-first heading component for portfolio sections.
 * Displays optional technical monospace tag, title, and descriptive subtitle.
 */
export default function SectionHeading({
  tag,
  title,
  description,
  className = '',
  style = {},
  align = 'left'
}) {
  return (
    <div
      className={`section-heading ${className}`.trim()}
      style={{
        textAlign: align,
        marginBottom: 'var(--space-10, 2.5rem)',
        ...style
      }}
    >
      {tag && (
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--font-size-xs, 0.75rem)',
            color: 'var(--color-muted, #71717A)',
            letterSpacing: 'var(--tracking-wide, 0.04em)',
            textTransform: 'uppercase',
            marginBottom: 'var(--space-2, 0.5rem)'
          }}
        >
          {tag}
        </div>
      )}

      <h2
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
          fontWeight: 500,
          lineHeight: 'var(--line-height-snug, 1.25)',
          letterSpacing: 'var(--tracking-tight, -0.02em)',
          color: 'var(--color-primary, #FFFFFF)',
          marginBottom: description ? 'var(--space-3, 0.75rem)' : 0
        }}
      >
        {title}
      </h2>

      {description && (
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--font-size-base, 1rem)',
            color: 'var(--color-secondary, #A1A1AA)',
            lineHeight: 'var(--line-height-relaxed, 1.65)',
            maxWidth: '680px',
            marginLeft: align === 'center' ? 'auto' : 0,
            marginRight: align === 'center' ? 'auto' : 0
          }}
        >
          {description}
        </p>
      )}
    </div>
  );
}
