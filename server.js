// server.js
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

if(!process.env.STEAM_API_KEY){
  console.error('STEAM_API_KEY is not set');
}
if(!process.env.STEAMGRIDDB_API_KEY){
  console.error('STEAMGRIDDB_API_KEY is not set');
}

const imageMap = {
  /*
  array of steam's <appId: imageUrl> to manually set the cover image if you don't like the default one
  exmaple:
  220: 'https://cdn2.steamgriddb.com/grid/43306c70bcadc6e371bead1a4891f79d.jpg', // Half-Life 2
  */
}


// Resolve vanity URL (custom profile name) to SteamID
const resolveVanityUrl = async (input) => {
  if(!process.env.STEAM_API_KEY){
    return 'ERROR: STEAM_API_KEY is not set';
  }
  if(!process.env.STEAMGRIDDB_API_KEY){
    return 'ERROR: STEAMGRIDDB_API_KEY is not set';
  }
  const vanityURL = `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${process.env.STEAM_API_KEY}&vanityurl=${input}`;
  const res = await fetch(vanityURL);
  const data = await res.json();
  if (data.response.success === 1) return data.response.steamid;
  return null;
};

// Check if Steam profile is public
const isProfilePublic = async (steamid) => {
  if(!process.env.STEAM_API_KEY){
    return 'STEAM_API_KEY is not set';
  }
  if(!process.env.STEAMGRIDDB_API_KEY){
    return 'STEAMGRIDDB_API_KEY is not set';
  }
  const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${process.env.STEAM_API_KEY}&steamids=${steamid}`;
  const res = await fetch(url);
  const data = await res.json();
  const player = data.response.players[0];
  return player && player.communityvisibilitystate === 3;
};

// Get owned games
const getOwnedGames = async (steamid) => {
  if(!process.env.STEAM_API_KEY){
    return 'STEAM_API_KEY is not set';
  }
  if(!process.env.STEAMGRIDDB_API_KEY){
    return 'STEAMGRIDDB_API_KEY is not set';
  }
  const url = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${process.env.STEAM_API_KEY}&steamid=${steamid}&include_appinfo=true&include_played_free_games=false`;
  const res = await fetch(url);
  const data = await res.json();
  return data.response.games || [];
};

// Main route to handle profile input
app.post('/check-profile', async (req, res) => {
  try {
    const { input } = req.body;
    if (!input) return res.status(400).json({ error: 'No input provided' });

    let steamid = input;
    // If not a 17-digit number, treat it as a vanity URL
    if (!/^\d{17}$/.test(input)) {
      steamid = await resolveVanityUrl(input);
      if (!steamid)
        return res
          .status(404)
          .json({ error: 'Invalid Steam profile URL or ID' });
    }
    const isPublic = await isProfilePublic(steamid);
    if (!isPublic) return res.status(403).json({ error: 'Profile is not public' });

    const games = await getOwnedGames(steamid);
    res.json({ steamid, games });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/game-info/:appid/:title', async (req, res) => {
  const { appid, title } = req.params;

  try {
    const url = `https://store.steampowered.com/api/appdetails?appids=${appid}&l=${process.env.LANG || 'english'}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data[appid] && data[appid].success) {
      const info = data[appid].data;
      res.json({
        developer: info.developers?.[0] || 'Desarrollador no disponible',
        publisher: info.publishers?.[0] || 'Editor no disponible',
        release_date: info.release_date?.date || 'N/D',
        description: info.short_description || 'Sin descripción disponible.',
      });
    } else {
      console.warn(title, appid, data[appid]);
      res.status(404).json({ error: 'no data for [' + title + ']' });
    }
  } catch (err) {
    console.error('ERROR', err);
    res.status(500).json({ error: 'error obtaining [' + title + ']' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// Function to get the cover image
const getCoverImage = async (appid, title) => { 
  // Fallback to SteamGridDB
  try {
    const dimensions = '512x512,1024x1024'; // Specify desired dimensions
    const steamGridDbUrl = `https://www.steamgriddb.com/api/v2/grids/steam/${appid}?dimensions=${dimensions}&nsfw=any&humor=any`;
    const apiKey = process.env.STEAMGRIDDB_API_KEY; // Use the API key from .env
    const response = await fetch(steamGridDbUrl, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const data = await response.json();

    if (data.success && data.data.length > 0) {
      if(imageMap[appid]) {
        return imageMap[appid];
      }
      const image1024 = data.data.find((image) => image.width === 1024 && image.language === 'en');
      if (image1024) return image1024.url;

      const image512 = data.data.find((image) => image.width === 512 && image.language === 'en');
      if (image512) return image512.url;
    }
  } catch (err) {
    console.error(
      `Failed to fetch cover from SteamGridDB for appid ${appid}:`,
      err
    );
  }
};

// New endpoint to fetch the cover image
app.get('/cover-image/:appid/:title', async (req, res) => {
  const { appid, title } = req.params;
  try {
    const coverUrl = await getCoverImage(appid, title);
    res.json({ coverUrl });
  } catch (err) {
    console.error(
      `Error fetching cover image for appid ${title} ${appid}:`,
      err
    );
    res.status(500).json({ error: 'Failed to fetch cover image' });
  }
});
