const express = require('express');
const router = express.Router();
const Listing = require('../models/listing');
const wrapAsync = require('../utils/WrapAsync');
const { upload } = require('../cloudConfig');

const mapToken = process.env.MAP_TOKEN;

async function geocodeLocation(query) {
  if (!mapToken || !query) return null;

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapToken}&limit=1`;
  const response = await fetch(url);

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  if (!data.features?.length) return null;

  const [lng, lat] = data.features[0].center;
  return {
    type: 'Point',
    coordinates: [lng, lat],
  };
}

function requireApiLogin(req, res, next) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ message: 'Login required' });
  }
  return next();
}

router.post(
  '/',
  requireApiLogin,
  upload.single('image'),
  wrapAsync(async (req, res) => {
    const payload = req.body || {};
    const geometry = await geocodeLocation(payload.location);
    const listing = new Listing({
      title: payload.title,
      description: payload.description,
      price: Number(payload.price) || 0,
      location: payload.location,
      country: payload.country,
      owner: req.user._id,
      ...(geometry ? { geometry } : {}),
    });

    if (req.file) {
      listing.image = {
        filename: req.file.filename,
        url: req.file.path,
      };
    }

    await listing.save();
    res.status(201).json(listing);
  }),
);

router.get(
  '/',
  wrapAsync(async (_req, res) => {
    const listings = await Listing.find({})
      .populate('owner', 'username email')
      .sort({ _id: -1 });
    res.json(listings);
  }),
);

router.get(
  '/:id',
  wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id)
      .populate({
        path: 'reviews',
        populate: { path: 'author' },
      })
      .populate('owner');

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    res.json(listing);
  }),
);

router.delete(
  '/:id',
  requireApiLogin,
  wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (String(listing.owner) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You are not allowed to delete this listing' });
    }

    await Listing.findByIdAndDelete(req.params.id);
    return res.status(204).end();
  }),
);

module.exports = router;
