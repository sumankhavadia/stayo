const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review.js'); 

const listingSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  price: { type: Number },
  location: { type: String, required: true },
  country: { type: String },
  image: {
    filename: { type: String, default: "listingimage" },
    url: {
      type: String,
      default: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80"
    }
  },

  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review"
    }
  ],
    owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  geometry: {
  type: {
    type: String,
    enum: ['Point'],
    required: true,
    default: 'Point'
  },
  coordinates: {
    type: [Number],
    required: true,
    default: [0, 0]  
  }
}

});
listingSchema.post('findOneAndDelete', async function(doc) {  
  if (doc) {  
    await Review.deleteMany({  
      _id: {  
        $in: doc.reviews  
      }
    });
  }
}
);

module.exports = mongoose.model('Listing', listingSchema);