import { skipGames } from './public/constants.js';

async function processGames(games) {
    // Filter out skipped games
    const filteredGames = games.filter(game => !skipGames.includes(game.appid));
    
    // Sort by appId
    filteredGames.sort((a, b) => a.title - b.title);

    // Generate the output string
    const output = filteredGames
        .map(game => `${game.appid}: '${game.name.replace(/'/g, "\\'")}',`)
        .join('\n');

    return `const steamTitles = [\n  ${output}\n];\n\nmodule.exports = { steamTitles };`;
}

// Example usage:
// const games = await getOwnedGames(steamid);
// const processedOutput = await processGames(games);
// console.log(processedOutput);

export { processGames };
