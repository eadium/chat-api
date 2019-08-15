const app = require('fastify')({
    // logger: {
    //   level: 'error',
    // },
  });
    
  const logger = require('morgan');
  
  app.use(logger('dev'));
  
  require('./routes/routes')(app);
  
  module.exports = app;
  