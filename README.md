# Online Coup

A clone of Coup built using React.js and boardgame.io featuring a lobby, turn log, and in-game chat. <br><br>
**Link to play:** https://online-coup.herokuapp.com/

## About

Coup is a popular strategy board game based around deception. Be the last one standing to win! <br>
This game can be played online with 2-8 players. <br>

**Link to the official rules:** https://www.ultraboardgames.com/coup/game-rules.php <br>

### Rule Modifications/Clarification

- With 6 or less players, the deck will have 15 total cards (3 of each character). With 7 or 8 players, the deck will have 20 total cards (4 of each character). <br>
- The first player is decided randomly. Turns pass in a clockwise fashion. If you are not first or last, a dashed line will clarify your turn order.
- A coup involves an additional character selection and will be unsuccessful if the targeted player does not possess the targeted character.
- It is possible to steal from a player with zero coins, though stealing in this case will produce no net gain or loss of coins from either side if successful.

### Notes
- Online Coup is currently in beta testing. It may take time to load some images, and bugs may occur while playing.
- When using a mobile device, play in landscape mode for the best experience.
- ***Please use the LEAVE button to exit a room or a game.***

## Credits

All assets come from the original Coup board game by Indie Boards & Cards (released 2012). <br><br>
**Link to designer, artist, and publisher credits at BoardGameGeek**: https://boardgamegeek.com/boardgame/131357/coup

<br>

## Development

- Run `npm install` to install the packages.
- Run `npm start` to run the client.
- Run `npm run serve` to run the server.
