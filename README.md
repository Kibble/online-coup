# Online Coup

A clone of Coup built using React.js and boardgame.io featuring a lobby, turn log, and in-game chat. <br><br>
**Link to play:** https://online-coup.herokuapp.com/

## About

Coup is a popular strategy board game revolved around deception. <br>
This game can be played online with 2-8 players. <br>

**Link to the official rules:** https://www.ultraboardgames.com/coup/game-rules.php <br>

**_Note: Online Coup is currently in beta testing. It may take some time to load the page initially, and bugs may occur while playing._**<br>
**_Please use the LEAVE button to leave a game._**

### Rule Modifications/Clarification

- With 6 or less players, the deck will have 15 total cards (3 of each character). With 7 or 8 players, the deck will have 20 total cards (4 of each character). <br>
- The first player is decided randomly. Turns pass in a clockwise fashion. If you are not first or last, a dashed line will clarify your turn order.
- A coup involves an additional character selection and will be unsuccessful if the targeted player does not possess the targeted character.
- It is possible to steal from a player with zero coins, though stealing in this case will produce no net gain or loss of coins from either side if successful.

## Credits

All assets come from the original Coup board game by Indie Boards & Cards (released 2012). <br><br>
**Link to designer, artist, and publisher credits at BoardGameGeek**: https://boardgamegeek.com/boardgame/131357/coup

<br>

## Development

- Run `npm install` to install the packages.
- Run `npm start` to run the client.
- Run `npm run serve` to run the server.
