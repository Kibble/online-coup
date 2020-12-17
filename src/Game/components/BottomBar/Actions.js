import React from "react";
import classNames from "classnames";
import "./Actions.scss";

const Actions = ({ G, ctx, playerID, moves }) => {
  const yourPlayer = G.players[playerID];
  const isYourTurn = ctx.currentPlayer === playerID;

  // game specifications for actions
  const canCoup = yourPlayer.coins >= 7;
  const mustCoup = yourPlayer.coins >= 10;
  const canAssassinate = yourPlayer.coins >= 3;
  const done = ctx.currentPlayer === G.turnLog.player.id || G.winner.id !== "-1"; // cannot select actions

  const income = () => {
    moves.income();
  };

  const prepAction = (action) => {
    moves.prepAction(action);
  };

  return (
    <div
      hidden={
        G.turnLog.action === "exchange" &&
        G.turnLog.successful &&
        ctx.activePlayers[playerID] === "action" &&
        isYourTurn
      }
    >
      <div className={classNames("general-actions", { "actions-active-enter": isYourTurn })}>
        <div className="btn-wrapper">
          <button className="action-btn" onClick={income} disabled={!isYourTurn || mustCoup || done}>
            income
          </button>
        </div>
        <div className="btn-wrapper">
          <button
            className="action-btn"
            onClick={() => prepAction("foreign aid")}
            disabled={!isYourTurn || mustCoup || done}
          >
            foreign aid
          </button>
        </div>
        <div className="btn-wrapper">
          <button className="action-btn" onClick={() => prepAction("coup")} disabled={!isYourTurn || !canCoup || done}>
            coup
          </button>
        </div>
      </div>
      <div className={classNames("character-actions", { "actions-active-enter": isYourTurn })}>
        <div className="btn-wrapper">
          <button className="action-btn" onClick={() => prepAction("tax")} disabled={!isYourTurn || mustCoup || done}>
            tax
          </button>
        </div>
        <div className="btn-wrapper">
          <button
            className="action-btn"
            onClick={() => prepAction("assassinate")}
            disabled={!isYourTurn || !canAssassinate || mustCoup || done}
          >
            assassinate
          </button>
        </div>
        <div className="btn-wrapper">
          <button className="action-btn" onClick={() => prepAction("steal")} disabled={!isYourTurn || mustCoup || done}>
            steal
          </button>
        </div>
        <div className="btn-wrapper">
          <button
            className="action-btn"
            onClick={() => prepAction("exchange")}
            disabled={!isYourTurn || mustCoup || done}
          >
            exchange
          </button>
        </div>
      </div>
    </div>
  );
};

export default Actions;
