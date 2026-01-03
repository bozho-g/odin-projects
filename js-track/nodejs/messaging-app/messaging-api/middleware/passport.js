const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const prisma = require('../util/prismaClient');

passport.use(new LocalStrategy(async (username, password, done) => {
    try {
        const user = await prisma.users.findUnique({ where: { username } });
        if (!user) return done(null, false, { message: "User not found" });

        const ok = await bcrypt.compare(password, user.password_hash);

        if (!ok) return done(null, false, { message: "Invalid password" });

        return done(null, {
            id: user.id,
            username: user.username,
            displayName: user.display_name,
            pfpUrl: user.pfp_url,
        });
    } catch (e) {
        return done(e);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await prisma.users.findUnique({ where: { id } });
        if (!user) return done(null, false);
        done(null, {
            id: user.id,
            username: user.username,
            displayName: user.display_name,
            pfpUrl: user.pfp_url,
        });
    } catch (e) {
        done(e);
    }
});