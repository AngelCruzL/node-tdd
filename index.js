const app = require('./src/app');
const sequelize = require('./src/config/database');
const { PORT, NODE_ENV } = require('./src/config/constants');

sequelize.sync({ force: true });

const port = PORT ?? 3000;

app.listen(port, () =>
  console.log(`Server listening on port ${port} in ${NODE_ENV} mode`),
);
