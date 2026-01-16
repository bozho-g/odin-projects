require('dotenv').config();
const { createServer } = require('http');
const app = require('./app');
const errorHandler = require('./middleware/errorHandler');

const server = createServer(app);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});