import React, { useState, useEffect } from "react";
import classNames from "classnames";
import ChoosingPanel from "./ChoosingPanel";
import "./AnnouncementArea.scss";

const AnnouncementArea = (props) => {
  const { G, ctx, playerID, moves } = props;
  const isYourTurn = playerID === ctx.currentPlayer;
  const name = isYourTurn ? "you" : `${G.players[ctx.currentPlayer].name}`;

  const [msg, setMsg] = useState("");
  const [msgLoading, setMsgLoading] = useState(true);

  // display at beginning of turn 
  useEffect(() => {
    setMsg(isYourTurn ? `${name}r turn` : `${name}'s turn`);
    setMsgLoading(true);
  }, [ctx.currentPlayer, isYourTurn, name]);

  const hand = G.players[playerID].hand;

  // bulk of announcements happen here (i.e. the middle of the turn):
  useEffect(() => {
    const playerTargetedActions = ["coup", "assassinate", "steal"];
    let timer;

    // on successful assassination
    if (ctx.activePlayers[G.turnLog.target.id] === "loseAssassinate") {
      if (G.turnLog.target.id === playerID) {
        setMsg("choose an influence to give up (assassinated).");
        setMsgLoading(false);
      } else {
        setMsg(
          `waiting for ${G.turnLog.target.name} to give up an influence (assassinated)`
        );
        setMsgLoading(true);
      }
    }

    // on successful exchange
    else if (
      G.turnLog.successful &&
      G.turnLog.action === "exchange" &&
      ctx.activePlayers[ctx.currentPlayer] === "action"
    ) {
      if (G.turnLog.player.id === playerID) {
        const numToChoose = hand.filter((card) => !card.discarded).length;
        setMsg(
          `choose your new hand (${numToChoose}).\n the top two cards from the deck are:`
        );
        setMsgLoading(false);
      } else {
        setMsg(`waiting for ${G.turnLog.player.name} to complete the exchange`);
        setMsgLoading(true);
      }
    }

    // on challenge
    else if (Object.keys(G.turnLog.challenge).length !== 0) {
      const isChallenger = G.turnLog.challenge.challenger.id === playerID;
      const challengeCharacters =
        G.turnLog.challenge.characters.length === 1
          ? `${G.turnLog.challenge.characters[0]}`
          : `${G.turnLog.challenge.characters[0]} or ${G.turnLog.challenge.characters[1]}`;
      // right after challenge
      if (Object.keys(G.turnLog.challenge.loser).length === 0) {
        if (G.turnLog.challenge.challenged.id === playerID) {
          setMsg(
            `${G.turnLog.challenge.challenger.name} challenges!\n Reveal ${challengeCharacters} or give up a card.`
          );
          setMsgLoading(false);
        } else {
          setMsg(
            `${
              isChallenger ? "you" : G.turnLog.challenge.challenger.name
            } challenge${isChallenger ? "" : "s"}!\n Waiting for ${
              G.turnLog.challenge.challenged.name
            }'s response`
          );
          setMsgLoading(true);
        }
      }
      // after deciding loser of the challenge
      else {
        if (ctx.activePlayers[G.turnLog.challenge.loser.id] === "loseCard") {
          if (G.turnLog.challenge.loser.id === playerID) {
            setMsg("choose an influence to give up (challenge lost).");
            setMsgLoading(false);
          } else {
            setMsg(
              `${
                G.turnLog.challenge.challenged.id === playerID
                  ? `your new card is ${G.turnLog.challenge.swapCard.character}.\n`
                  : ""
              }waiting for ${
                G.turnLog.challenge.challenger.name
              } to give up an influence`
            );
            setMsgLoading(true);
          }
        }
        // challenge succeeds
        else if (G.turnLog.challenge.successful) {
          setMsg(
            `${
              G.turnLog.challenge.challenger.id === playerID
                ? "your"
                : `${G.turnLog.challenge.challenger.name}'s`
            } challenge succeeds.`
          );
          setMsgLoading(false);
          timer = setTimeout(() => {    // timer to allow players time to read announcements, but also advance the game "automatically" when necessary
            if (G.turnLog.challenge.challenged.id === playerID) {
              if (G.turnLog.action === "steal") {
                if (Object.keys(G.turnLog.blockedBy).length !== 0) {
                  moves.executeAction();
                }
                moves.endTurn();
              } else if (
                (G.turnLog.action === "assassinate" &&
                  playerID === G.turnLog.target.id) ||
                Object.keys(G.turnLog.blockedBy).length !== 0
              ) {
                moves.executeAction();
              } else {
                moves.endTurn();
              }
            }
          }, 2000);
        }
        // challenge fails
        else {
          if (G.turnLog.challenge.challenged.id === playerID) {
            setMsg(
              `you reveal ${G.turnLog.challenge.revealedCard.name}.\n${G.turnLog.challenge.challenger.name}'s challenge fails!`
            );
          } else {
            setMsg(
              `${G.turnLog.challenge.challenged.name} reveals ${
                G.turnLog.challenge.revealedCard.name
              }.\n${
                G.turnLog.challenge.challenger.id === playerID
                  ? "your"
                  : `${G.turnLog.challenge.challenger.name}'s`
              } challenge fails!`
            );
          }
          setMsgLoading(false);
          if (
            ctx.activePlayers.hasOwnProperty(G.turnLog.challenge.challenged.id)
          ) {
            timer = setTimeout(() => {    // timer to allow players time to read announcements, but also advance the game "automatically" when necessary
              if (G.turnLog.challenge.challenged.id === playerID) {
                if (
                  G.turnLog.action !== "exchange" &&
                  G.turnLog.action !== "assassinate" &&
                  Object.keys(G.turnLog.blockedBy).length === 0
                ) {
                  moves.executeAction();
                }
                moves.continueTurn();
              }
            }, 3000);
          }
        }
      }
    }

    // on block
    else if (Object.keys(G.turnLog.blockedBy).length !== 0) {
      const blocksWith =
        G.turnLog.blockedBy.hasOwnProperty("character") &&
        G.turnLog.blockedBy.character !== "";
      if (
        G.turnLog.action === "steal" &&
        G.turnLog.blockedBy.character === ""
      ) {
        if (playerID === G.turnLog.blockedBy.id) {
          setMsg("choose a character to block with.");
          setMsgLoading(false);
        }
      } else if (!isYourTurn) {
        let blockedMsg =
          G.turnLog.blockedBy.id === playerID
            ? `you block`
            : `${G.turnLog.blockedBy.name} blocks`;
        if (blocksWith) {
          blockedMsg += ` with ${G.turnLog.blockedBy.character}`;
        }
        blockedMsg += "!";
        setMsg(
          `${blockedMsg}\nwaiting for ${
            blocksWith ? "a" : `${name}'s`
          } response`
        );
        setMsgLoading(true);
      } else {
        setMsg(
          `${G.turnLog.blockedBy.name} blocks your ${
            G.turnLog.action === "assassinate"
              ? "assassination"
              : G.turnLog.action
          }${blocksWith ? ` with ${G.turnLog.blockedBy.character}` : ""}.`
        );
        setMsgLoading(false);
      }
    }

    // targetable actions i.e. coup, assassinate, steal
    else if (playerTargetedActions.includes(G.turnLog.action)) {
      let action =
        G.turnLog.action === "steal" ? "steal from" : G.turnLog.action;
      if (!isYourTurn) {
        if (Object.keys(G.turnLog.target).length === 0) {
          setMsg(`${name} is choosing someone to ${action}`);
          setMsgLoading(true);
        } else {
          if (G.turnLog.action === "coup") {
            setMsg(
              `${name} initiates a coup against ${
                G.turnLog.target.id === playerID ? "you" : G.turnLog.target.name
              }`
            );
            setMsgLoading(true);
          } else {
            if (G.turnLog.target.id === playerID) {
              setMsg(`${name} chooses to ${action} you.`);
              setMsgLoading(false);
            } else {
              action =
                G.turnLog.action === "steal" ? "steals from" : action + "s";
              setMsg(
                `${name} ${action} ${G.turnLog.target.name}.\nwaiting for a response`
              );
              setMsgLoading(true);
            }
          }
        }
      } else if (Object.keys(G.turnLog.target).length === 0) {
        setMsg(`choose a player to ${action}.`);
        setMsgLoading(false);
      } else if (G.turnLog.action === "coup") {
        setMsg("select a character to coup.");
        setMsgLoading(false);
      } else {
        setMsg(`waiting for ${G.turnLog.target.name} to respond`);
        setMsgLoading(true);
      }
    }

    // any blockable or challengable action (trying to generalize when I can)
    else if (ctx.activePlayers[ctx.currentPlayer] !== "action") {
      if (!isYourTurn) {
        setMsg(`${name} attempts to ${G.turnLog.action}.`);
        setMsgLoading(false);
      } else {
        setMsg(`waiting for others to respond`);
      }
    }

    if (timer) {
      return () => clearTimeout(timer);
    }

    return () => clearTimeout(timer);
  }, [
    G.turnLog,
    ctx.activePlayers,
    ctx.currentPlayer,
    moves,
    hand,
    isYourTurn,
    name,
    playerID,
  ]);

  // on game over
  useEffect(() => {
    if (G.winner.id !== "-1") {
      setMsg(
        `Game over!\n${name} ${
          G.winner.id === playerID ? "are" : "is"
        } the winner.`
      );
      setMsgLoading(false);
    }
  }, [G.winner, name, playerID]);

  return (
    <div
      className={classNames("announcement-area", {
        "announcement-area-offset": msgLoading,
      })}
    >
      <div
        key={msg}
        className={classNames("turn-message", { "msg-loading": msgLoading })}
      >
        {msg}
        <span style={{ marginLeft: "0.01vw" }}></span>
      </div>
      <ChoosingPanel {...props} />
    </div>
  );
};

export default AnnouncementArea;
