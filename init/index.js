const mongoose = require("mongoose");
const initData=require("./data.js");
const Listing = require("../models/listing.js");
const OWNER_ID = "69476fa742fb3504ad106a09"; // your user ID
require("dotenv").config();


const MONGO_URL = process.env.MONGO_URL;

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await Listing.deleteMany({});

  // Inject owner inside all listing objects
  const updatedData = initData.data.map(item => ({
    ...item,
    owner: OWNER_ID
  }));

  await Listing.insertMany(updatedData);
  console.log("data initialized with owner field!");
};

initDB();