import React, { useState } from 'react';
import { API_URL } from '../config';
import './RequestModal.css';

const RequestModal = ({ isOpen, onClose }) => {
  const [movieTitle, setMovieTitle] = useState('');
  const [status, setStatus] = useState({ loading: false, error: null, success: null });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!movieTitle) return;

    setStatus({ loading: true, error: null, success: null });

    try {
      const res = await fetch(`${API_URL}/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movieTitle }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'An unknown error occurred.');
      }

      setStatus({ loading: false, error: null, success: data.message });
      setMovieTitle('');
    } catch (err) {
      setStatus({ loading: false, error: err.message, success: null });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>&times;</button>
        <h2>What do you want to watch?</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={movieTitle}
            onChange={(e) => setMovieTitle(e.target.value)}
            placeholder="Movie or TV show title..."
            disabled={status.loading}
          />
          <button type="submit" disabled={status.loading}>
            {status.loading ? 'Sending...' : 'Request'}
          </button>
        </form>
        {status.success && <p className="status-message success">{status.success}</p>}
        {status.error && <p className="status-message error">{status.error}</p>}
      </div>
    </div>
  );
};

export default RequestModal;