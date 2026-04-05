const express = require('express');
const passport = require('passport');
const User = require('../models/user');
const wrapAsync = require('../utils/WrapAsync');

const router = express.Router();

function serializeUser(user) {
  return {
    _id: user._id,
    username: user.username,
    email: user.email,
  };
}

router.get('/me', (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
  return res.json(serializeUser(req.user));
});

router.post(
  '/signup',
  wrapAsync(async (req, res, next) => {
    const { username, email, password } = req.body || {};
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'username, email and password are required' });
    }

    const newUser = new User({ username, email });
    const registeredUser = await User.register(newUser, password);

    req.login(registeredUser, (err) => {
      if (err) return next(err);
      return res.status(201).json(serializeUser(registeredUser));
    });
  }),
);

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, _info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ message: 'Invalid username or password' });

    req.logIn(user, (loginErr) => {
      if (loginErr) return next(loginErr);
      return res.json(serializeUser(user));
    });
  })(req, res, next);
});

router.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    return res.status(204).end();
  });
});

module.exports = router;
