const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String},
    price: { type: Number},  
    location: { type: String, required: true },
    country: { type: String},
    image: [{ type: String ,
      default: "https://unsplash.com/photos/white-bed-linen-with-throw-pillows-Yrxr3bsPdS0",
      set:(v) => v===""?v="https://unsplash.com/photos/white-bed-linen-with-throw-pillows-Yrxr3bsPdS0":v
    }]
});
const Listing = mongoose.model('Listing', listingSchema);
module.exports = Listing;