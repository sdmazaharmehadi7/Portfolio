import React, { useRef, useEffect, useState } from 'react';

export default function Sayyad3DLogo() {
  const logoRef = useRef(null);
  const rafRef = useRef(null);

  // Target and current interpolated values for smooth physics
  const targetValues = useRef({
    dirX: 0.707,
    dirY: -0.707,
    tiltX: 3.5,
    tiltY: -4.5,
    glowIntensity: 0.8
  });

  const currentValues = useRef({
    dirX: 0.707,
    dirY: -0.707,
    tiltX: 3.5,
    tiltY: -4.5,
    glowIntensity: 0.8
  });

  const [isInteractive, setIsInteractive] = useState(false);

  useEffect(() => {
    // Check reduced motion preference or touch devices
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (motionQuery.matches || isTouch) {
      return;
    }

    setIsInteractive(true);

    const handleMouseMove = (e) => {
      if (!logoRef.current) return;
      const rect = logoRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const distance = Math.hypot(dx, dy);

      if (distance < 1) return;

      const angle = Math.atan2(dy, dx);
      const dirX = Math.cos(angle);
      const dirY = Math.sin(angle);

      // Subtle physical tilt towards cursor direction
      const tiltStrength = Math.min(distance / 50, 6.5);
      const tiltX = -dirY * tiltStrength;
      const tiltY = dirX * tiltStrength;

      targetValues.current = {
        dirX,
        dirY,
        tiltX,
        tiltY,
        glowIntensity: Math.min(1, Math.max(0.65, 1 - distance / 1400))
      };
    };

    const handleMouseLeave = () => {
      targetValues.current = {
        dirX: 0.707,
        dirY: -0.707,
        tiltX: 3,
        tiltY: -4,
        glowIntensity: 0.75
      };
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);

    // Smooth lerp loop
    const LERP = 0.08;
    const animate = () => {
      const cur = currentValues.current;
      const tar = targetValues.current;

      cur.dirX += (tar.dirX - cur.dirX) * LERP;
      cur.dirY += (tar.dirY - cur.dirY) * LERP;
      cur.tiltX += (tar.tiltX - cur.tiltX) * LERP;
      cur.tiltY += (tar.tiltY - cur.tiltY) * LERP;
      cur.glowIntensity += (tar.glowIntensity - cur.glowIntensity) * LERP;

      if (logoRef.current) {
        const { dirX, dirY, tiltX, tiltY, glowIntensity } = cur;

        const textShadow = [
          // Sharp white edge rim light facing cursor
          `${(dirX * 2).toFixed(2)}px ${(dirY * 2).toFixed(2)}px 0px rgba(255, 255, 255, ${(0.9 * glowIntensity).toFixed(2)})`,
          // Soft white bloom in cursor direction
          `${(dirX * 4.5).toFixed(2)}px ${(dirY * 4.5).toFixed(2)}px 10px rgba(255, 255, 255, ${(0.48 * glowIntensity).toFixed(2)})`,
          `${(dirX * 9).toFixed(2)}px ${(dirY * 9).toFixed(2)}px 22px rgba(255, 255, 255, ${(0.26 * glowIntensity).toFixed(2)})`,
          `${(dirX * 18).toFixed(2)}px ${(dirY * 18).toFixed(2)}px 44px rgba(255, 255, 255, ${(0.14 * glowIntensity).toFixed(2)})`,
          // Subtle omnidirectional soft ambient glow
          `0px 0px 30px rgba(255, 255, 255, ${(0.08 * glowIntensity).toFixed(2)})`,
          // Dark extruded 3D layers on the shadow side
          `${(-dirX * 1.5).toFixed(2)}px ${(-dirY * 1.5).toFixed(2)}px 0px #242428`,
          `${(-dirX * 3).toFixed(2)}px ${(-dirY * 3).toFixed(2)}px 0px #1c1c1f`,
          `${(-dirX * 4.5).toFixed(2)}px ${(-dirY * 4.5).toFixed(2)}px 0px #141417`,
          `${(-dirX * 6).toFixed(2)}px ${(-dirY * 6).toFixed(2)}px 0px #0e0e10`,
          `${(-dirX * 7.5).toFixed(2)}px ${(-dirY * 7.5).toFixed(2)}px 0px #08080a`,
          // Cast deep shadow opposite the light source
          `${(-dirX * 12).toFixed(2)}px ${(-dirY * 12).toFixed(2)}px 26px rgba(0, 0, 0, 0.95)`
        ].join(', ');

        logoRef.current.style.textShadow = textShadow;
        logoRef.current.style.transform = `perspective(700px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg)`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      className="sayyad-3d-wrapper"
      aria-hidden="true"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        pointerEvents: 'none',
        padding: '1.25rem 0.5rem'
      }}
    >
      <span
        ref={logoRef}
        className="sayyad-3d-letters"
        style={{
          display: 'inline-block',
          fontFamily: 'var(--font-sans)',
          fontWeight: 900,
          fontSize: 'clamp(3.5rem, 6.2vw, 5.25rem)',
          lineHeight: 1,
          letterSpacing: '0.1em',
          color: '#08080a',
          textTransform: 'uppercase',
          transformStyle: 'preserve-3d',
          transform: 'perspective(700px) rotateX(3.5deg) rotateY(-4.5deg)',
          textShadow: `
            1.5px -1.5px 0px rgba(255, 255, 255, 0.85),
            3.5px -3.5px 10px rgba(255, 255, 255, 0.45),
            7px -7px 22px rgba(255, 255, 255, 0.22),
            0 0 30px rgba(255, 255, 255, 0.08),
            -1.5px 1.5px 0px #242428,
            -3px 3px 0px #1c1c1f,
            -4.5px 4.5px 0px #141417,
            -6px 6px 0px #0e0e10,
            -7.5px 7.5px 0px #08080a,
            -12px 12px 26px rgba(0, 0, 0, 0.95)
          `,
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale'
        }}
      >
        SAYYAD
      </span>
    </div>
  );
}
