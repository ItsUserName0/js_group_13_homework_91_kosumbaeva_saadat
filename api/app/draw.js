const {nanoid} = require("nanoid");
const {PREV_CIRCLES, SEND_CIRCLE, NEW_CIRCLE} = require("../constants");

const activeConnections = {};
const savedCoordinates = [];

module.exports = (ws, req) => {
  const id = nanoid();
  console.log(`Client connected id = ${id}`);
  activeConnections[id] = ws;

  ws.send(JSON.stringify({
    type: PREV_CIRCLES, coordinates: savedCoordinates,
  }));

  ws.on('message', msg => {
    const decodedMessage = JSON.parse(msg);
    switch (decodedMessage.type) {
      case SEND_CIRCLE:
        Object.keys(activeConnections).forEach(id => {
          const conn = activeConnections[id];
          savedCoordinates.push(decodedMessage.coordinates);
          conn.send(JSON.stringify({
            type: NEW_CIRCLE, circleCoordinates: decodedMessage.coordinates,
          }));
        });
        break;
      default:
        console.log(`Unknown type: ${decodedMessage.type}`);
    }
  })
};

