import { shuffle } from "../initializer";

// update turnLog in one line
const logTurn = (turnLog, action, player, successful, target, blockedBy, challenge, responses, exchange) => {
  turnLog.action = action;
  turnLog.player = player;
  turnLog.successful = successful;
  turnLog.target = target;
  turnLog.blockedBy = blockedBy;
  turnLog.challenge = challenge;
  turnLog.responses = responses;
  turnLog.exchange = exchange;
};

// update statistics
const logStats = (turnLog, statistics) => {
  // find index
  let i = 0;
  while (i < statistics.length && statistics[i][0] !== turnLog.action) {
    i++;
  }
  let row = statistics[i];
  if (turnLog.successful) {
    row[1]++;
  } else {
    row[2]++;
  }
  if (turnLog.blockedBy && Object.keys(turnLog.blockedBy).length !== 0) {
    row[3]++;
  }
  if (
    turnLog.challenge &&
    Object.keys(turnLog.challenge).length !== 0 &&
    turnLog.player.id === turnLog.challenge.challenged.id
  ) {
    // only for direct challenges to the player's action, not to a character counteraction (e.g. block)
    row[4]++;
  }
};

// reset responses, which consist of actions and counteractions, where index represents playerID
const resetResponses = (numPlayers) => {
  const responses = [];
  for (let i = 0; i < numPlayers; i++) {
    responses[i] = "";
  }
  return responses;
};

const updateIsOut = (player) => {
  if (player.hand.filter((card) => !card.discarded).length === 0) {
    // if both cards are discarded, then player is out
    player.isOut = true;
  }
};

const getNumAlivePlayers = (G) => {
  return G.players.filter((player) => !player.isOut).length;
};

const checkForWinner = (G) => {
  const playersAlive = G.players.filter((player) => !player.isOut);
  if (playersAlive.length === 1) {
    // game is over when only 1 player is alive at the end of each turn
    G.winner.name = playersAlive[0].name;
    G.winner.id = playersAlive[0].id;
  }
};

// returns cards to the deck (e.g. exchange or losing a card)
const returnToDeck = (G, cards) => {
  cards.forEach((card) => {
    G.deck.push(card);
  });
  shuffle(G.deck);
};

export { logTurn, logStats, resetResponses, updateIsOut, getNumAlivePlayers, checkForWinner, returnToDeck };
