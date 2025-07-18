import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';
import { useVideos } from '../hooks/useVideos.js';
import SkeletonCard from '../components/SkeletonCard';
import Header from '../components/Header';

function LandingPage() {
  const { videos, loading, error } = useVideos();

  return (
    <div className="landing-page">
      <Header />
      <main className="video-gallery">
        {error ? (
          <div className="error-container">
            <h2 className="page-title">Server Down 😰!</h2>
            <p className="error-message">Could not connect to the server. It might be offline or busy. Please try again later.</p>
          </div>
        ) : (
          <h2 className="page-title">Available Videos</h2>
        )}
        <div className="video-grid">
          {loading ? (
            // Render 8 skeleton cards while loading
            [...Array(8)].map((_, index) => <SkeletonCard key={index} />)
          ) : (
            !error && (
              videos.length > 0 ? (
              videos.map(video => (
                <div key={video.filename} className="video-card-container">
                  <Link to={`/video/${encodeURIComponent(video.filename)}`} className="video-card">
                    <img
                      src={video.thumbnailUrl}
                      alt={`Thumbnail for ${video.filename}`}
                      className="video-card-thumbnail"
                    />
                    <div className="video-card-info">
                      <div className="video-card-title">{video.title}</div>
                      <p className="video-card-description">
                        {video.description}
                      </p>
                    </div>
                  </Link>
                </div>
              ))
            ) : (<p>No videos found. Add videos to the 'MyVideos' directory on your Desktop.</p>))
          )}
        </div>
      </main>
    </div>
  );
}

export default LandingPage;