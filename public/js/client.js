import Packet from "./packet.js";

export default class Client {
  constructor() {
    this.isHost = false;
    this.players = [];
    this.incomingMessages = [];
  }

  // Connects to the websocket server
  start(url) {
    if (this.socket && this.socket.readyState !== this.socket.CLOSED) return;
    this.incomingMessages = [];
    this.socket = new WebSocket(url);
    this.socket.binaryType = "arraybuffer";
    this.socket.onmessage = (message) => {this._handleMessage(message)};
    this.socket.onerror = () => {this._reconnect};
    this.socket.onclose = () => {this._reconnect};
    
    return new Promise((resolve) => {
      this.socket.onopen = () => {resolve()};
    });
  }

  hostGame(username) {
    this.isHost = true;
  }

  joinGame(username) {
    this.isHost = false;
  }

  pollIncomingPackets(cb) {
    while (this.incomingMessages.length !== 0) {
      cb(this.incomingMessages.shift());
    }
  }

  closeGame() {
    if (!this.isHost) return;
  }

  sendPacket(packet) {
    this.socket.send(packet.data());
  }

  _handleMessage(message) {
    console.log("Received Message");
    const packet = new Packet(message.data);
    this.incomingMessages.push(packet);
  }

  _reconnect() {
    console.log("Attempting to reconnect to the server");
  }
}