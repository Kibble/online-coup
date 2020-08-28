import { Card } from "./logic/cards";
import { initializeGame, shuffleDeck } from "./logic/initializer";
import { getTurnMsg } from "./logic/messageBuilder";
import { GAME_NAME } from "../config";

/* ---- Setup ---- */
const setup = ({ numPlayers }) => {
  const { deck, players } = initializeGame(numPlayers);

  return {
    deck: deck,
    players: players,
    winner: { name: "", id: "-1" },
    turnLog: {
      action: "",
      player: {},
      successful: false,
      target: {},
      blockedBy: {},
      challenge: {},
      responses: resetResponses(numPlayers),
      exchange: {},
    },
    chat: [],
  };
};

/* ---- Intermediary Actions ---- */

const message = (G, ctx, id, content) => {
  G.chat.push({ id, content });
};

const changeNames = (G, ctx, playerList) => {
  for (let i = 0; i < playerList.length; i++) {
    G.players[i].name = playerList[i].name;
  }
};

const setTarget = (G, ctx, target) => {
  G.turnLog.target = target;
  if (G.turnLog.action === "steal" || G.turnLog.action === "assassinate") {
    if (G.turnLog.action === "assassinate") {
      G.players[ctx.currentPlayer].coins -= 3;
    }
    ctx.events.setActivePlayers({
      all: "idle",
      value: {
        [target.id]: "blockOrChallenge",
      },
    });
  }
};

const setHand = (G, ctx, cardID) => {
  const { hand } = G.players[ctx.currentPlayer];
  const { newHand } = G.turnLog.exchange;
  if (!newHand.includes(cardID)) {
    let index = newHand.findIndex((card) => card === "");
    newHand[index] = cardID;
  }

  // done choosing
  if (!newHand.includes("")) {
    const oldHand = [];
    for (let i = 0; i < hand.length; i++) {
      const { character, front } = hand[i];
      oldHand.push({ character, front });
    }
    for (let i = 0; i < newHand.length; i++) {
      const newCardID = newHand[i];
      if (newCardID !== -1) {
        const newCard = newCardID < 2 ? oldHand[newCardID] : G.turnLog.exchange.drawnCards[newCardID - 2];
        hand[i].character = newCard.character;
        hand[i].front = newCard.front;
      }
    }
    let notUsed = [];
    // return cards that weren't used to deck
    for (let i = 0; i <= 1; i++) {
      if (!hand[i].discarded) {
        notUsed.push(i);
      }
    }
    notUsed.push(2);
    notUsed.push(3);
    let i = notUsed.length;
    while (i--) {
      if (newHand.includes(notUsed[i])) {
        notUsed.splice(i, 1);
      }
    }
    for (let i = 0; i < notUsed.length; i++) {
      notUsed[i] = notUsed[i] < 2 ? oldHand[notUsed[i]] : G.turnLog.exchange.drawnCards[notUsed[i] - 2];
    }
    returnToDeck(G, notUsed);
    ctx.events.endTurn();
  }
};

const prepAction = (G, ctx, action) => {
  G.turnLog.action = action;
  const { name, id } = G.players[ctx.currentPlayer];
  G.turnLog.player = { name, id };
  // blockable actions
  if (action === "foreign aid") {
    ctx.events.setActivePlayers({
      currentPlayer: "idle",
      others: "block",
    });
  }
  // (ONLY) challengable actions
  else if (action === "exchange" || action === "tax") {
    ctx.events.setActivePlayers({
      currentPlayer: "idle",
      others: "challenge",
    });
    // prep for successful exchange
    // top of deck is at the "end" of the deck
    G.turnLog.exchange.drawnCards = [
      { ...G.deck[G.deck.length - 1], id: 2 },
      { ...G.deck[G.deck.length - 2], id: 3 },
    ];
  }
};

const endTurn = (G, ctx) => {
  ctx.events.endTurn();
};

const loseCardAndShuffle = (G, ctx, playerID, cardID) => {
  returnToDeck(G, [Card(G.players[playerID].hand[cardID].character, G.players[playerID].hand[cardID].front)]);

  G.players[playerID].hand[cardID] = { character: "", front: "", discarded: true, id: cardID };
  updateIsOut(G.players[playerID]);

  if (
    G.turnLog.action === "assassinate" &&
    playerID === G.turnLog.target.id &&
    ctx.activePlayers[playerID] === "loseCard"
  ) {
    if (G.players[playerID].isOut) {
      ctx.events.endTurn();
    } else {
      ctx.events.setActivePlayers({
        all: "idle",
        value: {
          [playerID]: "loseAssassinate",
        },
      });
    }
  } else if (G.turnLog.action === "exchange" && Object.keys(G.turnLog.challenge) !== 0) {
    // redraw with the new deck
    G.turnLog.exchange.drawnCards = [
      { ...G.deck[G.deck.length - 1], id: 2 },
      { ...G.deck[G.deck.length - 2], id: 3 },
    ];
    executeAction(G, ctx);
    ctx.events.setActivePlayers({
      currentPlayer: "action",
      others: "idle",
    });
  } else if (G.turnLog.action === "coup" || ctx.activePlayers[playerID].includes("lose")) {
    ctx.events.endTurn();
  }
};

