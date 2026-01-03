const router = require('express').Router();
const passport = require('passport');
const prisma = require('../util/prismaClient');
const requireAuth = require('../middleware/authGuard');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

router.post('/login', async (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;

    const errors = [];
    if (!username) {
        errors.push("Username is required.");
    }

    if (!password) {
        errors.push("Password is required.");
    }

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(400).json({ errors: [info.message || 'Login failed'] });
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            return res.json(user);
        });
    })(req, res, next);
});

router.post('/register', async (req, res, next) => {
    const username = req.body.username;
    const displayName = req.body.displayName;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    const errors = [];
    if (!/^[A-Za-z0-9_]{3,32}$/.test(username)) {
        errors.push("Username must be 3-32 characters (letters, numbers, underscores)");
    }

    if (displayName.length < 4 || displayName.length > 64) {
        errors.push("Display name must be between 4 and 64 characters");
    }

    if (password.length < 6) {
        errors.push("Password must be at least 6 characters");
    }

    if (confirmPassword !== "" && password !== confirmPassword) {
        errors.push("Passwords do not match");
    }

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    const existing = await prisma.users.findUnique({ where: { username } });
    if (existing) {
        return res.status(400).json({ message: "Username is already taken" });
    }

    const passHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.users.create({
        data: {
            username,
            display_name: displayName,
            password_hash: passHash
        }
    });

    req.logIn(newUser, (err) => {
        if (err) {
            return next(err);
        }

        return res.status(201).json({
            id: newUser.id,
            username: newUser.username,
            displayName: newUser.display_name,
            pfpUrl: newUser.pfp_url,
        });
    });
});

router.post('/logout', async (req, res) => {
    req.logout(() => {
        res.json({ message: 'ok' });
    });
});

router.get('/me', requireAuth, async (req, res) => {
    res.json(req.user);
});

router.patch('/profile', requireAuth, async (req, res, next) => {
    const displayName = req.body.displayName;
    const pfpUrl = req.body.pfpUrl;

    if (!displayName) {
        return res.status(400).json({ message: "Display name is required" });
    }

    if (displayName.length < 4 || displayName.length > 64) {
        return res.status(400).json({ message: "Display name must be between 4 and 64 characters" });
    }

    const updatedUser = await prisma.users.update({
        where: { id: req.user.id },
        data: {
            display_name: displayName,
            pfp_url: pfpUrl || null
        }
    });

    res.json({
        id: updatedUser.id,
        username: updatedUser.username,
        displayName: updatedUser.display_name,
        pfpUrl: updatedUser.pfp_url,
    });
});

router.post('/avatar-signed-url', requireAuth, async (req, res) => {
    const filename = req.body?.filename || '';
    const mime = req.body?.mime || '';

    if (!filename || typeof filename !== 'string' || typeof mime !== 'string' || !mime.startsWith('image/')) {
        return res.status(400).json({ message: 'Invalid file info' });
    }

    const supaUrl = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
    const bucket = process.env.SUPABASE_BUCKET || 'pfps';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supaUrl || !key) {
        return res.status(500).json({ message: 'Server configuration error' });
    }

    const allowedExts = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp']);
    const extRaw = filename.split('.').pop()?.toLowerCase() || 'jpg';
    const ext = allowedExts.has(extRaw) ? extRaw : 'jpg';

    const path = `${req.user.id}/${crypto.randomBytes(8).toString('hex')}.${ext}`;
    const signUrl = `${supaUrl}/storage/v1/object/upload/sign/${bucket}/${path}`;

    const resp = await fetch(signUrl, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ expiresIn: 3600 }),
    });

    const text = await resp.text();
    let data = {};
    try {
        data = text ? JSON.parse(text) : {};
    } catch {
        data = {};
    }

    if (!resp.ok) {
        const msg = data.error || data.message || 'Failed to create signed URL';
        return res.status(500).json({ message: msg });
    }

    return res.json({
        bucket,
        path,
        token: data.token ?? null,
        signedUrl: data.signedUrl ?? null,
    });
});

router.delete('/delete-avatar', requireAuth, async (req, res) => {
    const url = req.body?.url || req.query?.url || '';
    if (!url) {
        return res.status(400).json({ message: 'No URL provided' });
    }

    const base = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!base || !serviceKey) {
        return res.status(500).json({ message: 'Server configuration error' });
    }

    const clean = String(url).split('?', 1)[0];
    const publicPrefix = `${base}/storage/v1/object/public/`;
    const privatePrefix = `${base}/storage/v1/object/`;

    let rest = null;
    if (clean.startsWith(publicPrefix)) {
        rest = clean.slice(publicPrefix.length);
    } else if (clean.startsWith(privatePrefix)) {
        rest = clean.slice(privatePrefix.length);
    } else {
        return res.status(400).json({ message: 'Invalid storage URL' });
    }

    const [bucket, ...pathParts] = rest.split('/');
    const path = pathParts.join('/');
    if (!bucket || !path) {
        return res.status(400).json({ message: 'Invalid storage path' });
    }

    const deleteUrl = `${base}/storage/v1/object/${bucket}/${path}`;
    const delResp = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${serviceKey}`,
        },
    });

    if (!delResp.ok && delResp.status !== 400 && delResp.status !== 404) {
        let payload = {};
        try {
            payload = await delResp.json();
        } catch {
            payload = {};
        }
        const msg = payload.error || payload.message || 'Failed to delete avatar';
        return res.status(500).json({ message: msg });
    }

    return res.json({ deleted: true, url });
});

module.exports = router;
