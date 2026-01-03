const prisma = require('../util/prismaClient');

async function requireAuth(req, res, next) {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        await prisma.users.update({
            where: { id: req.user.id },
            data: { last_seen: new Date() },
        });
    } catch (err) {
        console.error('Failed to update last_seen:', err);
    }

    return next();
}

module.exports = requireAuth;