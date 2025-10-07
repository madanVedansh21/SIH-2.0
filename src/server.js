require('dotenv').config();
const app = require('./app');
const config = require('./config');

const PORT = process.env.PORT || config.port || 4000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
