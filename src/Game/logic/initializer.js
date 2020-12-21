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

  shuffle(deck);

  // give each player their starting cards and coins, initialize their own player state
  for (let i = 0; i < numPlayers; i++) {
    players.push({
      name: "",
      isOut: false,
      hand: [
        { ...deck.pop(), discarded: false, id: 0 },
        { ...deck.pop(), discarded: false, id: 1 },
      ],
      coins: 2,
      id: `${i}`,
    });
  }

  return { deck, players };
};

export const getPlayOrder = (numPlayers) => {
  const playOrder = Array(numPlayers)
    .fill()
    .map((_, i) => "" + i);
  shuffle(playOrder);
  return playOrder;
};

export const shuffle = (arr) => {
  // shuffle deck (using Fisher-Yates algorithm, might've been overkill since deck is only ~20 at most)
  for (let i = arr.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
};
