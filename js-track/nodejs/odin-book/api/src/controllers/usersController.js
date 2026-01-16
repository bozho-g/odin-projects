const passport = require('passport');
const prisma = require('../config/prismaClient');
const bcrypt = require('bcryptjs');
const cloudinaryController = require('./cloudinaryController');
const { attachFollowStatus } = require('../utils/followStatus');

function sanitizeUser(user) {
    if (!user) {
        return null;
    }

    const { id, username, pfpUrl, pfpPublicId, createdAt } = user;
    return { id, username, pfpUrl, pfpPublicId, createdAt };
}

const login = async (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;

    const errors = [];
    if (!username || username.length < 3) {
        errors.push('Username must be at least 3 characters long');
    }

    if (!password || password.length < 6) {
        errors.push('Password must be at least 6 characters long');
    }

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }

        if (!user) {
            return res.status(401).json({ errors: [info.message || 'Authentication failed'] });
        }

        req.logIn(user, (err) => {
            if (err) return next(err);
            const safe = sanitizeUser(req.user || user);
            return res.json(safe);
        });
    })(req, res, next);
};

const register = async (req, res, next) => {
    const { username, password, confirmPassword } = req.body;

    const errors = [];
    if (!username || username.length < 3) {
        errors.push('Username must be at least 3 characters long');
    }

    if (!password || password.length < 6) {
        errors.push('Password must be at least 6 characters long');
    }

    if (password !== confirmPassword) {
        errors.push('Passwords do not match');
    }

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    const existing = await prisma.user.findUnique({
        where: {
            username
        }
    });

    if (existing) {
        return res.status(409).json({ errors: ['Username already taken'] });
    }

    const passHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
        data: {
            username,
            password: passHash,
        },
    });

    const safeUser = sanitizeUser(newUser);
    req.logIn(safeUser, (err) => {
        if (err) return next(err);
        return res.status(201).json(safeUser);
    });
};

const logout = async (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.json({ message: 'Logged out successfully' });
    });
};

const getCurrentUser = async (req, res) => {
    const safe = sanitizeUser(req.user);
    return res.json(safe);
};

const updateProfile = async (req, res) => {
    const { username, pfpUrl, pfpPublicId } = req.body;
    const userId = req.user.id;

    const errors = [];
    if (username !== undefined && (!username || username.length < 3)) {
        errors.push('Username must be at least 3 characters long');
    }

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    const existing = await prisma.user.findUnique({ where: { id: userId } });
    if (!existing) {
        return res.status(404).json({ errors: ['User not found'] });
    }

    if (existing.username === 'guest' && username !== undefined && username !== 'guest') {
        return res.status(403).json({ errors: ['Guest account username cannot be changed'] });
    }

    if (username !== undefined) {
        const usernameTaken = await prisma.user.findUnique({ where: { username } });
        if (usernameTaken && usernameTaken.id !== userId) {
            return res.status(409).json({ errors: ['Username already taken'] });
        }
    }

    if (pfpPublicId !== existing.pfpPublicId && existing.pfpPublicId) {
        await cloudinaryController.deletePicture(existing.pfpPublicId);
    }

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
            username,
            pfpUrl,
            pfpPublicId,
        }
    });

    return res.json(sanitizeUser(updatedUser));
};

const getUserByUsername = async (req, res) => {
    const username = req.params.username;
    const user = await findUser({ username });

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const requestingUserId = req.user?.id;
    const usersWithStatus = await attachFollowStatus(requestingUserId, [user]);

    return res.json(usersWithStatus[0]);
};

const getUserById = async (req, res) => {
    const userId = req.params.userId;
    const user = await findUser({ userId });

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const requestingUserId = req.user?.id;
    const usersWithStatus = await attachFollowStatus(requestingUserId, [user]);

    return res.json(usersWithStatus[0]);
};

const getUsers = async (req, res) => {
    const requestingUserId = req.user?.id;

    const users = await prisma.user.findMany({
        select: {
            id: true,
            username: true,
            pfpUrl: true,
            createdAt: true,
        },
        where: {
            id: { not: requestingUserId }
        }
    });

    const usersWithStatus = await attachFollowStatus(requestingUserId, users);

    res.json(usersWithStatus);
};

const findUser = async (identifier) =>
    await prisma.user.findUnique({
        where: identifier,
        select: {
            id: true,
            username: true,
            pfpUrl: true,
            createdAt: true,
            _count: {
                select: {
                    followers: { where: { status: 'ACCEPTED' } },
                    following: { where: { status: 'ACCEPTED' } },
                }
            },
            posts: {
                orderBy: { createdAt: 'desc' },
                include: {
                    author: {
                        select: { id: true, username: true, pfpUrl: true }
                    },
                    _count: { select: { likes: true, comments: true } }
                }
            }
        }
    });


module.exports = { login, register, logout, getCurrentUser, updateProfile, getUserByUsername, getUserById, getUsers };