const bcrypt = require('bcrypt');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const hashPassword = async (plainPassword) => {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    return hashedPassword;
};

const generateAccessToken = (user) => {
    return jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );
};

const generateRefreshToken = () => {
    return crypto.randomBytes(64).toString('hex');
};

const hashRefreshToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
};

const comparePassword = async (plainPassword, hashedPassword) => {
    const match = await bcrypt.compare(plainPassword, hashedPassword);
    return match;
};

function requireAuth(req, res, next) {
    const responseObj = {
        statusCode: 401,
        errorMsg: '',
        data: {}
    };

    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) {
            return next(err);
        }

        if (!user) {
            responseObj.errorMsg = 'Unauthorized access';
            responseObj.data = info.message;
            return res.status(401).json(responseObj);
        }

        req.user = user;
        next();
    })(req, res, next);
}

function optionalAuth(req, res, next) {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) return next(err);
        if (user) req.user = user;
        return next();
    })(req, res, next);
}

function requireAuthor(req, res, next) {
    if (req.user && req.user.role === 'AUTHOR') {
        return next();
    } else {
        res.status(403).send('Access denied. Author role required.');
    }
}

module.exports = {
    hashPassword,
    comparePassword,
    requireAuth,
    requireAuthor,
    optionalAuth,
    generateAccessToken,
    generateRefreshToken,
    hashRefreshToken
};