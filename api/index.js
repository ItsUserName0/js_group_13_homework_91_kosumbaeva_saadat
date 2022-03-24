const express = require('express');
const cors = require('cors');
const {nanoid} = require('nanoid');
const {PREV_CIRCLES, SEND_CIRCLE, NEW_CIRCLE} = require("./constants");
const app = express();

const port = 8000;

app.use(cors());

const activeConnections = {};
const savedCoordinates = [];

app.ws('/', (ws, req) => {
  const id = nanoid();
  console.log(`Client connected id = ${id}`);
  activeConnections[id] = ws;

  ws.send(JSON.stringify({
    type: PREV_CIRCLES,
    coordinates: savedCoordinates,
  }));

  ws.on('message', msg => {
    const decodedMessage = JSON.parse(msg);
    switch (decodedMessage.type) {
      case SEND_CIRCLE:
        Object.keys(activeConnections).forEach(id => {
          const conn = activeConnections[id];
          savedCoordinates.push(decodedMessage.coordinates);
          conn.send(JSON.stringify({
            type: NEW_CIRCLE,
            circleCoordinates: decodedMessage.coordinates,
          }));
        });
        break;
      default:
        console.log(`Unknown type: ${decodedMessage.type}`);
    }
  });

  ws.on('close', () => {
    console.log(`Client disconnected id = ${id}`);
    delete activeConnections[id];
  });
});


app.listen(port, () => {
  console.log(`Server started on ${port} port!`);
});