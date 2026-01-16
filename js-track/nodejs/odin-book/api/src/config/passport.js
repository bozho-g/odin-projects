const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const prisma = require('./prismaClient');
const bcrypt = require('bcryptjs');

passport.use(new LocalStrategy(async (username, password, done) => {
    try {
        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) return done(null, false, { message: "User not found" });

        const ok = await bcrypt.compare(password, user.password);

        if (!ok) return done(null, false, { message: "Invalid password" });

        return done(null, user);
    } catch (e) {
        return done(e);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) return done(null, false);
        done(null, user);
    } catch (e) {
        done(e);
    }
});

module.exports = passport;