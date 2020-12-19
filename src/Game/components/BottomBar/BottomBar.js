import React from "react";
import Deck from "./Deck";
import Actions from "./Actions";

import "./BottomBar.scss";

const BottomBar = ({ G, ctx, playerID, moves, revealDeck }) =>
  G.winner.id !== "-1" || G.players[playerID].isOut ? (
    revealDeck ? (
      <Deck deck={G.deck} />
    ) : (
      ""
    )
  ) : (
    <Actions G={G} ctx={ctx} playerID={playerID} moves={moves} />
  );

export default BottomBar;
