import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import './ThemeSwitcher.css';

const ThemeSwitcher = () => {
  const { theme, setTheme, themes } = useContext(ThemeContext);

  const handleThemeChange = (e) => {
    setTheme(e.target.value);
  };

  return (
    <div className="theme-switcher">
      <label htmlFor="theme-select">Theme:</label>
      <select id="theme-select" value={theme} onChange={handleThemeChange}>
        {Object.keys(themes).map((key) => (
          <option key={key} value={key}>
            {themes[key].name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ThemeSwitcher;