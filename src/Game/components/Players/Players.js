import React from "react";
import classNames from "classnames";
import Player from "./Player";
import "./Players.scss";

// row of players
const Players = (props) => {
  const { ctx, playerID } = props;
  const players = [];
  for (let index = 0; index < ctx.numPlayers; index++) {
    const i = parseInt(ctx.playOrder[index]);
    if (i !== parseInt(playerID)) {
      players.push(
        <div key={props.G.players[i].id + props.G.players[i].name} className="player-container">
          <Player {...props} i={i} />
        </div>
      );
    } else if (
      ctx.playOrder[index] !== ctx.playOrder[0] &&
      ctx.playOrder[index] !== ctx.playOrder[ctx.numPlayers - 1]
    ) {
      // dashed line to indicate where you are in the turn order (i.e. between these two players). only applicable if you're not the first or last player
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
