const winston = require('winston');

const app = require('./app');

app.listen(3000, () => {
  winston.info('Express: 3000');
});
