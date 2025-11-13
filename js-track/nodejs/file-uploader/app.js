const express = require('express');
const path = require('path');
require('dotenv').config();

const expressSession = require('express-session');
const { PrismaSessionStore } = require('@quixo3/prisma-session-store');
const prisma = require('./prismaClient');
const passport = require('passport');

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const folderRouter = require('./routes/folders').router;
const fileRouter = require('./routes/files').router;
const publicRouter = require('./routes/public');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(expressSession({
  secret: process.env.COOKIE_SECRET,
  saveUninitialized: false,
  resave: false,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 },
  store: new PrismaSessionStore(
    prisma,
    {
      checkPeriod: 2 * 60 * 1000,
      dbRecordIdIsSessionId: true,
    }
  ),
}));
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

app.use('/', authRouter);
app.use('/', indexRouter);
app.use('/folders', folderRouter);
app.use('/files', fileRouter);
app.use('/public', publicRouter);

app.use(function (req, res, next) {
  res.status(404).render('error', { message: "Sorry, page not found" });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);

  const isDevelopment = process.env.NODE_ENV === 'development';

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  if (!isDevelopment) {
    if (err.code === 'P1001' || err.message?.includes('database server')) {
      message = 'Database connection error. Please try again later.';
    } else if (err.code?.startsWith('P')) {
      message = 'A database error occurred. Please try again.';
    } else if (err.message?.includes('supabase')) {
      message = 'Storage service error. Please try again later.';
    }
  }

  res.status(statusCode).render('error', {
    title: 'Error',
    error: {
      status: statusCode,
      message: message,
      stack: isDevelopment ? err.stack : undefined
    }
  });
});

app.use(function (err, req, res, next) {
  const status = err.status || 500;

  const apiEndpoints = ['/upload-file', '/upload-folder', '/create-folder', '/delete', 'share', '/share'];
  const isApiRequest = apiEndpoints.some(endpoint => req.path.includes(endpoint));

  if (isApiRequest) {
    return res.status(status).json({ message: err.message });
  }

  res.status(status);
  res.render('error', { message: err.message });
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});