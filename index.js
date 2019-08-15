const app = require('./app/app');

const port = 9000;

app.listen(port, '0.0.0.0', () => {
  console.log(`We live on ${port}`);
});