/* ---- General Actions ---- */
const income = (G, ctx) => {
  G.players[ctx.currentPlayer].coins++;

  const { name, id } = G.players[ctx.currentPlayer];
  logTurn(G.turnLog, "income", { name, id });
  ctx.events.endTurn();
};

const coup = (G, ctx, targetCharacter) => {
  G.turnLog.target.character = targetCharacter;
  G.players[ctx.currentPlayer].coins -= 7;
  let indexes = [];
  const hand = G.players[G.turnLog.target.id].hand;
  for (let i = 0; i < hand.length; i++) {
    const card = hand[i];
    if (!card.discarded && card.character === targetCharacter) {
      indexes.push(i);
    }
  }
  const hasCard = indexes.length > 0;
  G.turnLog.successful = hasCard;
  if (hasCard) {
    // if target player has duplicate cards that match the coup, randomly select one
    const index = indexes.length === 2 ? Math.round(Math.random()) : indexes[0];
    loseCardAndShuffle(G, ctx, G.turnLog.target.id, index);
  }
  ctx.events.endTurn();
};

/* ---- Character Counteractions ---- */

const allow = (G, ctx, playerID) => {
  const oneOnOneActions = ["assassinate", "steal"];
  G.turnLog.responses[playerID] = "allow";
  if (ctx.currentPlayer === playerID) {
    ctx.events.endTurn();
  } else if (oneOnOneActions.includes(G.turnLog.action)) {
    G.turnLog.successful = true;
    executeAction(G, ctx);
    if (G.turnLog.action === "steal") {
      ctx.events.endTurn();
    }
  } else if (G.turnLog.responses.filter((response) => response === "allow").length === getNumAlivePlayers(G) - 1) {
    G.turnLog.successful = true;
    executeAction(G, ctx);
    // end for immediate actions, else return control back to currentPlayer
    const immediateActions = ["foreign aid", "tax"];
    if (immediateActions.includes(G.turnLog.action)) {
      ctx.events.endTurn();
    } else {
      ctx.events.setActivePlayers({
        currentPlayer: "action",
        others: "idle",
      });
    }
  }
};

const block = (G, ctx, playerID, character) => {
  G.turnLog.responses[playerID] = "block";
  if (Object.keys(G.turnLog.blockedBy).length === 0) {
    G.turnLog.blockedBy = { name: G.players[playerID].name, id: playerID };
  }

  if (G.turnLog.action === "steal") {
    if (!G.turnLog.blockedBy.hasOwnProperty("character")) {
      G.turnLog.blockedBy.character = "";
    } else {
      G.turnLog.blockedBy.character = character;
      ctx.events.setActivePlayers({
        currentPlayer: "challenge",
        others: "idle",
      });
    }
  } else {
    ctx.events.setActivePlayers({
      currentPlayer: "challenge",
      others: "idle",
    });
  }
};

const initiateChallenge = (G, ctx, playerID) => {
  G.turnLog.responses[playerID] = "challenge";
  const isBlocked = Object.keys(G.turnLog.blockedBy).length !== 0;
  const challengedID = isBlocked ? G.turnLog.blockedBy.id : ctx.currentPlayer;
  G.turnLog.challenge = {
    challenger: { name: G.players[playerID].name, id: playerID },
    challenged: { name: G.players[challengedID].name, id: challengedID },
    characters: getChallengeCharacters(G, isBlocked),
    successful: false,
    loser: {},
    revealedCard: {},
    swapCard: {},
  };

  ctx.events.setActivePlayers({
    all: "idle",
    value: {
      [challengedID]: "revealCard",
    },
  });
};

const revealCard = (G, ctx, playerID, cardID) => {
  G.turnLog.challenge.revealedCard = {
    name: G.players[playerID].hand[cardID].character,
    id: cardID,
  };
  if (G.turnLog.challenge.characters.includes(G.turnLog.challenge.revealedCard.name)) {
    // failed challenge.
    G.turnLog.successful = true;
    G.turnLog.challenge.loser = { name: G.turnLog.challenge.challenger.name, id: G.turnLog.challenge.challenger.id };
    returnToDeck(G, [Card(G.players[playerID].hand[cardID].character, G.players[playerID].hand[cardID].front)]);

    const { character, front } = G.deck.pop();
    G.turnLog.challenge.swapCard = { character, front };
  } else {
    // successful challenge
    G.turnLog.challenge.successful = true;
    G.turnLog.challenge.loser = { name: G.turnLog.challenge.challenged.name, id: G.turnLog.challenge.challenged.id };
    loseCardAndShuffle(G, ctx, playerID, cardID);
  }

  // if there was a block previously, then the successful is the opposite
  if (Object.keys(G.turnLog.blockedBy).length !== 0) {
    G.turnLog.successful = !G.turnLog.successful;
  }
};

