import React, { useState } from "react";
import uniqid from "uniqid";
import classNames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSkullCrossbones,
  faCrown,
  faThumbsUp,
  faThumbsDown,
  faDoorClosed,
  faDoorOpen,
} from "@fortawesome/free-solid-svg-icons";
import "./Player.scss";

const Player = ({ G, ctx, playerID, moves, i }) => {
  const [revealHand, setRevealHand] = useState(false);
  const yourPlayer = G.players[playerID];
  const player = G.players[i];
  const gameOver = G.winner.id !== "-1";

  const hand = [];
  player.hand.forEach((card, cardIndex) => {
    let revealCard = false;
    if (ctx.activePlayers[i] === "revealCard") {
      revealCard = G.turnLog.challenge.revealedCard.length !== 0 && card.id === G.turnLog.challenge.revealedCard.id;
    }
    hand.push(
      card.discarded ? (
        <div key={uniqid()} className="character-card character-card-discarded"></div>
      ) : (
        <img
          onDragStart={(e) => {
            e.preventDefault();
          }}
          draggable={false}
          key={player.name + cardIndex}
          className={classNames("character-card", {
            "character-card-reveal": revealCard,
          })}
          src={gameOver || revealCard || revealHand ? card.front : "/images/back.PNG"} // on game over, reveal the winner's cards to everyone
          alt={gameOver || revealCard || revealHand ? card.character : "card"}
        />
      )
    );
  });

  const isCurrentPlayer = i === parseInt(ctx.currentPlayer);
  const isYourTurn = playerID === ctx.currentPlayer;
  const playerTargetedActions = ["coup", "assassinate", "steal"];
  const canSelectPlayer =
    playerTargetedActions.includes(G.turnLog.action) &&
    isYourTurn &&
    Object.keys(G.turnLog.target).length === 0 &&
    !player.isOut;
  const canRevealHand = yourPlayer.isOut && !player.isOut && !gameOver;
  const targeted = i === parseInt(G.turnLog.target.id);

  const updateReveal = () => {
    setRevealHand(!revealHand);
  };

  // for coup, player must select another player as the target
  const setTarget = () => {
    if (canSelectPlayer) {
      const { name, id } = player;
      moves.setTarget({ name, id });
    }
  };

  /* animation/styling stuff */

  let animate = "";
  if (player.isOut) {
    animate = "player-out";
  } else if (gameOver) {
    animate = "player-winner";
  } else if (isCurrentPlayer) {
    animate = "player-entered";
  } else if (isYourTurn) {
    if (canSelectPlayer) {
      animate = "player-select";
    } else if (targeted) {
      animate = "player-selected";
    }
  }

  if (canRevealHand) {
    animate += " player-select-reveal";
  }

  // little icon to indicate a player's counterresponse
  let iconColor = "";
  if (G.turnLog.responses[i] === "allow") {
    iconColor = "#008000";
  } else if (G.turnLog.responses[i] === "block") {
    iconColor = "#8b0000";
  } else if (G.turnLog.responses[i] === "challenge") {
    iconColor = "#42526C";
  }

  const getBottomRow = (status, icon) => (
    <>
      {icon}&nbsp;({status})&nbsp;{icon}
    </>
  );

  const bottomRow = () => {
    if (G.gameOver.playAgain.includes(i.toString())) {
      return getBottomRow("ready", <FontAwesomeIcon icon={faDoorOpen} />);
    } else if (G.gameOver.left.includes(i.toString())) {
      return getBottomRow("left", <FontAwesomeIcon icon={faDoorClosed} />);
    } else if (player.isOut) {
      return getBottomRow("exiled", <FontAwesomeIcon icon={faSkullCrossbones} />);
    } else {
      return getBottomRow("winner", <FontAwesomeIcon icon={faCrown} />);
    }
  };

  return (
    <div
      className={`player ${animate}`}
      onClick={() => {
        canRevealHand ? updateReveal() : setTarget();
      }}
    >
      <div className="player-body">
        <div className="player-name">{player.name}</div>
        <div className="no-gutters d-flex" style={{ height: "60%" }}>
          {hand}
        </div>
        {player.isOut || gameOver ? (
          <div className="exiled-text">{bottomRow()}</div>
        ) : (
          <div className="coin-row no-gutters">
            <div className="w-50 h-100 d-flex justify-content-end" style={{ paddingRight: "1%" }}>
              <img
                onDragStart={(e) => {
                  e.preventDefault();
                }}
                draggable={false}
                className="img-fluid h-100"
                src="/images/coin.png"
                alt="coins"
              />
            </div>
            <div className="w-50 d-flex align-items-center" style={{ paddingLeft: "1%" }}>
              {player.coins}
              <div className="response-icon" style={{ color: `${iconColor}` }}>
                {G.turnLog.responses[i] !== "" ? (
                  G.turnLog.responses[i] === "allow" ? (
                    <FontAwesomeIcon icon={faThumbsUp} />
                  ) : (
                    <FontAwesomeIcon icon={faThumbsDown} />
                  )
                ) : (
                  ""
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Player;
