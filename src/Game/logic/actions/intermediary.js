import { Card } from "../cards";
import { returnToDeck, updateIsOut } from "./helper";
import { executeAction } from "./main";

/* ---- Intermediary Actions ---- */

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

// Character actions: coup, steal, assassinate
const setTarget = (G, ctx, target) => {
  G.turnLog.target = target;
  if (G.turnLog.action === "steal" || G.turnLog.action === "assassinate") {
    if (G.turnLog.action === "assassinate") {
      // subtract coins after assassin choose target
      G.players[ctx.currentPlayer].coins -= 3;
    }
    ctx.events.setActivePlayers({
      // steal and assassinate can be blocked or challenged
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
      if (newCardID !== -1) {
        // -1 indicates card is discarded
        const newCard =
          newCardID < 2 // check whether to update from the original hand or from the two cards draw
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
      notUsed[i] = notUsed[i] < 2 ? oldHand[notUsed[i]] : G.turnLog.exchange.drawnCards[notUsed[i] - 2];
    }
    returnToDeck(G, notUsed);
    ctx.events.endTurn();
  }
};

/* ---- Challenge Responses ---- */

const revealCard = (G, ctx, playerID, cardID) => {
  G.turnLog.challenge.revealedCard = {
    name: G.players[playerID].hand[cardID].character,
    id: cardID,
  };
  if (G.turnLog.challenge.characters.includes(G.turnLog.challenge.revealedCard.name)) {
    // failed challenge, so the action goes through.
    G.turnLog.successful = true;
    G.turnLog.challenge.loser = {
      name: G.turnLog.challenge.challenger.name,
      id: G.turnLog.challenge.challenger.id,
    };
    returnToDeck(G, [Card(G.players[playerID].hand[cardID].character, G.players[playerID].hand[cardID].front)]);

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

// Character action: losing a challenge, assassinate, exchange, coup
const loseCardAndShuffle = (G, ctx, playerID, cardID) => {
  returnToDeck(G, [Card(G.players[playerID].hand[cardID].character, G.players[playerID].hand[cardID].front)]);

  G.players[playerID].hand[cardID] = {
    character: "",
    front: "",
    discarded: true,
    id: cardID,
  };
  updateIsOut(G.players[playerID]);

  if (
    // Player gets assassinated
    G.turnLog.action === "assassinate" &&
    playerID === G.turnLog.target.id &&
    ctx.activePlayers[playerID] === "loseCard"
  ) {
    if (G.players[playerID].isOut) {
      ctx.events.endTurn();
    } else {
      // Possibility of assassin double kill: after player loses challenge and gives up an influence, then carry out the successful assassination
      ctx.events.setActivePlayers({
        all: "idle",
        value: {
          [playerID]: "loseAssassinate",
        },
      });
    }
  } else if (
    // Player attempts to exchange, gets challenged, and reveals ambassador successfully.
    G.turnLog.action === "exchange" &&
    Object.keys(G.turnLog.challenge) !== 0 &&
    !G.turnLog.challenge.successful
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
  } else if (
    // Player gets couped or loses challenge
    G.turnLog.action === "coup" ||
    ctx.activePlayers[playerID].includes("lose")
  ) {
    ctx.events.endTurn();
  }
};

const continueTurn = (G, ctx) => {
  // winner of challenge draws a new card (this occurs after revealing the correct card)
  const newCard = G.players[G.turnLog.challenge.challenged.id].hand[G.turnLog.challenge.revealedCard.id];
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

export { prepAction, setTarget, setHand, revealCard, loseCardAndShuffle, continueTurn };
