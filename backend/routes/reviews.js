const express = require('express');
const router = express.Router({ mergeParams: true });
const Listing = require('../models/listing');
const Review = require('../models/review');
const wrapAsync = require('../utils/WrapAsync');
const { reviewSchema } = require('../schema.js');
const ExpressError = require('../utils/ExpressError.js');
const { isLoggedIn, isReviewAuthor } = require("../middleware.js");
const reviewsController = require('../controllers/review.js');


// JOI validation
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(",");
        throw new ExpressError(msg, 400);
    }
    next();
};


// CREATE REVIEW
router.post(
    "/",
    isLoggedIn,
    validateReview,
    wrapAsync(reviewsController.createReview)
);

// DELETE REVIEW
router.delete(
    "/:reviewId",
    isLoggedIn,
    isReviewAuthor,
    wrapAsync(reviewsController.deleteReview)
);

module.exports = router;