const continueTurn = (G, ctx) => {
  // winner of challenge draws new card
  const newCard = G.players[G.turnLog.challenge.challenged.id].hand[G.turnLog.challenge.revealedCard.id];
  newCard.character = G.turnLog.challenge.swapCard.character;
  newCard.front = G.turnLog.challenge.swapCard.front;
  // loser of challenge has to give up card
  ctx.events.setActivePlayers({
    all: "idle",
    value: {
      [G.turnLog.challenge.challenger.id]: "loseCard",
    },
  });
};

const executeAction = (G, ctx) => {
  if (G.turnLog.action === "foreign aid") {
    G.players[ctx.currentPlayer].coins += 2;
    if (Object.keys(G.turnLog.blockedBy).length !== 0) {
      ctx.events.endTurn();
    }
  } else if (G.turnLog.action === "tax") {
    G.players[ctx.currentPlayer].coins += 3;
  } else if (G.turnLog.action === "exchange") {
    G.turnLog.exchange.newHand = getNewHand(G.players[ctx.currentPlayer].hand);
    // drawnCards is already set, simply draw
    G.deck.pop();
    G.deck.pop();
  } else if (G.turnLog.action === "assassinate") {
    if (G.players[G.turnLog.target.id].isOut) {
      ctx.events.endTurn();
    } else {
      ctx.events.setActivePlayers({
        all: "idle",
        value: {
          [G.turnLog.target.id]: "loseAssassinate",
        },
      });
    }
  } else if (G.turnLog.action === "steal") {
    if (G.players[G.turnLog.target.id].coins < 2) {
      G.players[ctx.currentPlayer].coins += G.players[G.turnLog.target.id].coins;
      G.players[G.turnLog.target.id].coins = 0;
    } else {
      G.players[ctx.currentPlayer].coins += 2;
      G.players[G.turnLog.target.id].coins -= 2;
    }
  }
};

export const Coup = {
  name: `${GAME_NAME}`,
  minPlayers: 2,
  maxPlayers: 8,
  setup: setup,
  turn: {
    onBegin: (G, ctx) => {
      logTurn(G.turnLog, "", {}, false, {}, {}, {}, resetResponses(ctx.numPlayers), {});
      ctx.events.setActivePlayers({ currentPlayer: "action", others: "idle" });
    },
    onEnd: (G, ctx) => {
      G.chat.push({ id: "-1", content: getTurnMsg(G.turnLog) });
      checkForWinner(G);
    },
    order: {
      first: (G, ctx) => 0,
      // find the next player who has cards (isOut)
      next: ({ players }, { numPlayers, playOrderPos }) => {
        for (let i = 1; i <= numPlayers; i++) {
          let nextPlayer = (playOrderPos + i) % numPlayers;
          if (!players[nextPlayer].isOut) {
            return nextPlayer;
          }
        }
      },
    },

    stages: {
      action: {
        moves: {
          income,
          prepAction,
          coup,
          setTarget,
          setHand,
          executeAction,
          continueTurn,
          endTurn,
          changeNames,
          message,
        },
      },
      block: {
        moves: { allow, block, message },
      },
      challenge: {
        moves: { allow, initiateChallenge, revealCard, message },
      },
      blockOrChallenge: {
        moves: { allow, block, initiateChallenge, revealCard, message },
      },
      revealCard: {
        moves: { revealCard, executeAction, continueTurn, endTurn, message },
      },
      loseCard: {
        moves: { loseCardAndShuffle, endTurn, message },
      },
      loseAssassinate: {
        moves: { loseCardAndShuffle, message },
      },
      idle: {
        moves: { message },
      },
    },
  },
};

/* ---- Helper functions ---- */
const updateIsOut = (player) => {
  if (player.hand.filter((card) => !card.discarded).length === 0) {
    player.isOut = true;
  }
};

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

const resetResponses = (numPlayers) => {
  const responses = [];
  for (let i = 0; i < numPlayers; i++) {
    responses[i] = "";
  }
  return responses;
};

const checkForWinner = (G) => {
  const playersAlive = G.players.filter((player) => !player.isOut);
  if (playersAlive.length === 1) {
    G.winner.name = playersAlive[0].name;
    G.winner.id = playersAlive[0].id;
  }
};

const getNumAlivePlayers = (G) => {
  return G.players.filter((player) => !player.isOut).length;
};

const getChallengeCharacters = (G, isBlocked) => {
  const action = G.turnLog.action;
  if (action === "foreign aid" || action === "tax") {
    return ["Duke"];
  } else if (action === "exchange") {
    return ["Ambassador"];
  } else if (action === "assassinate") {
    return isBlocked ? ["Contessa"] : ["Assassin"];
  } else if (action === "steal") {
    return isBlocked ? [G.turnLog.blockedBy.character] : ["Captain"];
  }
};

const getNewHand = (hand) => {
  const newHand = [];
  hand.forEach((card) => {
    if (card.discarded) {
      newHand.push(-1);
    } else {
      newHand.push("");
    }
  });
  return newHand;
};

const returnToDeck = (G, cards) => {
  cards.forEach((card) => {
    G.deck.push(card);
  });
  shuffleDeck(G.deck);
};
