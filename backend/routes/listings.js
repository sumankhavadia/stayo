const express = require('express');
const router = express.Router();
const Listing = require('../models/listing');
const wrapAsync = require('../utils/WrapAsync');
const ExpressError = require('../utils/ExpressError.js');
const { listingSchema } = require('../schema.js');
const { isLoggedIn , isOwner } = require("../middleware.js");
const listingsController = require('../controllers/listing.js');


const multer = require("multer");

// Use this:
const { upload } = require("../cloudConfig.js");



// JOI validation middleware
const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(",");
        throw new ExpressError(msg, 400);
    }
    next();
};
// ROUTES
router
    .route("/")
    .get(wrapAsync(listingsController.index))
    .post(
        isLoggedIn,
        upload.single('listing[image]'),
        validateListing,
        wrapAsync(listingsController.createListing)
    );
   

router.get("/new", isLoggedIn, listingsController.renderNewForm);

router
    .route("/:id")
    .get(wrapAsync(listingsController.showListing))
    .put(
        isLoggedIn,
        isOwner,
        upload.single('listing[image]'),
        validateListing,
        wrapAsync(listingsController.updateListing)
    )
    .delete(
        isLoggedIn,
        isOwner,
        wrapAsync(listingsController.deleteListing)
    );

router.get(
    "/:id/edit",
    isLoggedIn,
    isOwner,
    wrapAsync(listingsController.renderEditForm)
);

module.exports = router;