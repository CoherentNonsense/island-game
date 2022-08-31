const uWS = require("uWebSockets.js");
const fs = require("fs");

let games = [];

function broadcast(ws, gameId, message, isBinary) {
  for (let i = 0; i < games[gameId].length; ++i) {
    if (ws !== games[gameId][i]) {
      games[gameId][i].send(message, isBinary);
    }
  }
}

function isHostingGame(ws) {
  for (let i = 0; i < games.length; ++i) {
    if (games[i][0] === ws) {
      return true;
    }
  }

  return false;
}


uWS.App().ws("/*", {
  idleTimeout: 32,
  maxBackpressure: 1024,
  maxPayloadLength: 512,

  open: (ws) => {
    console.log("A WebSocket connected!");
  },
  message: (ws, message, isBinary) => {
    /* Ok is false if backpressure was built up, wait for drain */
    const view = new Int32Array(message);
    const packetType = view[0];
    console.log(view[0])
    switch (packetType) {
      case 0: { // Host Game
        if (isHostingGame(ws)) return;
        const gameId = games.length;
        games[gameId] = [ws];
        const packet = new Int32Array([100, gameId]);
        ws.send(packet, isBinary);
        break;
      }
      case 1: { // Join Game
        const gameId = view[1];
        if (games[gameId] !== undefined && games[gameId].findIndex(socket => socket === ws) === -1) {
          games[gameId].push(ws);
          games[gameId][0].send(message, isBinary);
        }
        break;
      }
      default:
        break;
    }

    console.log(games);
  },
  drain: (ws) => {
    console.log("WebSocket backpressure: " + ws.getBufferedAmount());
  },
  close: (ws, code, message) => {
    console.log("WebSocket closed");
    games = games.filter((game) => {
      if (ws === game[0]) {
        console.log("Ending Game");
      }
      return ws !== game[0];
    });
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
})