// scripts/geocodeListings.js
require('dotenv').config();
const mongoose = require('mongoose');
const fetch = globalThis.fetch || require('node-fetch');
const Listing = require('../models/listing');

const MONGO_URL = process.env.MONGO_URL;
const MAPBOX_TOKEN = process.env.MAP_TOKEN;
if (!MAPBOX_TOKEN) {
  console.error('Set MAPBOX_TOKEN in .env');
  process.exit(1);
}

async function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

async function geocode(query){
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&limit=1`;
  const res = await fetch(url);
  if(!res.ok) throw new Error(`Geocode failed: ${res.status}`);
  const j = await res.json();
  if (j.features && j.features.length) {
    const [lng, lat] = j.features[0].center;
    return { type: 'Point', coordinates: [lng, lat] };
  }
  return null;
}

async function main(){
  await mongoose.connect(MONGO_URL);
  console.log('Connected to DB');

  // Find listings missing geometry or with default/empty coordinates
  const listings = await Listing.find({
    $or: [
      { geometry: { $exists: false } },
      { 'geometry.coordinates': { $size: 0 } },
      { 'geometry.coordinates': [0,0] }
    ]
  }).lean();

  console.log(`Found ${listings.length} listings to geocode`);

  for (const l of listings) {
    const loc = l.location || `${l.title}`; // fallback
    try {
      console.log('Geocoding:', loc);
      const geom = await geocode(loc);
      if (geom) {
        await Listing.updateOne({ _id: l._id }, { $set: { geometry: geom } });
        console.log('Updated', l._id, geom.coordinates);
      } else {
        console.log('No result for', loc);
      }
    } catch (e) {
      console.error('Error geocoding', loc, e.message);
    }
    await sleep(300); // gentle throttle to avoid rate limits
  }

  console.log('Done');
  await mongoose.disconnect();
}

main().catch(err=>{
  console.error(err);
  process.exit(1);
});

