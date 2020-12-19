import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Players, YourPlayer, BottomBar, AnnouncementArea, ChatLogSettings } from "./components";
import "./Board.css";

const Board = (props) => {
  const [revealDeck, setRevealDeck] = useState(false);

  // player 0 has to set the player's actual screen names due to the way boardgame.io works
  useEffect(() => {
    if (props.playerID === "0") {
      props.moves.changeNames(props.gameMetadata);
    }
  }, [props.playerID, props.moves, props.gameMetadata]);

  return (
    <div className="game-container">
      <Players {...props} />
      <div className="your-container">
        <div className="your-player-container">
          <YourPlayer {...props} />
        </div>
        <div className="messages-actions-container">
          <AnnouncementArea {...props} />
          <BottomBar {...props} revealDeck={revealDeck} />
        </div>
        <div className="cls-col">
          <ChatLogSettings {...props} revealDeck={revealDeck} setRevealDeck={setRevealDeck} />
        </div>
      </div>
    </div>
  );
};

Board.propTypes = {
  G: PropTypes.any.isRequired,
  ctx: PropTypes.any.isRequired,
  moves: PropTypes.any.isRequired,
  playerID: PropTypes.string.isRequired,
  gameMetadata: PropTypes.any.isRequired,
};

export default Board;
