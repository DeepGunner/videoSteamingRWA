import React from 'react';
import { Link } from 'react-router-dom';
import ThemeSwitcher from './ThemeSwitcher';
import './Header.css';

const Header = () => {
  return (
    <header className="app-header">
      <Link to="/" className="header-logo-link">
        <div className="logo">
          <span className="logo-char" style={{'--i': 1}}>S</span>
          <span className="logo-char" style={{'--i': 2}}>V</span>
        </div>
        <h1 className="header-title">Shruti's Vault</h1>
      </Link>
      <ThemeSwitcher />
    </header>
  );
};

export default Header;