const express = require('express');
const spotifyWebApi = require('spotify-web-api-node');
require('dotenv').config();
const path = require('path');
const bodyParser = require('body-parser');
const cookies = require('cookie-parser');

const app = express();
app.use(bodyParser.json());
app.use(cookies());

const spotifyApi = new spotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI,
});

app.get('/login', async (req, res) => {
  const scopes = [
    'playlist-modify-public',
    'playlist-modify-private',
    'playlist-read-private',
    'playlist-read-collaborative',
  ];
  res.redirect(spotifyApi.createAuthorizeURL(scopes));
});

app.get('/search', async (req, res) => {
  const searchTerm = req.query.searchTerm;
  spotifyApi
    .searchTracks(`track:${searchTerm}`)
    .then((data) => {
      res.json(data.body.tracks.items);
    })
    .catch((err) => {
      console.error('Error occurred: ', err);
      res.status(500).send('Failed to search tracks.' + err);
    });
});

app.get('/callback', async (req, res) => {
  const code = req.query.code;
  const error = req.query.error;
  if (error) {
    res.send(`Error: ${error}`);
    return;
  }

  spotifyApi
    .authorizationCodeGrant(code)
    .then((data) => {
      const access_token = data.body['access_token'];
      const refresh_token = data.body['refresh_token'];
      const expires_in = data.body['expires_in'];

      console.log('Token expires in' + data.body['expires_in'] + 'seconds');
      console.log('The access token is' + data.body['access_token']);

      spotifyApi.setAccessToken(access_token);
      spotifyApi.setRefreshToken(refresh_token);

      res.cookie('access_token', access_token, { httpOnly: true });
      res.cookie('refresh_token', refresh_token, { httpOnly: true });

      res.redirect('/dashboard');
    })
    .catch((err) => {
      console.error('Error occurred: ', err);
      res.status(500).send('Failed to log in.' + err);
    });
});

app.post('/create-playlist', async (req, res) => {
  const { name, description } = req.body;
  spotifyApi
    .createPlaylist(name, { description: description })
    .then((data) => {
      console.log('Created playlist:', data.body.id);
      res.json({ playlistId: data.body.id });
    })
    .catch((err) => {
      console.error('Error occurred: ', err);
      res.status(500).send('Failed to create playlist.' + err);
    });
});

app.post('/add-track', async (req, res) => {
  const { playlistId, trackId } = req.body;
  spotifyApi
    .addTracksToPlaylist(playlistId, [trackId])
    .then((data) => {
      console.log('Added track to playlist:', data.body);
      res.json({ success: true });
    })
    .catch((err) => {
      console.error('Error occurred: ', err);
      res.status(500).send('Failed to add track to playlist.' + err);
    });
});

app.delete('/remove-track', (req, res) => {
  const { playlistId, trackId } = req.body;
  spotifyApi
    .removeTrackFromPlaylist(playlistId, [{ uri: trackId }])
    .then((data) => {
      console.log('Removed track from playlist:', data.body);
      res.json({ success: true });
    })
    .catch((err) => {
      console.error('Error occurred: ', err);
      res.status(500).send('Failed to remove track from playlist.' + err);
    });
});

app.get('/me', (req, res) => {
  spotifyApi
    .getMe()
    .then((data) => {
      res.json(data.body);
    })
    .catch((err) => {
      console.error('Error occurred: ', err);
      res.status(500).send('Failed to get user information.' + err);
    });
});

