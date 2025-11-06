const express = require('express');
const path = require('path');
require('dotenv').config();

const expressSession = require('express-session');
const pgSession = require('connect-pg-simple')(expressSession);
const passport = require('passport');
const { pool } = require('./db/pool');

const authRouter = require('./routes/auth');

const app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(expressSession({
  store: new pgSession({
    pool: pool,
  }),
  secret: process.env.COOKIE_SECRET,
  saveUninitialized: false,
  resave: false,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }
}));
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

app.use('/', authRouter);

app.use(function (req, res, next) {
  res.status(404).render('error', { message: "Sorry, page not found" });
});

app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', { message: err.message });
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});