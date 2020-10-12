import { Card } from "./logic/cards";
import { initializeGame, shuffleDeck } from "./logic/initializer";
import { getTurnMsg } from "./logic/messageBuilder";
import { GAME_NAME } from "../config";

/* TODO: CLEANUP CODE and make code more readabkle :( it works! but looks sort of cluttered */

/* ---- Setup ---- */
const setup = ({ numPlayers }) => {
  const { deck, players } = initializeGame(numPlayers);

  // initialize game state G
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

/* ---- Intermediary Character Actions ---- */

const message = (G, ctx, id, content) => {
  G.chat.push({ id, content });
  // TODO: save chat and game state data into database... don't want to clutter poor webpage with chat if it gets flooded
  if (G.chat.length > 35) {      
    G.chat.shift();
  }
};

const changeNames = (G, ctx, playerList) => {
  for (let i = 0; i < playerList.length; i++) {
    G.players[i].name = playerList[i].name;
  }
};

// Character actions: coup, steal, assassinate 
const setTarget = (G, ctx, target) => {
  G.turnLog.target = target;
  if (G.turnLog.action === "steal" || G.turnLog.action === "assassinate") {
    if (G.turnLog.action === "assassinate") {   // subtract coins after assassin choose target
      G.players[ctx.currentPlayer].coins -= 3;
    }
    ctx.events.setActivePlayers({   // steal and assassinate can be blocked or challenged
      all: "idle",
      value: {
        [target.id]: "blockOrChallenge",
      },
    });
  }
};

// Character action: exchange, choose one card at a time
const setHand = (G, ctx, cardID) => {
  const { hand } = G.players[ctx.currentPlayer];
  const { newHand } = G.turnLog.exchange;
  if (!newHand.includes(cardID)) {
    let index = newHand.findIndex((card) => card === ""); // find next available card in hand (either 0 or 1)
    newHand[index] = cardID;
  }

  // done choosing: update player's hand accordingly
  if (!newHand.includes("")) {
    const oldHand = [];
    for (let i = 0; i < hand.length; i++) {
      const { character, front } = hand[i];
      oldHand.push({ character, front });
    }
    for (let i = 0; i < newHand.length; i++) {
      const newCardID = newHand[i];
      if (newCardID !== -1) {     // -1 indicates card is discarded
        const newCard =
          newCardID < 2           // check whether to update from the original hand or from the two cards draw
            ? oldHand[newCardID]
            : G.turnLog.exchange.drawnCards[newCardID - 2];
        hand[i].character = newCard.character;
        hand[i].front = newCard.front;
      }
    }
    // return cards that weren't chosen to the deck    
    let notUsed = [];
    for (let i = 0; i <= 1; i++) {
      if (!hand[i].discarded) {
        notUsed.push(i);
      }
    }
    notUsed.push(2);
    notUsed.push(3);
    // notUsed contains all the cards you could've chosen: now, only choose the cards that weren't chosen
    let i = notUsed.length;
    while (i--) {
      if (newHand.includes(notUsed[i])) {
        notUsed.splice(i, 1);
      }
    }
    // select those unchosen cards from either the original hand or from the two cards drawn
    for (let i = 0; i < notUsed.length; i++) {
      notUsed[i] =
        notUsed[i] < 2
          ? oldHand[notUsed[i]]
          : G.turnLog.exchange.drawnCards[notUsed[i] - 2];
    }
    returnToDeck(G, notUsed);
    ctx.events.endTurn();
  }

// Update turnLog as soon as player selects an action, and prepare as necessary (updating active players, setting up ambassador's drawn cards)
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

// Character action: losing a challenge, assassinate, exchange, coup
const loseCardAndShuffle = (G, ctx, playerID, cardID) => {
  returnToDeck(G, [
    Card(
      G.players[playerID].hand[cardID].character,
      G.players[playerID].hand[cardID].front
    ),
  ]);

  G.players[playerID].hand[cardID] = {
    character: "",
    front: "",
    discarded: true,
    id: cardID,
  };
  updateIsOut(G.players[playerID]);

  if (    // Player gets assassinated
    G.turnLog.action === "assassinate" &&
    playerID === G.turnLog.target.id &&
    ctx.activePlayers[playerID] === "loseCard"
  ) {
    if (G.players[playerID].isOut) {
      ctx.events.endTurn();
    } else {    // Possibility of assassin double kill: after player loses challenge and gives up an influence, then carry out the successful assassination 
      ctx.events.setActivePlayers({
        all: "idle",
        value: {
          [playerID]: "loseAssassinate",
        },
      });
    }
  } else if (   // Player attempts to exchange, gets challenged, and reveals ambassador successfully.
    G.turnLog.action === "exchange" &&
    Object.keys(G.turnLog.challenge) !== 0
  ) {
    // redraw with the new deck (after returning ambassador to the deck)
    // no possibility of array out of bounds because the game starts out with at least 2 cards in deck
    G.turnLog.exchange.drawnCards = [
      { ...G.deck[G.deck.length - 1], id: 2 },
      { ...G.deck[G.deck.length - 2], id: 3 },
    ];
    executeAction(G, ctx);
    ctx.events.setActivePlayers({
      currentPlayer: "action",
      others: "idle",
    });
  } else if (   // Player gets couped or loses challenge
    G.turnLog.action === "coup" ||
    ctx.activePlayers[playerID].includes("lose")
  ) {
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

// after player selects coup as action and a target...
const coup = (G, ctx, targetCharacter) => {
  G.turnLog.target.character = targetCharacter;
  G.players[ctx.currentPlayer].coins -= 7;
  // check if target has the targeted character card in his hand
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

// can "allow" for foreign aid and any character action
const allow = (G, ctx, playerID) => {
  const oneOnOneActions = ["assassinate", "steal"];   // only the targeted player can respond
  G.turnLog.responses[playerID] = "allow";  
  if (ctx.currentPlayer === playerID) {   // if another/targeted player blocks your action, and you allow that block (so your action is unsuccessful)
    ctx.events.endTurn();
  } else if (oneOnOneActions.includes(G.turnLog.action)) {  // targeted player allows your action
    G.turnLog.successful = true;
    executeAction(G, ctx);      
    if (G.turnLog.action === "steal") {   
      ctx.events.endTurn();
    }
  } else if (   // for foregin aid, if you are the last person to allow, then the action goes through
    G.turnLog.responses.filter((response) => response === "allow").length ===   
    getNumAlivePlayers(G) - 1
  ) {
    G.turnLog.successful = true;
    executeAction(G, ctx);
    // end for immediate actions (i.e. actions that simply increase your coins), else return control back to currentPlayer to complete the action
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

// can "block" for foreign aid, assassinate and steal
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
  if (
    G.turnLog.challenge.characters.includes(
      G.turnLog.challenge.revealedCard.name
    )
  ) {
    // failed challenge, so the action goes through.
    G.turnLog.successful = true;
    G.turnLog.challenge.loser = {
      name: G.turnLog.challenge.challenger.name,
      id: G.turnLog.challenge.challenger.id,
    };
    returnToDeck(G, [
      Card(
        G.players[playerID].hand[cardID].character,
        G.players[playerID].hand[cardID].front
      ),
    ]);

    const { character, front } = G.deck.pop();
    G.turnLog.challenge.swapCard = { character, front };
  } else {
    // successful challenge, loser of challenge must give up card.
    G.turnLog.challenge.successful = true;
    G.turnLog.challenge.loser = {
      name: G.turnLog.challenge.challenged.name,
      id: G.turnLog.challenge.challenged.id,
    };
    loseCardAndShuffle(G, ctx, playerID, cardID);
  }

  // if there was a block previously, then the successful is the opposite
  if (Object.keys(G.turnLog.blockedBy).length !== 0) {
    G.turnLog.successful = !G.turnLog.successful;
  }
};

const continueTurn = (G, ctx) => {
  // winner of challenge draws a new card (this occurs after revealing the correct card)
  const newCard =
    G.players[G.turnLog.challenge.challenged.id].hand[
      G.turnLog.challenge.revealedCard.id
    ];
  newCard.character = G.turnLog.challenge.swapCard.character;
  newCard.front = G.turnLog.challenge.swapCard.front;
  // loser of challenge has to give up one card
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
    // drawnCards is already set (for image optimization attempt), simply draw
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
    if (G.players[G.turnLog.target.id].coins < 2) { // allows player to steal 0 or 1 coin, and minimum # coins a player can have is 0
      G.players[ctx.currentPlayer].coins +=
        G.players[G.turnLog.target.id].coins;
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
      logTurn(
        G.turnLog,
        "",
        {},
        false,
        {},
        {},
        {},
        resetResponses(ctx.numPlayers),
        {}
      );
      ctx.events.setActivePlayers({ currentPlayer: "action", others: "idle" });
    },
    onEnd: (G, ctx) => {
      G.chat.push({ id: "-1", content: getTurnMsg(G.turnLog) });
      checkForWinner(G);
    },
    order: {
      first: (G, ctx) => Math.floor(Math.random() * ctx.numPlayers),  // first player is randomly chosen
      // find the next player who has cards (skip over players who are out)
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
        moves: { changeNames, message },
      },
    },
  },
};

/* ---- Helper functions ---- */
const updateIsOut = (player) => {
  if (player.hand.filter((card) => !card.discarded).length === 0) { // if both cards are discarded, then player is out
    player.isOut = true;
  }
};

// update turnLog in one line
const logTurn = (
  turnLog,
  action,
  player,
  successful,
  target,
  blockedBy,
  challenge,
  responses,
  exchange
) => {
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

const checkForWinner = (G) => {
  const playersAlive = G.players.filter((player) => !player.isOut);
  if (playersAlive.length === 1) {        // game is over when only 1 player is alive at the end of each turn
    G.winner.name = playersAlive[0].name;
    G.winner.id = playersAlive[0].id;
  }
};

const getNumAlivePlayers = (G) => {
  return G.players.filter((player) => !player.isOut).length;
};

// returns what characters can challenge the current action
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

// returns a new, empty hand for preparing an exchange (discarded cards are marked by a -1)
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
