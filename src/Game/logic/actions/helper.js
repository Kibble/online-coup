import { shuffleDeck } from "../initializer";

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
  shuffleDeck(G.deck);
};

export { logTurn, resetResponses, updateIsOut, getNumAlivePlayers, checkForWinner, returnToDeck };
