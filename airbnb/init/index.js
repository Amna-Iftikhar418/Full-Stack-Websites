
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
}

const mongoose = require("mongoose");
const Listing = require("../models/listing");
const { data: sampleListings } = require("./data");

const mongo_url = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
  await mongoose.connect(mongo_url);
  console.log("Connected to DB");

  // Clear existing data
  await Listing.deleteMany({});
  console.log("Cleared existing listings");

  // Insert sample listings
  const result = await Listing.insertMany(sampleListings);
  console.log(`Inserted ${result.length} listings`);
  mongoose.connection.close();
}

main().catch(err => console.log(err));
