const Listing = require("../models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const mapToken = process.env.MAP_TOKEN;

const geocodingClient = mbxGeocoding({
  accessToken: mapToken
});

// SHOW ALL LISTINGS
module.exports.index = async (req, res) => {
    const alllistings = await Listing.find({});
    res.render("listings/index.ejs", { alllistings });
};

// NEW LISTING FORM
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

// SHOW SINGLE LISTING
module.exports.showListing = async (req, res) => {
    const listing = await Listing.findById(req.params.id)
        .populate({
            path: "reviews",
            populate: { path: "author" }
        })
        .populate("owner");

    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }

    res.render("listings/show.ejs", { listing });
};

// CREATE LISTING
module.exports.createListing = async (req, res) => {
    const response = await geocodingClient.forwardGeocode({
    query: req.body.listing.location,
    limit: 1
    }).send();

    let url = req.file.path;
    let filename = req.file.filename;
    console.log(url,"...",filename);
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {filename,url}
    newListing.geometry=response.body.features[0].geometry
    await newListing.save();
    req.flash("success", "Successfully created a new listing!");
    res.redirect("/listings");
};

// EDIT LISTING FORM
module.exports.renderEditForm = async (req, res) => {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }

    res.render("listings/edit.ejs", { listing });
};

// UPDATE LISTING
module.exports.updateListing = async (req, res) => {
  const { id } = req.params;

  // 1. Update text fields
  const listing = await Listing.findByIdAndUpdate(
    id,
    req.body.listing,
    { new: true }
  );

  // 2. If a new image is uploaded, update image field
  if (typeof req.file !=="undefined") {
    listing.image = {
      url: req.file.path,
      filename: req.file.filename
    };
    await listing.save();
  }

  req.flash("success", "Successfully updated listing!");
  res.redirect(`/listings/${id}`);
};

// DELETE LISTING
module.exports.deleteListing = async (req, res) => {
    await Listing.findByIdAndDelete(req.params.id);
    req.flash("success", "Successfully deleted listing!");
    res.redirect("/listings");
};
