import React, { useState, useEffect } from "react";
import uniqid from "uniqid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";

import "./ChatLog.scss";

const handleKeyUp = (e) => {
  e.preventDefault();
  if (e.keyCode === 13) {
    // enter key: another way to send a message
    document.getElementById("send-button").click();
  }
};

const ChatLog = ({ G, playerID, moves }) => {
  const [msg, setMsg] = useState("");

  const message = (content) => {
    moves.message(playerID, content);
    document.getElementById("player-msg").value = "";
    setMsg("");
  };

  useEffect(() => {
    // when a new message appear, automatically scroll chat box (when applicable) to bottom to show it
    let objDiv = document.getElementById("scrollBottom");
    objDiv.scrollTop = objDiv.scrollHeight;
  }, [G.chat]);

  return (
    <>
      <div id="scrollBottom" className="msgs">
        {G.chat.map((msg) => {
          let className = "msg ";
          if (msg.id === "-1") {
            let msgParts = msg.content.split("\n");
            className += "bot-msg ";
            return (
              <div id="playerMsg" className={className} key={uniqid()}>
                <span className={msg.successful ? "successful-color" : "unsuccessful-color"}>{msgParts[0]}</span>
                <div className="addendums">
                  {msgParts.slice(1, msgParts.length).map((msgPart) => (
                    <div key={uniqid()}>{msgPart}</div>
                  ))}
                </div>
              </div>
            );
          } else {
            return (
              <div id="playerMsg" className={className} key={uniqid()}>
                <span className="msg-sender">{G.players[msg.id].name + ": "}</span>
                {msg.content}
              </div>
            );
          }
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
    </>
  );
};

export default ChatLog;
