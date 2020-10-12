// to display to the chat once a turn ends
export const getTurnMsg = (turnLog) => {
  let success = turnLog.successful ? "successfully " : "unsuccessfully ";
  let target = "";
  if (turnLog.action === "income") {
    success = "";
  }

  if (turnLog.action === "coup") {
    target = ` ${turnLog.target.name} for ${turnLog.target.character}`;
  } else if (turnLog.action === "assassinate") {
    target = ` ${turnLog.target.name}`;
  } else if (turnLog.action === "steal") {
    target = ` from ${turnLog.target.name}`;
  }
  
  // addendum describes if there were counteractions to the player's action
  let addendum = "";
  if (
    turnLog.challenge &&
    Object.keys(turnLog.challenge).length !== 0 &&
    turnLog.blockedBy &&
    Object.keys(turnLog.blockedBy).length !== 0
  ) {
    addendum = " (blocked, challenged)";
  } else if (turnLog.challenge && Object.keys(turnLog.challenge).length !== 0) {
    addendum = " (challenged)";
  } else if (turnLog.blockedBy && Object.keys(turnLog.blockedBy).length !== 0) {
    addendum = " (blocked)";
  }

  const turnMsg = `${turnLog.player.name} ${success}${turnLog.action}${
    turnLog.action === "tax" ? "es" : "s"
  }${target}${addendum}.`;

  return turnMsg;
};
