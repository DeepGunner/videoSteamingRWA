import { useState, useEffect } from 'react';
import { API_URL } from '../config';

export function useVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true; // Prevent state update on unmounted component

    const fetchVideos = async () => {
      try {
        const res = await fetch(`${API_URL}/videos`);
        if (!res.ok) {
          throw new Error(`Network response was not ok: ${res.statusText}`);
        }
        const data = await res.json();
        if (isMounted) {
          setVideos(data);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Server down, will be back shortly:", err);
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchVideos();

    return () => { isMounted = false; };
  }, []);

  return { videos, loading, error };
}