import React, { useState, useEffect } from "react";
import uniqid from "uniqid";
import classNames from "classnames";
import { cards } from "../../logic/cards";
import "./ChoosingPanel.scss";
import { LobbyAPI } from "../../../LobbyAPI";

const api = new LobbyAPI();

const ChoosingPanel = ({ G, ctx, playerID, moves, gameID }) => {
  const [choices, setChoices] = useState([]);

  useEffect(() => {
    if (G.gameOver.newRoomID !== "") {
      const myID = localStorage.getItem("id");
      const myCredentials = localStorage.getItem("credentials");
      const myName = localStorage.getItem("name");
      api.leaveRoom(gameID, myID, myCredentials).then(() => {
        api.joinRoom(G.gameOver.newRoomID, myID, myName).then((credentials) => {
          localStorage.setItem("credentials", credentials);
          window.location.href = "/rooms/" + G.gameOver.newRoomID;
        });
      });
    }
  }, [G.gameOver.newRoomID, gameID]);

  useEffect(() => {
    if (G.gameOver.playAgain.length === ctx.numPlayers) {
      if (G.gameOver.newRoomID === "" && playerID === G.gameOver.playAgain[0]) {
        api.createRoom(ctx.numPlayers).then((roomID) => {
          moves.setNewRoom(roomID);
        });
      }
    }

    const isYourTurn = playerID === ctx.currentPlayer;

    const coup = (character) => {
      moves.coup(character);
    };

    const setHand = (cardID) => {
      moves.setHand(cardID);
    };

    const allow = () => {
      moves.allow(playerID);
    };

    const block = () => {
      moves.block(playerID);
    };

    const setBlock = (character) => {
      moves.block(playerID, character);
    };

    const challenge = () => {
      moves.initiateChallenge(playerID);
    };

    const leaveRoom = () => {
      moves.leave(playerID);
      api.leaveRoom(gameID, localStorage.getItem("id"), localStorage.getItem("credentials")).then(() => {
        // leaving clears your localStorage to "reset" your identity and then takes you to homepage
        localStorage.clear();
        window.location.href = "/";
      });
    };

    const playAgain = () => {
      moves.playAgain(playerID);
    };

    let temp = [];

    // TODO: let players leave anytime (AKA they are "out" to the other players to skip over leaving player's turn)
    // game has ended: let players leave.
    if (G.winner.id !== "-1") {
      document.getElementById("choosing_panel").style.flexDirection = "column";
      document.getElementById("choosing_panel").style.alignItems = "center";
      document.getElementById("choosing_panel").style.justifyContent = "flex-start";
      const playAgainCounter =
        G.gameOver.left.length !== 0 ? "N/A" : `${G.gameOver.playAgain.length}/${ctx.numPlayers}`;
      temp.push(
        <button key={uniqid()} className="play-again-btn" onClick={playAgain} disabled={G.gameOver.left.length !== 0}>
          play again [{playAgainCounter}]
        </button>
      );
      temp.push(
        <button key={uniqid()} className="leave-btn" onClick={leaveRoom}>
          leave
        </button>
      );
    }
    // for blocking steal: show character choices that can block steal (ambassador, captain)
    else if (
      G.turnLog.action === "steal" &&
      Object.keys(G.turnLog.blockedBy).length !== 0 &&
      G.turnLog.blockedBy.character === "" &&
      ctx.activePlayers[playerID] === "blockOrChallenge"
    ) {
      temp.push(
        <img
          key={uniqid()}
          className="character-choice"
          onClick={() => setBlock("Ambassador")}
          src={"/images/ambassador.PNG"}
          alt={"Ambassador"}
        />
      );
      temp.push(
        <img
          key={uniqid()}
          className="character-choice"
          onClick={() => setBlock("Captain")}
          src={"/images/captain.PNG"}
          alt={"Captain"}
        />
      );
    }
    // for coup: show all possible cards to select a targeted character
    else if (G.turnLog.action === "coup" && isYourTurn) {
      // image loading optimization (with hidden)
      cards.forEach((card) => {
        temp.push(
          <img
            key={uniqid()}
            className="character-choice"
            onClick={() => {
              coup(card.character);
            }}
            src={card.front}
            alt={card.character}
            hidden={Object.keys(G.turnLog.target).length === 0}
          />
        );
      });
    }
    // show the top two cards
    else if (G.turnLog.action === "exchange" && isYourTurn) {
      // image loading optimization with hidden
      G.turnLog.exchange.drawnCards.forEach((card) => {
        const cardSelected =
          G.turnLog.exchange.hasOwnProperty("newHand") && G.turnLog.exchange.newHand.includes(card.id);
        temp.push(
          <img
            key={"choice" + card.character}
            className={classNames("big-character-choice", {
              "card-selected": cardSelected,
            })}
            onClick={() => {
              setHand(card.id);
            }}
            src={card.front}
            alt={card.character}
            hidden={!G.turnLog.successful || ctx.activePlayers[playerID] !== "action"}
          />
        );
      });
    }
    // show possible player responses
    else if (!G.players[playerID].isOut && G.turnLog.responses[playerID] === "") {
      if (ctx.activePlayers[playerID] === "block") {
        temp.push(
          <button key={uniqid()} className="choice-btn" onClick={allow}>
            allow
          </button>
        );
        temp.push(
          <button key={uniqid()} className="choice-btn" onClick={block}>
            block
          </button>
        );
      } else if (ctx.activePlayers[playerID] === "challenge") {
        temp.push(
          <button key={uniqid()} className="choice-btn" onClick={allow}>
            allow
          </button>
        );
        temp.push(
          <button key={uniqid()} className="choice-btn" onClick={challenge}>
            challenge
          </button>
        );
      } else if (ctx.activePlayers[playerID] === "blockOrChallenge") {
        temp.push(
          <button key={uniqid()} className="choice-btn" onClick={allow}>
            allow
          </button>
        );
        temp.push(
          <button key={uniqid()} className="choice-btn" onClick={block}>
            block
          </button>
        );
        temp.push(
          <button key={uniqid()} className="choice-btn" onClick={challenge}>
            challenge
          </button>
        );
      }
    }
    setChoices(temp);
  }, [
    G.turnLog,
    G.players,
    G.gameOver,
    ctx.currentPlayer,
    ctx.numPlayers,
    ctx.activePlayers,
    playerID,
    moves,
    G.winner.id,
    gameID,
  ]);

  return <div id="choosing_panel">{choices}</div>;
};

export default ChoosingPanel;
