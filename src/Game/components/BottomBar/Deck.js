import React, { useState } from "react";
import uniqid from "uniqid";

import "./Deck.scss";

const numPages = 2;

const Deck = ({ deck }) => {
  const [page, setPage] = useState(1);

  const pagesArr = Array(numPages)
    .fill()
    .map((_, i) => i + 1);

  const copyDeck = deck.slice().reverse();

  const select = (pageNum) => {
    setPage(pageNum);
  };

  const getPages = () => {
    const startIndex = (page - 1) * 10;
    return copyDeck.slice(startIndex, Math.min(startIndex + 10, deck.length));
  };

  return (
    <div className="deck-container">
      <div>
        <div className="deck-title">Deck:</div>
        <div>
          {pagesArr.map((pageNum) => (
            <button
              key={uniqid()}
              onClick={() => select(pageNum)}
              className={`page-btn ${page === pageNum ? "btn-selected" : "btn-unselected"}`}
            >
              {pageNum}
            </button>
          ))}
        </div>
      </div>
      <div className="deck-cards-container">
        {getPages().map((card) => (
          <img
            key={uniqid()}
            src={`${card.front.replace(".PNG", "-small.PNG")}`}
            className="character-card-small"
            alt={card.character}
          />
        ))}
      </div>
    </div>
  );
};

export default Deck;
