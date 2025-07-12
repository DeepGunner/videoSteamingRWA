import React, { createContext, useState, useEffect, useMemo } from 'react';

const themes = {
  netflix: {
    name: 'Netflix',
  },
  light: {
    name: 'Light',
  },
  aurora: {
    name: 'Aurora',
  },
  'neo-brutalism': {
    name: 'Neo-Brutalism',
  },
  'pastel-dream': {
    name: 'Pastel Dream',
  },
  'render-dark': {
    name: 'Render Dark',
  },
  'dark-brutalism': {
    name: 'Dark Brutalism',
  }
};

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Initialize state from localStorage or fall back to a default.
  // This function is only run once on initial render.
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    // Ensure the saved theme is a valid key in our themes object.
    return savedTheme && themes[savedTheme] ? savedTheme : 'dark-brutalism';
  });

  // Effect to update the body attribute and save to localStorage whenever the theme changes.
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const value = useMemo(() => ({
    theme,
    setTheme,
    themes
  }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};