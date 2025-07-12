import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ThemeSwitcher from './ThemeSwitcher';
import RequestModal from './RequestModal';
import './Header.css';

const Header = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <header className="app-header">
        <Link to="/" className="header-logo-link">
          <div className="logo">
            <span className="logo-char" style={{'--i': 1}}>S</span>
            <span className="logo-char" style={{'--i': 2}}>V</span>
          </div>
          <h1 className="header-title">Shruti's Vault</h1>
        </Link>
        <div className="header-actions">
          <button className="request-button" onClick={() => setIsModalOpen(true)}>I want more!</button>
          <ThemeSwitcher />
        </div>
      </header>
      <RequestModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default Header;