import React from "react";
import Actions from "./Actions";

import "./BottomBar.scss";

const BottomBar = ({ G, ctx, playerID, moves }) => {
  // G.winner.id !== "-1" || G.players[playerID].isOut
  return <Actions G={G} ctx={ctx} playerID={playerID} moves={moves} />;
};

export default BottomBar;
