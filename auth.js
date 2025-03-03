var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;

passport.use(new BasicStrategy(
    function(username, password, done) {
        var user = db.findOne(username);  // Fetch user from the database
        if (!user) {
            return done(null, false);  // User not found
        }
        if (user.password !== password) {
            return done(null, false);  // Password incorrect
        }
        return done(null, user);  // Success
    }
));

exports.isAuthenticated = passport.authenticate('basic', { session: false });
