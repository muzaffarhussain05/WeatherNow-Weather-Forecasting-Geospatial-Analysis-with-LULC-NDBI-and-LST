
import { useEffect, useState } from 'react';

const THEME_KEY = 'weathernow-theme';

function getInitialTheme() {
  try {
    const savedTheme = localStorage.getItem(THEME_KEY);

    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  } catch {
    return 'light';
  }
}

export default function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle(
      'dark',
      theme === 'dark',
    );

    document.documentElement.style.colorScheme = theme;

    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // The theme still works if storage is unavailable.
    }
  }, [theme]);

  function toggleTheme() {
    setTheme((current) =>
      current === 'dark' ? 'light' : 'dark',
    );
  }

  return {
    theme,
    toggleTheme,
  };
}