const generateDashboardHtml = (user) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
      <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Collaborative Playlist Maker</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
            h1, h2 { color: #1DB954; }
            input, button { margin: 10px 0; padding: 5px; }
            button { background-color: #1DB954; color: white; border: none; cursor: pointer; }
            button:hover { background-color: #1ed760; }
            #playlistList { list-style-type: none; padding: 0; }
            #playlistList li { margin-bottom: 10px; }
            .error { color: red; }
        </style>
      </head>
      <body>
        <h1>Welcome to Your Dashboard,  ${user.display_name}!</h1>
        <div id="playlistCreator">
            <h2>Create a New Playlist</h2>
            <input type="text" id="playlistName" placeholder="Playlist Name">
            <button onclick="createPlaylist()">Create Playlist</button>
        </div>
        <div id="playlistManager">
            <h2>Manage Playlists</h2>
            <select id="playlistSelect">
                <option value="">Select a playlist</option>
            </select>
            <div id="songAdder">
                <input type="text" id="songName" placeholder="Song Name">
                <button onclick="addSong()">Add Song</button>
            </div>
            <div id="collaboratorAdder">
                <input type="text" id="collaboratorEmail" placeholder="Collaborator's Email">
                <button onclick="addCollaborator()">Add Collaborator</button>
            </div>
        </div>
        <div id="playlistViewer">
            <h2>Your Playlists</h2>
            <ul id="playlistList"></ul>
        </div>
        <script>
        window.onload = loadPlaylists;

        function loadPlaylists() {
                fetch('/get-playlists')
                    .then(response => response.json())
                    .then(playlists => {
                       
                        const playlistList = document.getElementById('playlistList');
                        const playlistSelect = document.getElementById('playlistSelect');
                        playlistList.innerHTML = '';
                        playlistSelect.innerHTML = '<option value="">Select a playlist</option>';
                         
                        playlists.forEach(playlist => {
                            console.log('Playlists::::::::::::', playlist.name);
                            playlistList.innerHTML += \`<li>${playlist.name}</li>\`;
                            
                        });
                    })
                    .catch(error => console.error('Error:', error));
            }


            function createPlaylist() {
                const name = document.getElementById('playlistName').value;
                fetch('/create-playlist', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name }),
                })
                .then(response => response.json())
                .then(data => {
                    alert('Playlist created: ' + data.playlistId);
                    loadPlaylists();
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
            }

            function addSong() {
                const playlistId = document.getElementById('playlistSelect').value;
                const songName = document.getElementById('songName').value;
                fetch('/add-song', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ playlistId, songName }),
                })
                .then(response => response.json())
                .then(data => {
                    alert('Song added: ' + data.trackName);
                })
                .catch(error => console.error('Error:', error));
            }

            function addCollaborator() {
                const playlistId = document.getElementById('playlistSelect').value;
                const email = document.getElementById('collaboratorEmail').value;
                fetch('/add-collaborator', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ playlistId, email }),
                })
                .then(response => response.json())
                .then(data => {
                    alert('Collaborator added: ' + data.email);
                })
                .catch(error => console.error('Error:', error));
            }
        </script>
    </body>
    </html>
  `;
};

app.get('/dashboard', (req, res) => {
  if (!req.cookies.access_token) {
    res.redirect('/login');
    return;
  }

  spotifyApi.setAccessToken(req.cookies.access_token);
  spotifyApi
    .getMe()
    .then((data) => {
      res.send(generateDashboardHtml(data.body));
    })
    .catch((err) => {
      console.error('Error occurred: ', err);
      res.status(500).send('Failed to get user information.' + err);
    });
});

app.get('/get-playlists', (req, res) => {
  if (!req.cookies.access_token) {
    res.status(401).send('Unauthorized');
    return;
  }
  spotifyApi.setAccessToken(req.cookies.access_token);

  spotifyApi
    .getUserPlaylists()
    .then((data) => {
      res.json(data.body.items);
    })
    .catch((err) => {
      console.error('Error occurred: ', err);
      res.status(500).send('Failed to get user playlists.' + err);
    });
});

app.post('/add-song', (req, res) => {
  const { playlistId, songName } = req.body;
  spotifyApi
    .searchTracks(songName)
    .then((data) => {
      if (data.body.tracks.items.length > 0) {
        const trackId = data.body.tracks.items[0].id;
        const trackUri = data.body.tracks.items[0].uri;
        return spotifyApi.addTracksToPlaylist(playlistId, [trackUri]);
      } else {
        throw new Error('Track not found');
      }
    })
    .then(() => {
      res.json({ trackName: songName });
    })
    .catch((err) => {
      console.error('Error occurred: ', err);
      res.status(500).send('Failed to add song to playlist.' + err);
    });
});

app.post('/add-collaborator', (req, res) => {
  const { playlistId, email } = req.body;
  spotifyApi
    .getUser(email)
    .then((data) => {
      if (data.body.id) {
        return spotifyApi.addUserToPlaylist(playlistId, data.body.id);
      } else {
        throw new Error('User not found');
      }
    })
    .then(() => {
      res.json({ email });
    })
    .catch((err) => {
      console.error('Error occurred: ', err);
      res.status(500).send('Failed to add collaborator to playlist.' + err);
    });
});

app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'dist', 'index.html'));
});
app.listen(8888, () => {
  console.log('Server running on port 8888');
});
