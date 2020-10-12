// from boardgame.io guide for Deployment to Heroku of Frontend and Backend
import { Server } from "boardgame.io/server";
import { Coup } from "./src/Game/Game";
import path from "path";
import serve from "koa-static";
import { DEFAULT_PORT } from "./src/config";

const server = Server({ games: [Coup] });
const PORT = process.env.PORT || DEFAULT_PORT;    // run on single port that handles API requests and serves the pages (running on free dyno)

// build path relative to the server.js file
const frontEndAppBuildPath = path.resolve(__dirname, "./build");
server.app.use(serve(frontEndAppBuildPath));

server.run(PORT, () => {
  server.app.use(
    async (ctx, next) => await serve(frontEndAppBuildPath)(Object.assign(ctx, { path: "index.html" }), next)
  );
});
