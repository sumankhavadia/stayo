const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose").default;

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// Use default username field (passport-local-mongoose adds it automatically)
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
