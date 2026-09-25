import React, { useState, useEffect, useCallback } from 'react';
import { NavigationContext } from './navigation-context';

export function NavigationProvider({ children }) {
  const [currentPath, setCurrentPath] = useState(() => {
    return window.location.pathname || '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((targetPath) => {
    if (!targetPath) return;

    // Handle hash links (e.g. "#projects")
    if (targetPath.startsWith('#')) {
      if (window.location.pathname !== '/') {
        window.history.pushState({}, '', '/' + targetPath);
        setCurrentPath('/');
        setTimeout(() => {
          const el = document.querySelector(targetPath);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 80);
      } else {
        window.history.pushState({}, '', targetPath);
        const el = document.querySelector(targetPath);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    // Normal path navigation
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
      setCurrentPath(targetPath);
      window.scrollTo(0, 0);
    }
  }, []);

  return (
    <NavigationContext.Provider value={{ currentPath, navigate }}>
      {children}
    </NavigationContext.Provider>
  );
}
