const app = require('./src/app');
const sequelize = require('./src/config/database');

sequelize.sync();
const port = 3000;

app.listen(port, () => console.log(`Server listening on port ${port}`));
