import React from 'react';
import { Link } from 'react-router-dom';
import ThemeSwitcher from './ThemeSwitcher';
import './Header.css';

const Header = () => {
  return (
    <header className="app-header">
      <Link to="/" className="header-logo-link">
        <div className="logo">
          <span className="logo-char" style={{'--i': 1}}>N</span>
          <span className="logo-char" style={{'--i': 2}}>F</span>
          <span className="logo-char" style={{'--i': 3}}>S</span>
        </div>
        <h1 className="header-title">Netflix for Shruti</h1>
      </Link>
      <ThemeSwitcher />
    </header>
  );
};

export default Header;