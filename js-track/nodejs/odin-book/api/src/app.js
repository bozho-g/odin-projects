const express = require('express');
const { configureCors } = require('./config/cors');
const { configureMiddleware } = require('./config/middleware');
const { configureSession } = require('./config/session');
const { configureAuth } = require('./config/auth');
const { configureRoutes } = require('./config/routes');

const app = express();
app.set('trust proxy', 1);

configureCors(app);
configureMiddleware(app);
configureSession(app);
configureAuth(app);
configureRoutes(app);

module.exports = app;