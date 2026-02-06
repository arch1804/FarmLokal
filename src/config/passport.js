const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');
const logger = require('../utils/logger');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Google OAuth Strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({
                    oauthProvider: 'google',
                    oauthId: profile.id,
                });

                if (user) {
                    await user.updateLastLogin();
                    logger.info(`Google OAuth: Existing user logged in - ${user.email}`);
                    return done(null, user);
                }

                user = await User.create({
                    email: profile.emails[0].value,
                    name: profile.displayName,
                    avatar: profile.photos[0]?.value || null,
                    oauthProvider: 'google',
                    oauthId: profile.id,
                });

                logger.info(`Google OAuth: New user created - ${user.email}`);
                done(null, user);
            } catch (error) {
                logger.error(`Google OAuth error: ${error.message}`);
                done(error, null);
            }
        }
    )
);

// GitHub OAuth Strategy
passport.use(
    new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: process.env.GITHUB_CALLBACK_URL,
            scope: ['user:email'],
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({
                    oauthProvider: 'github',
                    oauthId: profile.id,
                });

                if (user) {
                    await user.updateLastLogin();
                    logger.info(`GitHub OAuth: Existing user logged in - ${user.email}`);
                    return done(null, user);
                }

                const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;

                if (!email) {
                    return done(new Error('No email found in GitHub profile'), null);
                }

                user = await User.create({
                    email,
                    name: profile.displayName || profile.username,
                    avatar: profile.photos[0]?.value || null,
                    oauthProvider: 'github',
                    oauthId: profile.id,
                });

                logger.info(`GitHub OAuth: New user created - ${user.email}`);
                done(null, user);
            } catch (error) {
                logger.error(`GitHub OAuth error: ${error.message}`);
                done(error, null);
            }
        }
    )
);

module.exports = passport;
