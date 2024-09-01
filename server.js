'use strict';

const session = require('express-session');
const express = require('express');
const http = require('http');
const uuid = require('uuid');
const { WebSocketServer, WebSocket } = require('ws');

function onSocketError(err) {
  console.error(err);
}

const port = 11011;
const app = express();
const map = new Map();

//
// We need the same instance of the session parser in express and
// WebSocket server.
//
const sessionParser = session({
  saveUninitialized: false,
  secret: '$eCuRiTy',
  resave: false
});

//
// Serve static files from the 'public' folder.
//
app.use(express.static('client'));
app.use(sessionParser);

//
// Create an HTTP server.
//
const server = http.createServer(app);

//
// Create a WebSocket server completely detached from the HTTP server.
//
const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', function (request, socket, head) {
  socket.on('error', onSocketError);

  console.log('Parsing session from request...');

  sessionParser(request, {}, () => {


  console.log('here');
    if (!request.sessionID) {
        console.log('request', request);
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }

    console.log('Session is parsed!');

    socket.removeListener('error', onSocketError);

    wss.handleUpgrade(request, socket, head, function (ws) {
      wss.emit('connection', ws, request);
    });
  });
});

wss.on('connection', function (ws, request) {
  const userId = request.sessionID;

  map.set(userId, ws);

  ws.on('error', console.error);
  ws.on("message", (msg) => {        // what to do on message event
    //console.log(`Received message ${msg} from user ${userId}`);
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {     // check if client is ready
        client.send(msg.toString());
        }
    })
  })

  ws.on('close', function () {
    map.delete(userId);
  });
});

//
// Start the server.
//
server.listen(port, function () {
  console.log(`WS DEMO is runnning at http://localhost:${port}`);
});
