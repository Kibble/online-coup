import { GAME_NAME, DEFAULT_PORT, APP_PRODUCTION } from "./config";
import ky from "ky";

const { origin, protocol, hostname } = window.location;
const SERVER_URL = APP_PRODUCTION ? origin : `${protocol}//${hostname}:${DEFAULT_PORT}`;

export class LobbyAPI {
  constructor() {
    this.api = ky.create({
      prefixUrl: `${SERVER_URL}/games/${GAME_NAME}`,
    });
  }

  async createRoom(numPlayers) {
    try {
      const res = await this.api.post("create", { json: { numPlayers: numPlayers } }).json();
      return res.gameID;
    } catch (err) {
      console.log("failed to create room:", err);
    }
  }

  async joinRoom(roomID, id, name) {
    try {
      const res = await this.api.post(roomID + "/join", { json: { playerID: id, playerName: name } }).json();
      const { playerCredentials } = res;
      return playerCredentials;
    } catch (err) {
      console.log("failed to join room:", err);
    }
  }

  async leaveRoom(roomID, id, playerCredentials) {
    try {
      await this.api.post(roomID + "/leave", { json: { playerID: id, credentials: playerCredentials } }).json();
    } catch (err) {
      console.log("failed to leave room:", err);
    }
  }

  async getPlayers(roomID) {
    const res = await this.api.get(roomID).json();
    return res.players;
  }

  async getRooms() {
    const res = await this.api.get("").json();
    return res;
  }
}
