const express = require('express');
const cors = require('cors');
const draw = require('./app/draw');
const app = express();

require('express-ws')(app);

const port = 8000;

app.use(cors());

app.ws('/draw', (ws, req) => {
  draw(ws, req);
});

app.listen(port, () => {
  console.log(`Server started on ${port} port!`);
});