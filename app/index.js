
const userRouter = require('./users/router');
const cardRouter = require('./cards/router');

module.exports = (app) => {

  app.use('/api/users', userRouter);
  app.use('/api/cards', cardRouter);
};
