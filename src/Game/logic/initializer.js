import { cards } from "./cards";

export const initializeGame = (numPlayers) => {
  const deck = [];
  const players = [];
  // ensure >= 2 cards will always be left over regardless of player count
  let numDuplicates = numPlayers <= 6 ? 3 : 4;

  // create (unshuffled) deck
  cards.forEach((card) => {
    for (let i = 0; i < numDuplicates; i++) {
      deck.push(card);
    }
  });

  shuffleDeck(deck);

  // give each player their starting cards and coins
  for (let i = 0; i < numPlayers; i++) {
    players.push({
      name: "Player " + i,
      isOut: false,
      hand: [
        { ...deck.pop(), discarded: false, id: 0 },
        { ...deck.pop(), discarded: false, id: 1 },
      ],
      coins: 7,
      id: `${i}`,
    });
  }

  return { deck, players };
};

export const shuffleDeck = (deck) => {
  // shuffle deck (using Fisher-Yates algorithm)
  for (let i = deck.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
};
