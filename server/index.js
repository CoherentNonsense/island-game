const uWS = require("uWebSockets.js");
const fs = require("fs");

let games = {};
let nextId = 0;
let freeIds = [];

function broadcast(ws, message, isBinary = true) {
  if (!ws.gameId) return;

  for (let i = 0; i < games[ws.gameId].length; ++i) {
    if (ws !== games[ws.gameId][i]) {
      games[ws.gameId][i].send(message, isBinary);
    }
  }
}

function getString(message, offset) {
  const view = new Uint8Array(message);
  const length = view[offset];
  let string = "";
  for (let i = 0; i < length; ++i) {
    if (view[offset + 1 + i] === undefined) break;
    string += String.fromCharCode(view[offset + 1 + i]);
  }

  return string;
}

function leave(ws) {
  if (ws.gameId === undefined) return;

  // check if host
  if (games[ws.gameId][0] === ws) {
    const packet = new ArrayBuffer(4);
    const view = new Int32Array(packet);
    view[0] = 200;
    broadcast(ws, packet);
    const gameId = ws.gameId;
    games[gameId].forEach(socket => delete socket.gameId);
    delete games[gameId];
  } else {
    const packet = new ArrayBuffer(8);
    const view = new Int32Array(packet);
    view[0] = 202;
    view[1] = ws.id;
    broadcast(ws, packet);
    games[ws.gameId] = games[ws.gameId].filter(socket => socket !== ws);
    delete ws.gameId;
  }

}


uWS.App().ws("/*", {
  idleTimeout: 32,
  maxBackpressure: 1024,
  maxPayloadLength: 512,

  open: (ws) => {
    console.log("A WebSocket connected!");

    if (freeIds.length === 0) {
      ws.id = nextId++;
    } else {
      ws.id = freeIds.pop();
    }

    const packet = new ArrayBuffer(8);
    const view = new Int32Array(packet);
    view[0] = 203;
    view[1] = ws.id;
    ws.send(packet, true);
  },
  message: (ws, message, isBinary) => {
    /* Ok is false if backpressure was built up, wait for drain */
    const view = new Int32Array(message);
    const packetType = view[0];
    
    switch (packetType) {

      // Host Game
      case 0: {
        if (ws.gameId !== undefined) return;

        const gameId = getString(message, 4);
        
        // Check if gameId already exists
        if (games[gameId] !== undefined) {
          const packet = new ArrayBuffer(4);
          const view = new Int32Array(packet);
          view[0] = 204;
          ws.send(packet, isBinary);
          return;
        }

        games[gameId] = [ws];
        ws.gameId = gameId;
        break;
      }

      // Join Game
      case 1: {
        if (ws.gameId !== undefined) return;

        const gameId = getString(message, 4);
        if (games[gameId] === undefined) {
          const packet = new ArrayBuffer(4);
          const view = new Int32Array(packet);
          view[0] = 201;
          ws.send(packet, isBinary);
          break;
        }

        games[gameId].push(ws);
        games[gameId][0].send(message, isBinary);
        ws.gameId = gameId;
        break;
      }

      // Leave Game
      case 2:
        leave(ws);
        break;

      default:
        broadcast(ws, message, isBinary);
        break;
    }

    console.log(games);
  },
  drain: (ws) => {
    console.log("WebSocket backpressure: " + ws.getBufferedAmount());
  },
  close: (ws, _code, _message) => {
    console.log("WebSocket closed");
    freeIds.push(ws.id);
    leave(ws);
    console.log(games);
  }
}).get("/*", (res, req) => {
  res.onAborted(() => {
    res.aborted = true;
  });

  let file;
  if (req.getUrl() === "/") {
    file = "index.html";
  } else if (!req.getUrl().includes(".")) {
    file = req.getUrl() + ".html"
  } else {
    file = req.getUrl();
  }

  if (file.endsWith(".js")) {
    res.writeHeader("Content-Type", "text/javascript");
  }

  fs.readFile(`public/${file}`, (err, data) => {
    if (err || res.aborted) return res.writeStatus("404 Not Found").end("404 Not Found");
    res.writeStatus("200 OK").writeHeader("EXAMPLE", "Yes").end(data);
  });
}).listen(8080, (token) => {
  console.log("Starting server", token);
});