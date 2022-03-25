const {nanoid} = require("nanoid");
const {PREV_CIRCLES, SEND_CIRCLE, NEW_CIRCLE, SEND_SQUARE, NEW_SQUARE, PREV_SQUARES} = require("../constants");

const activeConnections = {};
const circleSavedCoordinates = [];
const squareSavedCoordinates = [];

module.exports = (ws, req) => {
  const id = nanoid();
  console.log(`Client connected id = ${id}`);
  activeConnections[id] = ws;

  ws.send(JSON.stringify({
    type: PREV_CIRCLES, circleSavedCoordinates: circleSavedCoordinates,
  }));

  ws.send(JSON.stringify({
    type: PREV_SQUARES, squareSavedCoordinates: squareSavedCoordinates,
  }));

  ws.on('message', msg => {
    const decodedMessage = JSON.parse(msg);
    switch (decodedMessage.type) {
      case SEND_CIRCLE:
        Object.keys(activeConnections).forEach(id => {
          const conn = activeConnections[id];
          circleSavedCoordinates.push(decodedMessage.coordinates);
          conn.send(JSON.stringify({
            type: NEW_CIRCLE, coordinates: decodedMessage.coordinates,
          }));
        });
        break;
      case SEND_SQUARE:
        Object.keys(activeConnections).forEach(id => {
          const conn = activeConnections[id];
          squareSavedCoordinates.push(decodedMessage.coordinates);
          conn.send(JSON.stringify({
            type: NEW_SQUARE, coordinates: decodedMessage.coordinates,
          }));
        });
        break;
      default:
        console.log(`Unknown type: ${decodedMessage.type}`);
    }
  })
};

