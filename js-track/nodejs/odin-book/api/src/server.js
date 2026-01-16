require('dotenv').config();
const { createServer } = require('http');
const app = require('./app');
const errorHandler = require('./middleware/errorHandler');

const server = createServer(app);

const { allowedOrigins } = require('./config/cors');
const { sessionMiddleware } = require('./config/session');
const passport = require('./config/passport');

// Initialize Socket.io (if utils/socket exists, otherwise comment out)
// const { initSocket } = require('./utils/socket');
// initSocket(server, { 
//     corsOrigins: allowedOrigins, 
//     sessionMiddleware, 
//     passport 
// });

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});