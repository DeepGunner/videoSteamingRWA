import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { ThemeProvider } from './context/ThemeContext';
import LandingPage from './pages/LandingPage';
import PlayerPage from './pages/PlayerPage';
import Footer from './components/Footer';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="App">
          <div className="app-body">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/video/:filename" element={<PlayerPage />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
