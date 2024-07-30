import axios from 'axios';
import { useState } from 'react';

const PlaylistCreator = () => {
  const [playlistName, setPlaylistName] = useState('');
  const [playlistDescription, setPlaylistDescription] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        'http://localhost:8888/create-playlist',
        {
          name: playlistName,
          description: playlistDescription,
        }
      );
      console.log('Playlist created:', response.data);
    } catch (error) {
      console.error('Error creating playlist:', error);
      alert('Failed to create playlist');
    }
  };
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>
          Playlist Name
          <input
            type="text"
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          Playlist Description
          <textarea
            value={playlistDescription}
            onChange={(e) => setPlaylistDescription(e.target.value)}
          ></textarea>
        </label>
        <br />
        <button type="submit">Create Playlist</button>
      </form>
    </div>
  );
};

export default PlaylistCreator;
