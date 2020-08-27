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
  const turnMsg = `${turnLog.player.name} ${success}${turnLog.action}${
    turnLog.action === "tax" ? "es" : "s"
  }${target}.`;

  return turnMsg;
};
