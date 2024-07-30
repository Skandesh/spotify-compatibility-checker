import { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  return (
    <div>
      {/* <PlaylistCreator onPlaylistCreate={setCurrentPlaylist} />
      {currentPlaylist && <PlaylistViewer playlistId={currentPlaylist} />}
      <TrackSearch
        onTrackSelect={(track) => {
          setCurrentPlaylist((prevPlaylist) => ({
            ...prevPlaylist,
            tracks: [...prevPlaylist.tracks, track],
          }));
        }}
      /> */}

      <Router>
        <Routes>
          <Route exact path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
