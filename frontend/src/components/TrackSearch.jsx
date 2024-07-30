import { useState } from 'react';

const TrackSearch = ({ onTrackSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8888/search?q=${query}`
      );
      setResults(response.data.tracks);
    } catch (error) {
      console.error(error);
    }
  };
  const handleSelectTrack = (track) => {
    onTrackSelect(track);
    setQuery('');
    setResults([]);
  };
  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for a track"
      />
      <button onClick={handleSearch}>Search</button>
      <ul>
        {results.map((track) => (
          <li key={track.id} onClick={() => handleSelectTrack(track)}>
            {track.name} - {track.artists[0].name}
          </li>
        ))}
      </ul>
      {results.length === 0 && <p>No tracks found</p>}

      <button onClick={() => setQuery('')}>Clear Search</button>

      {onTrackSelect && (
        <div>
          Selected track: {onTrackSelect.name} - {onTrackSelect.artists[0].name}
        </div>
      )}
    </div>
  );
};

export default TrackSearch;
