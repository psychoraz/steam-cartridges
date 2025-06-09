export const skipGames = [
    /*
    array of steam's <appId> for games you want to skip
    exmaple:
    404790, // GODOT engine
    */
];
  
export const remapGames = {
    /*
    array of steam's <appId: appId> that maps one game into another, in case you want to use a different appId for a game or if the first one is not in the store anymore
    example:
    31410: 220820, // Zombie driver
    */
};
  
export const rewriteTitles = {
    /*
    array of steam's <appId: title>, rewrites the title to something else
    example:
    31170: 'Tales of Monkey Island 1 - Launch of the Screaming Narwhal',
    */
};

export const printedGames = [
    /*
    array of steam's <appId>, similar to skipGames, here you can paste an array of appIds that are already printed, so the don't populate the results page
    example:
    752590, // A Plague Tale: Innocence
    */
]