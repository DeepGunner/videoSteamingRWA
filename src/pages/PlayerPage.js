import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useVideos } from '../hooks/useVideos.js';
import { API_URL } from '../config';
import Header from '../components/Header';

function PlayerPage() {
  const { filename } = useParams();
  const { videos, loading, error } = useVideos();
  const [currentVideo, setCurrentVideo] = useState(null);

  // This effect updates the current video when the URL changes or when the video list first loads.
  useEffect(() => {
    if (videos.length > 0) {
      const videoFromUrl = videos.find(v => v.filename === decodeURIComponent(filename));
      if (videoFromUrl) {
        setCurrentVideo(videoFromUrl);
      }
    }
  }, [filename, videos]);

  return (
    <>
      <Header />
      <main className="main-content">
        <section className="video-player-section">
          <div className="video-player-container">
            {currentVideo ? (
              <video key={currentVideo.filename} controls autoPlay className="video-player">
                <source src={`${API_URL}/video/${currentVideo.filename}`} type={currentVideo.type} />
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="placeholder-text">
                {loading ? 'Loading...' : 'Select a video to play.'}
              </div>
            )}
          </div>
          {currentVideo && <h2 className="video-title">{currentVideo.filename}</h2>}
        </section>
        <aside className="video-list-section">
          <h3>Playlist</h3>
          <div className="video-list">
            {loading && <p>Loading videos...</p>}
            {error && <p className="error-message">Error: {error}</p>}
            {!loading && !error && (
              <ul>
                {videos.length > 0 ? (
                  videos.map(video => (
                    <li key={video.filename}>
                      <Link to={`/video/${encodeURIComponent(video.filename)}`} className={`video-list-item-link ${currentVideo && currentVideo.filename === video.filename ? 'active' : ''}`}>
                        <img
                          src={video.thumbnailUrl}
                          alt={`Thumbnail for ${video.filename}`}
                          className="video-list-thumbnail"
                        />
                        <span className="video-list-title">{video.filename}</span>
                      </Link>
                    </li>
                  ))
                ) : (<p>No videos found. Add videos to the 'server/videos' directory.</p>)}
              </ul>
            )}
          </div>
        </aside>
      </main>
    </>
  );
}

export default PlayerPage;