const message = (G, ctx, id, content) => {
  G.chat.push({ id, content });
  // TODO: save chat and game state data into database... don't want to clutter poor webpage with chat if it gets flooded
  if (G.chat.length > 35) {
    G.chat.shift();
  }
};

const changeNames = (G, ctx, playerList) => {
  for (let i = 0; i < playerList.length; i++) {
    G.players[i].name = playerList[i].name;
  }
};

/*---- TODO: early leave ---- */
const endTurn = (G, ctx) => {
  ctx.events.endTurn();
};

const playAgain = (G, ctx, id) => {
  G.gameOver.playAgain.push(id);
};

const leave = (G, ctx, id) => {
  const index = G.gameOver.playAgain.indexOf(id);
  if (index > -1) {
    G.gameOver.playAgain.splice(index, 1);
  }
  G.gameOver.left.push(id);
};

const setNewRoom = (G, ctx, roomID) => {
  G.gameOver.newRoomID = roomID;
};

export { message, changeNames, endTurn, playAgain, leave, setNewRoom };
