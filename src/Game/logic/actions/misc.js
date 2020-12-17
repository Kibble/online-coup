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

/*----------------- TODO: early leave -----------------*/
const endTurn = (G, ctx) => {
  ctx.events.endTurn();
};

export { message, changeNames, endTurn };
