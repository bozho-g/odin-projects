const router = require('express').Router();
const {
    hashPassword,
    comparePassword,
    generateAccessToken,
    generateRefreshToken,
    hashRefreshToken
} = require('../util/authUtil');
const prisma = require('../util/prismaClient');
const { body, validationResult } = require('express-validator');

router.post('/register',
    body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters long').escape(),
    body('password').trim().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long').escape(),
    body('confirmPassword').trim().custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passwords do not match');
        }
        return true;
    }),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, password } = req.body;
        const existingUser = await prisma.user.findUnique({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already taken' });
        }

        const hashedPassword = await hashPassword(password);

        const newUser = await prisma.user.create({
            data: {
                username,
                password: hashedPassword
            }
        });

        res.status(201).json({
            message: 'User registered successfully', user: {
                id: newUser.id, username: newUser.username
            }
        });
    });

router.post('/login',
    body('username').trim().notEmpty().withMessage('Username required'),
    body('password').trim().notEmpty().withMessage('Password required'),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, password } = req.body;
        const user = await prisma.user.findUnique({ where: { username } });

        if (!user) {
            return res.status(400).json({ message: 'Invalid username' });
        }

        const match = await comparePassword(password, user.password);

        if (!match) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken();
        const hashedRefreshToken = hashRefreshToken(refreshToken);

        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken: hashedRefreshToken }
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({
            accessToken,
            user: { id: user.id, username: user.username, role: user.role },
            message: 'Login successful'
        });
    });

router.post('/refresh', async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({ message: 'Refresh token required' });
        }

        const hashedToken = hashRefreshToken(refreshToken);
        const user = await prisma.user.findFirst({
            where: { refreshToken: hashedToken }
        });

        if (!user) {
            return res.status(403).json({ message: 'Invalid refresh token' });
        }

        const accessToken = generateAccessToken(user);

        res.json({
            accessToken,
            user: { id: user.id, username: user.username, role: user.role }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/logout', async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (refreshToken) {
            const hashedToken = hashRefreshToken(refreshToken);

            await prisma.user.updateMany({
                where: { refreshToken: hashedToken },
                data: { refreshToken: null }
            });
        }

        res.clearCookie('refreshToken');
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;