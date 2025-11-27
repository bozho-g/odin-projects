const express = require('express');
const app = express();
require('dotenv').config();
require('./middleware/passport');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const HttpError = require('./util/httpError');
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
    process.env.ADMIN_URL,
    process.env.PUBLIC_URL,
    'http://localhost:5173',
    'http://localhost:5174'
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));

app.options('*', cors());

const postRoutes = require('./routes/posts');
const authRoutes = require('./routes/auth');
const passport = require('passport');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

app.use('/api/posts', postRoutes);
app.use('/api', authRoutes);

app.use((req, res, next) => {
    next(HttpError.notFound('Sorry, not found!'));
});

app.use((err, req, res, next) => {
    const status = err.status || err.statusCode || 500;
    const payload = {
        message: err.message || 'Internal Server Error'
    };

    if (err.details) payload.details = err.details;
    if (process.env.NODE_ENV === 'development' && err.stack) {
        console.error(err);
    }

    res.status(status).json(payload);
});

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});