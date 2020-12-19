import React from "react";
import uniqid from "uniqid";

import "./GameView.scss";

const statsHdrs = [
  "Action",
  <span className="successful-color">✔</span>,
  <span className="unsuccessful-color">✘</span>,
  <span className="counteraction-color">⚒</span>,
  <span className="counteraction-color">⚔</span>,
];

const GameView = ({ G, playerID, revealDeck, setRevealDeck }) => {
  const player = G.players[playerID];

  const updateReveal = () => {
    setRevealDeck(!revealDeck);
  };

  const deckView = (
    <>
      <button className={revealDeck ? "btn-selected" : "btn-unselected"} onClick={() => updateReveal()}>
        {revealDeck ? "hide" : "reveal"} deck
      </button>
      <div>click on a player to reveal/hide their hand</div>
    </>
  );

  return (
    <div className="gameview-container">
      <table className="gameview-table">
        <thead>
          <tr>
            {statsHdrs.map((hdr) => (
              <th key={uniqid()}>{hdr}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {G.statistics.map((row) => {
            return (
              <tr key={uniqid()}>
                {row.map((entry) => (
                  <td key={uniqid()} className="stat-desc">
                    {entry}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="stat-legend">
        <span>
          {statsHdrs[1]}/{statsHdrs[2]}: # successful/unsuccessful
        </span>
        <span>
          {statsHdrs[3]}/{statsHdrs[4]}: # direct blocks/challenges
        </span>
      </div>
      <div className="deckview-container">
        {player.isOut || G.winner.id !== "-1" ? (
          deckView
        ) : (
          <span className="deck-info">{`Deck: ${G.deck.length} cards`}</span>
        )}
      </div>
    </div>
  );
};

export default GameView;
