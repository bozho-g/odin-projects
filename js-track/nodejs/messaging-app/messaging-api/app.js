const express = require('express');
const { createServer } = require('http');
const app = express();
const server = createServer(app);
const cookieParser = require('cookie-parser');
require('dotenv').config();

require('./middleware/passport');
const passport = require('passport');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);

const cors = require('cors');
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
    process.env.PUBLIC_URL,
    'http://localhost:5173',
].filter(Boolean);

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin) {
            return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        console.warn('Blocked CORS origin:', origin);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
};

app.set('trust proxy', 1);

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

const sessionMiddleware = session({
    store: new pgSession({
        conString: process.env.DATABASE_URL
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 30 * 24 * 60 * 60 * 1000
    }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(sessionMiddleware);

app.use(passport.initialize());
app.use(passport.session());

const { initSocket } = require('./util/socket');
initSocket(server, { corsOrigins: allowedOrigins, sessionMiddleware, passport });

const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chats');
const friendRoutes = require('./routes/friends');

app.use('/friends', friendRoutes);
app.use('/chats', chatRoutes);
app.use('/auth', authRoutes);

app.use((req, res) => {
    res.status(404).json({ message: 'Not Found' });
});

app.use((err, req, res, next) => {
    const status = err.status || err.statusCode || 500;
    let payload;

    if (err.message) {
        err.message.includes('prisma') ? payload = { message: 'Database error' } : payload = { message: err.message };
    } else {
        payload = { message: 'Internal Server Error' };
    }

    if (err.details) payload.details = err.details;
    if (process.env.NODE_ENV === 'development' && err.stack) {
        console.error(err);
    }

    res.status(status).json(payload);
});

server.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});