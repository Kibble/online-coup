import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { Players, YourPlayer, Actions, AnnouncementArea, ChatLog } from "./components";
import "./Board.css";

const Board = (props) => {
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
          <Actions {...props} />
        </div>
        <div className="chat-col">
          <ChatLog {...props} />
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
