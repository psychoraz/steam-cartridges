import { printedGames, remapGames, rewriteTitles, skipGames } from './constants.js';

async function getGameInfo(appid, title) {
  appid = remapGames[appid] || appid;
  title = title.replace('/', '-').replace('%', '-');

  // Check if the game info is already in localStorage
  const cachedData = localStorage.getItem(`gameInfo_${appid}`);
  if (cachedData) {
    return JSON.parse(cachedData); // Return the cached data
  }

  // If not cached, fetch from the server
  const res = await fetch(`/game-info/${appid}/${title}`);
  const data = await res.json();

  // If the response is successful and contains a short description, cache it
  if (data.description) {
    localStorage.setItem(`gameInfo_${appid}`, JSON.stringify(data));
  }

  return data;
}

let allGames = [];
let profileName = false
let profileData = false;

let debounceTimeout;

export async function checkProfile() {
  const input = document.getElementById('steamInput').value.trim();
  const results = document.getElementById('results');
  results.innerHTML = '<img src="./cat1.gif"/>';
  enableControls(false);
  try {
    if(profileName !== input || !profileData){
      const res = await fetch('/check-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      });
      if (!res.ok) {
        results.innerHTML = `<div><p style='margin:auto; width: fit-content'>Error: ${res.error}</p><img src='./cat-error.gif'/></div>`;
        return;
      }

      profileName = input;
      profileData = await res.json();;
    }

    allGames = profileData.games?.filter((game) => !skipGames.includes(game.appid) && !printedGames.includes(game.appid))
      .sort((a, b) => {
        const aName = rewriteTitles[a.appid] || a.name;
        const bName = rewriteTitles[b.appid] || b.name;
        return aName.localeCompare(bName);
      });



    results.innerHTML = '';
    renderGames(allGames);
  } catch (err) {
    console.error(err);
    results.innerHTML = `<pre>server error</pre>`;
  }
}

export async function filterGames() {
  const filterId = 'filterInput'; 
  const filterInput = document.getElementById(filterId).value.trim().toLowerCase();
  
  // Clear the previous timeout
  clearTimeout(debounceTimeout);
  
  // Set a new timeout to delay the filtering
  debounceTimeout = setTimeout(async () => {
    const searchTerms = filterInput.split(',').map(term => term.trim());
    const filteredGames = allGames.filter(game => {
      const gameName = (rewriteTitles[game.appid] || game.name).toLowerCase();
      const appId = game.appid.toString();
      return searchTerms.some(term => 
        gameName.includes(term) || appId.includes(term)
      );
    });
    await renderGames(filteredGames);
    document.getElementById(filterId).focus();
  }, 1000);
}

export function copyAllAppIds() {
  const appIdsWithNames = allGames.map(game => {
    const gameName = rewriteTitles[game.appid] || game.name;
    return `${game.appid}, // ${gameName}`;
  }).join('\n');

  navigator.clipboard.writeText(appIdsWithNames).then(() => {
    alert('All appIds and game names copied to clipboard!');
  }).catch(err => {
    console.error('Failed to copy appIds:', err);
    alert('Failed to copy appIds to clipboard');
  });
}

async function renderGames(games) {
  const results = document.getElementById('results');
  results.innerHTML = '';

  enableControls(false);

  for (const game of games) {
    const loadingCover = document.createElement('div');
    loadingCover.id = 'loadingcover'
    loadingCover.innerHTML = '<img src="./cat2.gif"/>'
    results.appendChild(loadingCover);

    const gameInfo = await getGameInfo(game.appid, game.name);
    const imgUrl = await getCoverImage(game.appid, game.name);

    const cover = document.createElement('div');
    cover.className = 'mini-disc';
    const cleanName = rewriteTitles[game.appid] || game.name;

    cover.innerHTML = `
      <div class="front">
        <a href="https://store.steampowered.com/app/${game.appid}" target="_blank">
          <div class="cover-container">
            <img class="cover" src="${imgUrl}"/>
          </div>
        </a>
      </div>
      <div class="side">
        <img src="./steam.png" alt="Steam">
        <div class="text">${cleanName}</div>
      </div>
      <div class="back">
        <div class="title">${cleanName}</div>
        <div class="description">${gameInfo.description}</div>
        <div class="extra">
          <span>${!!gameInfo.developer ? gameInfo.developer : ''}</span><br/>
          <span>${!!gameInfo.release_date ? gameInfo.release_date.split(' ').slice(1).join(' ') : ''}</span>
        </div>
      </div>`;

    results.removeChild(document.getElementById('loadingcover'));
    results.appendChild(cover);
  }

  if (games.length % 2 === 1) {
    const cover = document.createElement('div');
    cover.className = 'mini-disc';
    results.appendChild(cover);
  }

  enableControls(true);
}

async function getCoverImage(appid, title) {
  title = title.replace('/', '-').replace('%', '-');
  try {
    const cachedData = localStorage.getItem(`gameCover_${appid}`);
    if (cachedData) {
      return JSON.parse(cachedData); // Return the cached data
    }

    const res = await fetch(`/cover-image/${appid}/${title}`);
    const data = await res.json();
    if (res.ok) {
      if (data.coverUrl) {
        localStorage.setItem(
          `gameCover_${appid}`,
          JSON.stringify(data.coverUrl)
        );
      }
      return data.coverUrl; // Return the cover URL from the server
    }
  } catch (err) {
    console.error(`Failed to fetch cover image for appid ${appid}:`, err);
  }

  // Fallback to a placeholder image if the server request fails
  return '';
}

function enableControls(enabled) {
  const controls = document.querySelectorAll(
    '.controls input, .controls button'
  );
  controls.forEach((control) => {
    control.disabled = !enabled;
  });
}

// enableControls(false);
