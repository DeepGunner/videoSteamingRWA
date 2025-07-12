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
        <h2 className="page-title">Server Down 😰, will be back shortly 😶‍🌫️</h2>
        {error && <p className="error-message">Error: {error}</p>}
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
            ) : (<p>No videos found. Add videos to the 'server/videos' directory.</p>))
          )}
        </div>
      </main>
    </div>
  );
}

export default LandingPage;