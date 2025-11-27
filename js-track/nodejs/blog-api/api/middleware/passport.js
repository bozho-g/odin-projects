const passport = require('passport');
const prisma = require('../util/prismaClient');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
};

passport.use(new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: jwtPayload.id } });
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    } catch (error) {
        return done(error, false);
    }
}));

module.exports = passport;