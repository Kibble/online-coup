import { logTurn, logStats, resetResponses, checkForWinner } from "./logic/actions/helper";
import {
  prepAction,
  setTarget,
  setHand,
  revealCard,
  loseCardAndShuffle,
  continueTurn,
} from "./logic/actions/intermediary";
import { income, coup, executeAction, allow, block, initiateChallenge } from "./logic/actions/main";
import { message, changeNames, endTurn, leave, playAgain, setNewRoom } from "./logic/actions/misc";
import { initializeGame, getPlayOrder } from "./logic/initializer";
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
    gameOver: {
      playAgain: [],
      left: [],
      newRoomID: "",
    },
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
    statistics: [
      ["income", 0, "—", "—", "—"],
      ["foreign aid", 0, 0, 0, "—"],
      ["coup", 0, 0, "—", "—"],
      ["tax", 0, 0, "—", 0],
      ["assassinate", 0, 0, 0, 0],
      ["steal", 0, 0, 0, 0],
      ["exchange", 0, 0, "—", 0],
    ],
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
      logStats(G.turnLog, G.statistics);
      G.chat.push({ id: "-1", content: getTurnMsg(G.turnLog), successful: G.turnLog.successful });
      checkForWinner(G);
    },
    order: {
      first: (G, ctx) => 0,
      // find the next player who has cards (skip over players who are out)
      next: ({ players }, { numPlayers, playOrder, playOrderPos }) => {
        for (let i = 1; i <= numPlayers; i++) {
          const nextIndex = (playOrderPos + i) % numPlayers;
          const nextPlayer = playOrder[nextIndex];
          if (!players[nextPlayer].isOut) {
            return nextIndex;
          }
        }
      },
      playOrder: (G, { numPlayers }) => getPlayOrder(numPlayers),
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
          leave,
          playAgain,
          message,
          setNewRoom,
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
        moves: { changeNames, message, leave, playAgain, setNewRoom },
      },
    },
  },
};
