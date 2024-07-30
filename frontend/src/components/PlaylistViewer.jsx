import { useState, useEffect } from 'react';
import axios from 'axios';

const PlaylistViewer = ({ playlistId }) => {
  const [tracks, setTracks] = useState([]);

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8888/playlist/${playlistId}`
        );
        setTracks(response.data.tracks);
        console.log(tracks);
      } catch (error) {
        console.error('Error fetching tracks:', error);
      }
    };
    fetchTracks();
  }, [playlistId]);
  return (
    <div>
      <h2>Playlist Tracks</h2>
      <ul>
        {tracks.map((track) => (
          <li key={track.id}>
            {track.name} - {tracks.artists[0].name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlaylistViewer;
