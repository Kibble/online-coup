import { logTurn, resetResponses, checkForWinner } from "./logic/actions/helper";
import {
  prepAction,
  setTarget,
  setHand,
  revealCard,
  loseCardAndShuffle,
  continueTurn,
} from "./logic/actions/intermediary";
import { income, coup, executeAction, allow, block, initiateChallenge } from "./logic/actions/main";
import { message, changeNames, endTurn } from "./logic/actions/misc";
import { initializeGame } from "./logic/initializer";
import { getTurnMsg } from "./logic/messageBuilder";
import { GAME_NAME } from "../config";

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
      G.chat.push({ id: "-1", content: getTurnMsg(G.turnLog), successful: G.turnLog.successful });
      checkForWinner(G);
    },
    order: {
      first: (G, ctx) => Math.floor(Math.random() * ctx.numPlayers), // first player is randomly chosen
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
