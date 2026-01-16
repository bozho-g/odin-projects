const cors = require('cors');

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

const configureCors = (app) => {
    app.use(cors(corsOptions));
    app.options(/.*/, cors(corsOptions));
};

module.exports = { configureCors, allowedOrigins };