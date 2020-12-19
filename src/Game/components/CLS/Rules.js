import React from "react";
import uniqid from "uniqid";

import "./Rules.scss";

const genDescs = [
  ["Income", "take 1 coin"],
  ["Foreign Aid", "take 2 coins"],
  ["Coup", "pay 7 coins", "choose player to lose guessed character upon correct guess"],
];

const charActDescs = [
  ["Tax", "Duke", "take 3 coins"],
  ["Assassinate", "Assassin", "pay 3 coins", "choose player to lose a character"],
  ["Steal", "Captain", "take at most 2 coins from another player"],
  ["Exchange", "Ambassador", "exchange hand with top 2 cards of deck"],
];

const counterActDesc = [
  ["Duke", "blocks foreign aid"],
  ["Ambassador", "blocks stealing"],
  ["Captain", "blocks stealing"],
  ["Contessa", "blocks assassination"],
];

const numPages = 3;

const pagesArr = Array(numPages)
  .fill()
  .map((_, i) => i + 1);

const Page1 = (
  <>
    <div className="rules-intro-container">
      <span className="rules-intro">take one action</span>
      <span className="rules-intro-footer">(If 10+ coins must choose to launch Coup)</span>
    </div>
    <div className="rules-desc-container">
      <span className="rules-title">General Actions</span>
      <table className="rules-table">
        <thead>
          <tr>
            <th>Action</th>
            <th>Effect</th>
          </tr>
        </thead>
        <tbody>
          {genDescs.map((desc) => {
            return (
              <tr key={uniqid()}>
                <td>{desc[0]}</td>
                <td>
                  <div className="action-description">
                    {desc[1]}
                    {desc.slice(2).map((extraDesc) => (
                      <span className="extra-desc" key={uniqid()}>
                        {extraDesc}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </>
);

const Page2 = (
  <>
    <div className="rules-desc-container">
      <div className="rules-title">Character Actions</div>
      <table className="rules-table">
        <thead>
          <tr>
            <th>Action</th>
            <th>Effect</th>
          </tr>
        </thead>
        <tbody>
          {charActDescs.map((desc) => {
            return (
              <tr className="character-action-entry" key={uniqid()}>
                <td>
                  {desc[0]}
                  <div className="character-footer">({desc[1]})</div>
                </td>
                <td>
                  <div className="action-description">
                    {desc[2]}
                    {desc.slice(3).map((extraDesc) => (
                      <span className="extra-desc" key={uniqid()}>
                        {extraDesc}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </>
);

const Page3 = (
  <>
    <div className="rules-desc-container">
      <div className="rules-title">Counteractions</div>
      <table className="rules-table">
        <thead>
          <tr>
            <th>Character</th>
            <th>Counteraction</th>
          </tr>
        </thead>
        <tbody>
          {counterActDesc.map((desc) => {
            return (
              <tr key={uniqid()}>
                <td>{desc[0]}</td>
                <td>
                  <div className="action-description">
                    {desc[1]}
                    {desc.slice(2).map((extraDesc) => (
                      <span className="extra-desc" key={uniqid()}>
                        {extraDesc}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </>
);

const Pages = [Page1, Page2, Page3];

const Rules = ({ page, setPage }) => {
  const select = (pageNum) => {
    setPage(pageNum);
  };

  return (
    <>
      {Pages[page - 1]}
      <div className="rules-pagebar">
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
    </>
  );
};

export default Rules;
