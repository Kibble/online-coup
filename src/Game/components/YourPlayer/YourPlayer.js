import React from "react";
import uniqid from "uniqid";
import classNames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSkullCrossbones, faCrown, faThumbsUp, faThumbsDown } from "@fortawesome/free-solid-svg-icons";
import "./YourPlayer.scss";

const YourPlayer = ({ G, ctx, playerID, moves }) => {
  const player = G.players[playerID];
  const isYourTurn = playerID === ctx.currentPlayer;
  const gameOver = G.winner.id !== "-1";

  let cardSelectable =
    (G.turnLog.exchange.hasOwnProperty("newHand") && ctx.activePlayers[playerID]) ||
    (ctx.activePlayers[playerID] && ctx.activePlayers[playerID].includes("lose"));
  let cardSelected = false;
  // for exchange
  if (ctx.activePlayers[playerID] === "revealCard") {
    cardSelectable = Object.keys(G.turnLog.challenge.loser).length === 0;
    cardSelected = !cardSelectable;
  }

  const revealCard = (playerID, cardID) => {
    moves.revealCard(playerID, cardID);
  };

  const loseCard = (playerID, cardID) => {
    moves.loseCardAndShuffle(playerID, cardID);
  };

  const setHand = (cardID) => {
    moves.setHand(cardID);
  };

  const hand = [];
  player.hand.forEach((card) => {
    let cardClass = "";
    if (card.discarded) {
      cardClass = "character-card-discarded";
    } else if (
      (cardSelected && G.turnLog.challenge.revealedCard.id === card.id) ||
      (isYourTurn && G.turnLog.exchange.hasOwnProperty("newHand") && G.turnLog.exchange.newHand.includes(card.id))
    ) {
      cardClass = "card-selected";
    } else if (cardSelectable) {
      cardClass = "card-selectable";
    }
    // image loading optimization
    if (G.turnLog.challenge.hasOwnProperty("swapCard")) {
      const img = new Image();
      img.src = G.turnLog.challenge.swapCard.front;
    }
    hand.push(
      <img
        key={uniqid()}
        className={`character-card ${cardClass}`}
        src={card.discarded ? "//:0" : card.front}
        onClick={() => {
          if (ctx.activePlayers[playerID] && ctx.activePlayers[playerID].includes("lose") && !card.discarded) {
            loseCard(playerID, card.id);
          } else if (G.turnLog.exchange.hasOwnProperty("newHand") && isYourTurn) {
            setHand(card.id);
          } else if (cardSelectable && !card.discarded) {
            revealCard(playerID, card.id);
          }
        }}
        alt={card.discarded ? "" : card.character}
      />
    );
  });

  let animate = "";
  if (player.isOut) {
    animate = "your-player-out";
  } else if (gameOver) {
    animate = "your-player-winner";
  } else if (isYourTurn) {
    animate = "your-player-enter";
  } else {
    animate = "your-player-inactive";
  }

  let iconColor = "";
  if (G.turnLog.responses[playerID] === "allow") {
    iconColor = "#008000";
  } else if (G.turnLog.responses[playerID] === "block") {
    iconColor = "#8b0000";
  } else if (G.turnLog.responses[playerID] === "challenge") {
    iconColor = "#42526C";
  }

  return (
    <div className={classNames(`your-player ${animate}`, { "your-player-selected": cardSelectable && !player.isOut })}>
      <div className="player-body">
        <div className="player-name">{player.name} (You)</div>
        <div className="no-gutters d-flex" style={{ height: "60%" }}>
          {hand}
        </div>
        {player.isOut || gameOver ? (
          <div className="exiled-text">
            {player.isOut ? (
              <>
                <FontAwesomeIcon icon={faSkullCrossbones} />
                &nbsp;(exiled)&nbsp;
                <FontAwesomeIcon icon={faSkullCrossbones} />
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faCrown} />
                &nbsp;winner&nbsp;
                <FontAwesomeIcon icon={faCrown} />
              </>
            )}
          </div>
        ) : (
          <div className="coin-row no-gutters">
            <div className="w-50 h-100 d-flex align-items-center justify-content-end" style={{ paddingRight: "1%" }}>
              <img
                draggable={false}
                className="img-fluid"
                src="/images/coin.png"
                alt="coins"
                style={{ height: "90%" }}
              />
            </div>
            <div
              className="w-50 d-flex align-items-center justify-content-start"
              style={{ paddingLeft: "1.2%", fontSize: "2.8vw" }}
            >
              {player.coins}
              <div className="response-icon" style={{ paddingRight: "1vw", color: `${iconColor}` }}>
                {G.turnLog.responses[playerID] !== "" ? (
                  G.turnLog.responses[playerID] === "allow" ? (
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

export default YourPlayer;
