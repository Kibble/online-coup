import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Client } from "boardgame.io/react";
import { SocketIO } from "boardgame.io/multiplayer";
import classNames from "classnames";
import { DEFAULT_PORT, APP_PRODUCTION } from "../../config";
import { Coup, Board } from "../../Game";
import Lobby from "../Lobby/Lobby";
import { LobbyAPI } from "../../LobbyAPI";

import "./Room.scss";

const api = new LobbyAPI();

const { origin, protocol, hostname } = window.location;
const SERVER_URL = APP_PRODUCTION ? origin : `${protocol}//${hostname}:${DEFAULT_PORT}`;

const CoupClient = Client({
  game: Coup,
  board: Board,
  debug: true,
  multiplayer: SocketIO({ server: SERVER_URL }),
});

const Room = (props) => {
  const { history } = props;
  const { id } = useParams();
  const [copied, setCopied] = useState(false);
  const [players, setPlayers] = useState([]);
  const [show, setShow] = useState(false);

  // update players who join
  useEffect(() => {
    const interval = setInterval(() => {
      api.getPlayers(id).then(
        (players) => {
          setPlayers(players);
          const currPlayers = players.filter((player) => player.name);
          if (currPlayers.length === players.length) {
            setShow(true);
          }
        },
        () => {
          history.push("", { invalidRoom: true });
        }
      );
    }, 500);
    if (show) {
      clearInterval(interval);
    }
    return () => {
      clearInterval(interval);
    };
  }, [show, players.length, id, history]);

  // copy to clipboard
  useEffect(() => {
    let timeout;
    if (copied) {
      timeout = setTimeout(() => {
        if (document.getSelection().toString() === id) {
          document.getSelection().removeAllRanges();
        }
        setCopied(false);
      }, 3000);
    }

    return () => clearTimeout(timeout);
  }, [copied, id]);

  const copyToClipboard = (e) => {
    const textArea = document.getElementById("roomID");
    textArea.select();
    document.execCommand("copy");
    e.target.focus();
    setCopied(true);
  };

  const leaveRoom = () => {
    api.leaveRoom(id, localStorage.getItem("id"), localStorage.getItem("credentials")).then(() => {
      history.push("/");
    });
  };

  if (show) {
    return (
      <CoupClient
        gameID={id}
        numPlayers={players.length}
        playerID={localStorage.getItem("id")}
        credentials={localStorage.getItem("credentials")}
      />
    );
  } else {
    return (
      <Lobby>
        <span className="title room-title">Room</span>
        <div className="players-list">
          {players.map((player) => {
            if (player.name) {
              return player.name + `${player.name === localStorage.getItem("name") ? " (You)" : ""}\n`;
            } else {
              return "...\n";
            }
          })}
        </div>
        <div className="room-info">
          <div className="roomID-area">
            room id:
            <textarea id="roomID" value={id} readOnly />
            <button
              className={classNames("copy-btn", { "copied-btn": copied })}
              onClick={copyToClipboard}
              disabled={copied}
            >
              {copied ? "copied" : "copy"}
            </button>
          </div>
          <div>Game will begin once all{players.length === 0 ? "" : ` ${players.length}`} players have joined.</div>
          <button className="leave-btn" onClick={leaveRoom}>
            leave
          </button>
        </div>
      </Lobby>
    );
  }
};

export default Room;
