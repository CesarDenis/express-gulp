const express = require('express');
const winston = require('winston');

const app = express();

app.get('/', (req, res) => {
  res.json({ message: 'It works!' });
});

app.listen(3000, () => {
  winston.info('Express: 3000');
});
