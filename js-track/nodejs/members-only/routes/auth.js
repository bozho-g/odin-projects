const { Router } = require('express');
const router = Router();
const postsController = require('../controllers/postsController');
const asyncHandler = require('express-async-handler');

const passport = require("passport");
const LocalStrategy = require('passport-local').Strategy;
const { query } = require('../db/pool');
const { comparePassword, hashPassword } = require('../authUtil');
const { body, validationResult } = require('express-validator');


passport.use(
    new LocalStrategy(async (username, password, done) => {
        try {
            const { rows } = await query("SELECT * FROM users WHERE username = $1", [username]);
            const user = rows[0];

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
        const { rows } = await query("SELECT * FROM users WHERE id = $1", [id]);
        const user = rows[0];

        done(null, user);
    } catch (err) {
        done(err);
    }
});

router.get('/login', (req, res) => {
    const error = req.session.messages ? req.session.messages[req.session.messages.length - 1] : null;
    req.session.messages = [];
    res.render('auth/login', { error });
});

router.post('/login',
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureMessage: true,
    })
);

router.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

router.get('/signup', (req, res) => {
    res.render('auth/signup', { errors: null, form: {} });
});

router.post('/signup',
    body('username').trim().isLength({ min: 2 }).withMessage('Username must be at least 2 characters long.').escape(),
    body('firstName').trim().isLength({ min: 2 }).withMessage('First name is required.').escape(),
    body('lastName').trim().isLength({ min: 2 }).withMessage('Last name is required.').escape(),
    body('password').trim().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.').escape(),
    body('confirmPassword').trim().isLength({ min: 6 }).withMessage('Confirm Password must be at least 6 characters long.').escape(),
    async (req, res) => {
        const { firstName, lastName, username, password, confirmPassword } = req.body;

        const result = validationResult(req);

        if (!result.isEmpty()) {
            return res.render('auth/signup', { errors: result.array(), form: req.body });
        }

        if (password !== confirmPassword) {
            return res.render('auth/signup', { errors: [{ "msg": "Passwords do not match" }], form: req.body });
        }

        const { rows } = await query("SELECT * FROM users WHERE username = $1", [username]);
        const user = rows[0];

        if (user) {
            return res.render('auth/signup', { errors: [{ "msg": "User with that username already exists" }], form: req.body });
        }

        const hashedPassword = await hashPassword(password);
        await query("INSERT INTO users (first_name, last_name, username, password) VALUES ($1, $2, $3, $4)",
            [firstName, lastName, username, hashedPassword]);

        res.redirect('/login');
    });

router.get('/join', ensureAuthenticated, (req, res) => {
    res.render('join');
});

router.post('/join', ensureAuthenticated, async (req, res) => {
    const { passcode } = req.body;
    const SECRET_PASSCODE = 'holmium';

    if (passcode.toLowerCase() === SECRET_PASSCODE) {
        req.user.is_member = true;
        await query("UPDATE users SET is_member = $1 WHERE id = $2", [true, req.user.id]);
        res.redirect('/');
    } else {
        res.render('join', { error: "Invalid passcode" });
    }
});

router.get('/', asyncHandler(postsController.getPosts));
router.get('/create', ensureAuthenticated, ensureMember, asyncHandler(postsController.getCreatePost));
router.post('/create',
    body('title').trim().isLength({ min: 1 }).withMessage('Title is required.').escape(),
    body('content').trim().isLength({ min: 1 }).withMessage('Content is required.').escape(),
    ensureAuthenticated, ensureMember, asyncHandler(postsController.postCreatePost));

router.get('/delete/:id', ensureAuthenticated, ensureAdmin, async (req, res) => {
    const postId = req.params.id;

    await query("DELETE FROM posts WHERE id = $1", [postId]);
    res.redirect('/');
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/login');
    }
}

function ensureMember(req, res, next) {
    if (req.user.is_member) {
        return next();
    } else {
        res.redirect('/join');
    }
}

function ensureAdmin(req, res, next) {
    if (req.user.is_admin) {
        return next();
    } else {
        res.redirect('/login');
    }
}

module.exports = router;