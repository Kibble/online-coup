import { getNumAlivePlayers, logTurn } from "./helper";
import { loseCardAndShuffle } from "./intermediary";

/* ---- Actions ---- */
const income = (G, ctx) => {
  G.players[ctx.currentPlayer].coins++;

  const { name, id } = G.players[ctx.currentPlayer];
  logTurn(G.turnLog, "income", { name, id }, true);
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
    if (G.players[G.turnLog.target.id].coins < 2) {
      // allows player to steal 0 or 1 coin, and minimum # coins a player can have is 0
      G.players[ctx.currentPlayer].coins += G.players[G.turnLog.target.id].coins;
      G.players[G.turnLog.target.id].coins = 0;
    } else {
      G.players[ctx.currentPlayer].coins += 2;
      G.players[G.turnLog.target.id].coins -= 2;
    }
  }
};

/* ---- Counteractions ---- */

// can "allow" for foreign aid and any character action
const allow = (G, ctx, playerID) => {
  const oneOnOneActions = ["assassinate", "steal"]; // only the targeted player can respond
  G.turnLog.responses[playerID] = "allow";
  if (ctx.currentPlayer === playerID) {
    // if another/targeted player blocks your action, and you allow that block (so your action is unsuccessful)
    ctx.events.endTurn();
  } else if (oneOnOneActions.includes(G.turnLog.action)) {
    // targeted player allows your action
    G.turnLog.successful = true;
    executeAction(G, ctx);
    if (G.turnLog.action === "steal") {
      ctx.events.endTurn();
    }
  } else if (
    // for foregin aid, if you are the last person to allow, then the action goes through
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
    if (G.turnLog.action === "assassinate") {
      G.turnLog.blockedBy.character = "Contessa";
    } else {
      // action === foreign aid
      G.turnLog.blockedBy.character = "Duke";
    }
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

/* ---- Helper functions ---- */

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

export { income, coup, executeAction }; // actions
export { allow, block, initiateChallenge }; // counteractions
