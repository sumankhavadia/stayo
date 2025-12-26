const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user.js");
const wrapAsync = require('../utils/WrapAsync');
const {saveRedirectUrl} = require('../middleware.js')
const usersController = require('../controllers/user.js');

// SIGNUP
router
    .route("/signup")
    .get(usersController.renderSignupForm)
    .post(wrapAsync(usersController.signup));

// LOGIN
router
    .route("/login")
    .get(usersController.renderLoginForm)
    .post(
        saveRedirectUrl,
        passport.authenticate("local", {
            failureRedirect: "/login",
            failureFlash: true,
        }),
        usersController.login
    );

// LOGOUT
router.get("/logout", usersController.logout);

module.exports = router;