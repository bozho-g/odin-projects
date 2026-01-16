const passport = require('./passport');

const configureAuth = (app) => {
    app.use(passport.initialize());
    app.use(passport.session());
};

module.exports = { configureAuth };