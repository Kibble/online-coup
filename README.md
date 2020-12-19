# Online Coup

**Link to play:** https://online-coup.herokuapp.com/

## About

This version of Coup can be played online with 2-8 players and features a lobby, player chat, turn log, and action statistics. <br>

**Link to the official rules:** https://www.ultraboardgames.com/coup/game-rules.php <br>

### Rule Modifications & Game Clarification

- With 7 or 8 players, the deck will have 20 total cards (4 of each character). <br>
- If you do not go first or last, a dashed line will clarify your turn order. Turns pass in a clockwise fashion, and the first player is decided randomly.
- A coup involves a character guess and will be unsuccessful if the guess is incorrect (i.e. the targeted player does not possess that character).
- Stealing from a player with 0 coins produces no net gain or loss of coins from either side if successful.

***Refer to the in-game rules panel for additional clarification.***

### Notes
- Online Coup is currently in beta testing. It may take time to load some images, and bugs may occur while playing.
- When using a mobile device (not recommended), play in landscape mode for the best experience.
- ***Please use the LEAVE button to exit a room or a game.***

## Credits
- Online Coup was developed using [React](https://reactjs.org/) and [boardgame.io](https://boardgame.io/).
- Icons come from [Font Awesome](https://fontawesome.com/). 
- Images come from the original Coup board game by Indie Boards & Cards (released 2012). Designer, artist, and publisher credits can be found [here](https://boardgamegeek.com/boardgame/131357/coup).

<br>

## Development

1. Fork the repository.
2. Run `npm install` to install the packages.
3. Run `npm start` to run the client.
4. In a separate terminal, run `npm run serve` to run the server.
