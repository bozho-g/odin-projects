const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);

const sessionMiddleware = session({
    store: new pgSession({
        conString: process.env.DATABASE_URL
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000
    }
});

const configureSession = (app) => {
    app.use(sessionMiddleware);
};

module.exports = { configureSession, sessionMiddleware };