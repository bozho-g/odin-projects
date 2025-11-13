const { Router } = require('express');
const router = Router();

const passport = require("passport");
const LocalStrategy = require('passport-local').Strategy;
const { comparePassword, hashPassword } = require('../authUtil');
const { body, validationResult } = require('express-validator');

const prisma = require('../prismaClient');

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: { username }
      });

      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }

      const match = await comparePassword(password, user.password);

      if (!match) {
        return done(null, false, { message: "Incorrect password" });
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id }
    });

    done(null, user);
  } catch (err) {
    done(err);
  }
});

router.get('/login', function (req, res) {
  const error = req.session.messages ? req.session.messages[req.session.messages.length - 1] : null;
  req.session.messages = [];

  if (req.isAuthenticated()) {
    res.redirect(req.get('Referer') || '/');
    return;
  }

  res.render('auth/login', { error });
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureMessage: true
}));

router.get('/logout', function (req, res, next) {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});

router.get('/signup', function (req, res) {
  if (req.isAuthenticated()) {
    res.redirect(req.get('Referer') || '/');
    return;
  }

  res.render('auth/signup', { errors: null, form: {} });
});

router.post('/signup',
  body('username').trim().isLength({ min: 2 }).withMessage('Username must be at least 2 characters long.').escape(),
  body('password').trim().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.').escape(),
  body('confirmPassword').trim().isLength({ min: 6 }).withMessage('Confirm Password must be at least 6 characters long.').escape(),
  async (req, res) => {
    const { username, password, confirmPassword } = req.body;

    const result = validationResult(req);

    if (!result.isEmpty()) {
      return res.render('auth/signup', { errors: result.array(), form: req.body });
    }

    if (password !== confirmPassword) {
      return res.render('auth/signup', { errors: [{ "msg": "Passwords do not match" }], form: req.body });
    }

    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (user) {
      return res.render('auth/signup', { errors: [{ "msg": "User with that username already exists" }], form: req.body });
    }

    const hashedPassword = await hashPassword(password);
    await prisma.user.create({
      data: {
        username,
        password: hashedPassword
      }
    });

    res.redirect('/login');
  });

module.exports = router;
