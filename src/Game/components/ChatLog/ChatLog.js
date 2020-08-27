import React, { useState, useEffect } from "react";
import uniqid from "uniqid";
import classNames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import "./ChatLog.scss";

const ChatLog = ({ G, ctx, playerID, moves }) => {
  const [msg, setMsg] = useState("");

  const message = (content) => {
    moves.message(playerID, content);
    document.getElementById("player-msg").value = "";
    setMsg("");
  };

  useEffect(() => {
    let objDiv = document.getElementById("scrollBottom");
    objDiv.scrollTop = objDiv.scrollHeight;
  }, [G.chat]);

  const handleKeyUp = (e) => {
    e.preventDefault();
    if (e.keyCode === 13) {
      document.getElementById("send-button").click();
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-title">chat & turn log</div>
      <div id="scrollBottom" className="msgs">
        {G.chat.map((msg) => {
          return (
            <div id="playerMsg" className={classNames("msg", { "bot-msg": msg.id === "-1" })} key={uniqid()}>
              <span className="msg-sender">{msg.id === "-1" ? "" : G.players[msg.id].name + ": "}</span>
              {msg.content}
            </div>
          );
        })}
      </div>
      <div className="chat-form">
        <input
          id="player-msg"
          type="text"
          maxLength="70"
          placeholder="Enter Message"
          onChange={(e) => setMsg(e.target.value)}
          onKeyUp={(e) => handleKeyUp(e)}
          autoComplete="off"
        />
        <button id="send-button" className="send-btn" onClick={() => message(msg)} disabled={msg.length === 0}>
          <FontAwesomeIcon icon={faPaperPlane} />
        </button>
      </div>
    </div>
  );
};

export default ChatLog;
