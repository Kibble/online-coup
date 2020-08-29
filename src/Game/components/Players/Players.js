import React from "react";
import classNames from "classnames";
import uniqid from "uniqid";
import Player from "./Player";
import "./Players.scss";

const Players = (props) => {
  const { ctx, playerID } = props;
  const players = [];
  for (let i = 0; i < ctx.numPlayers; i++) {
    if (i !== parseInt(playerID)) {
      players.push(
        <div
          key={props.G.players[i].id + props.G.players[i].name}
          className="player-container"
        >
          <Player {...props} i={i} />
        </div>
      );
    } else if (i !== 0 && i !== ctx.numPlayers - 1) {
      players.push(
        <div key="position marker" className="d-flex align-items-center h-100">
          <div
            className={classNames("position-marker", {
              "position-marker-active": playerID === ctx.currentPlayer,
            })}
          ></div>
        </div>
      );
    }
  }
  return <div className="players">{players}</div>;
};

export default Players;
