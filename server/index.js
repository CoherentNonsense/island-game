const uWS = require('uWebSockets.js');
const fs = require('fs');

uWS.App().ws('/*', {
  idleTimeout: 32,
  maxBackpressure: 1024,
  maxPayloadLength: 512,

  open: (ws) => {
    console.log('A WebSocket connected!');
  },
  message: (ws, message, isBinary) => {
    /* Ok is false if backpressure was built up, wait for drain */
    let ok = ws.send(message, isBinary);
  },
  drain: (ws) => {
    console.log('WebSocket backpressure: ' + ws.getBufferedAmount());
  },
  close: (ws, code, message) => {
    console.log('WebSocket closed');
  }
}).get('/*', (res, req) => {
  res.onAborted(() => {
    res.aborted = true;
  });

  let file;
  console.log(req.getUrl());
  if (req.getUrl() === '/') {
    file = 'index.html';
  } else if (!req.getUrl().includes('.')) {
    file = req.getUrl() + '.html'
  } else {
    file = req.getUrl();
  }

  if (file.endsWith('.js')) {
    res.writeHeader('Content-Type', 'text/javascript');
  }

  fs.readFile(`public/${file}`, (err, data) => {
    if (err || res.aborted) return res.writeStatus('404 Not Found').end("404 Not Found");
    res.writeStatus('200 OK').writeHeader("EXAMPLE", 'Yes').end(data);
  });
}).listen(8080, (token) => {
  console.log('Starting server', token);
})