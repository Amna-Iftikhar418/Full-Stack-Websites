const Listing = require("../models/listing")
const formatListingsDate = require("../utils/DateFormat");
const mongoose = require("mongoose");
const { ALLOWED_AMENITIES } = require("../schema");
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const normalizeAmenities = (input) => {
    if (!input) return [];
    const arr = Array.isArray(input) ? input : [input];
    return arr.filter((a) => ALLOWED_AMENITIES.includes(a));
};
module.exports.index = async (req, res) => {
  const listings = await Listing.find({ isAvailable: { $ne: false } });
  res.render("listings/index", { allListings: formatListingsDate(listings) });
};
module.exports.renderNewForm = (req, res) => {
  const preselectedDate = req.query.date || "";
  res.render("listings/new.ejs", { preselectedDate })
}
module.exports.postNewForm = async (req, res, next) => {


  const { title, description, price, country, location, date } = req.body;
  let category = req.body.category;

  if (req.body.date) {
    req.body.date = new Date(req.body.date);
  }


  const newListing = new Listing({
    title,
    description,
    price,
    country,
    location,
    category,
    date: req.body.date,
    owner: req.user._id,
    cleaningFee: req.body.cleaningFee || 0,
    weeklyDiscount: req.body.weeklyDiscount || 0,
    monthlyDiscount: req.body.monthlyDiscount || 0,
    minStay: req.body.minStay || 1,
    maxGuests: req.body.maxGuests || 2,
    bedrooms: req.body.bedrooms || 1,
    beds: req.body.beds || 1,
    bathrooms: req.body.bathrooms || 1,
    amenities: normalizeAmenities(req.body.amenities),
  });


  if (req.files && req.files.length > 0) {
    newListing.images = req.files.map((f) => ({ url: f.path, filename: f.filename }));
    newListing.image = newListing.images[0];
  } else if (req.file) {
    newListing.image = { url: req.file.path, filename: req.file.filename };
    newListing.images = [newListing.image];
  }

  const query = `${location}, ${country}`;
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`,
      { headers: { "User-Agent": "WanderlustApp/1.0" } }
    );
    const data = await response.json();
    if (data.length > 0) {
      newListing.latitude = parseFloat(data[0].lat);
      newListing.longitude = parseFloat(data[0].lon);
    }
  } catch (geocodeErr) {
    // geocoding failure is non-fatal; listing saves without coordinates
  }


  await newListing.save();

  req.flash("success", "Successfully added new listing");
  res.redirect("/listings");

};

module.exports.search = async (req, res) => {

  const ALLOWED_CATEGORIES = [
    "Trending", "Farms", "Room", "Mountain",
    "Amazing Views", "Pool", "Castles", "Beach", "Iconic City"
  ];

  let { country, location, date, checkIn, checkOut, guests, minPrice, maxPrice, bedrooms, amenities, category } = req.query;
  country = (country || "").trim();
  location = (location || "").trim();
  date = (date || "").trim();
  checkIn = (checkIn || "").trim();
  checkOut = (checkOut || "").trim();
  category = (category || "").trim();
  const guestCount = parseInt(guests, 10) || 0;
  const minP = parseFloat(minPrice);
  const maxP = parseFloat(maxPrice);
  const bedroomsNum = parseInt(bedrooms, 10) || 0;
  const selectedAmenities = normalizeAmenities(amenities);
  const activeCategory = ALLOWED_CATEGORIES.find(c => c.toLowerCase() === category.toLowerCase()) || null;

  const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const filter = { isAvailable: { $ne: false } };

  if (activeCategory) {
    filter.category = { $regex: new RegExp(`^${escape(activeCategory)}$`, "i") };
  }

  if (location) {
    const re = new RegExp(escape(location), "i");
    filter.$or = [{ location: re }, { country: re }];
  } else if (country) {
    filter.country = { $regex: new RegExp(escape(country), "i") };
  }

  if (!isNaN(minP) || !isNaN(maxP)) {
    filter.price = {};
    if (!isNaN(minP)) filter.price.$gte = minP;
    if (!isNaN(maxP)) filter.price.$lte = maxP;
  }

  if (guestCount > 0) {
    filter.$and = (filter.$and || []).concat([
      { $or: [{ maxGuests: { $exists: false } }, { maxGuests: { $gte: guestCount } }] }
    ]);
  }

  if (bedroomsNum > 0) {
    filter.$and = (filter.$and || []).concat([
      { $or: [{ bedrooms: { $exists: false } }, { bedrooms: { $gte: bedroomsNum } }] }
    ]);
  }

  if (selectedAmenities.length) {
    filter.amenities = { $all: selectedAmenities };
  }

  const effectiveCheckIn = checkIn || date;
  const effectiveCheckOut = checkOut || "";
  if (effectiveCheckIn || effectiveCheckOut) {
    const Booking = require("../models/booking");
    const dateFilter = { status: { $ne: "cancelled" } };
    const ciDate = effectiveCheckIn ? new Date(effectiveCheckIn) : null;
    const coDate = effectiveCheckOut ? new Date(effectiveCheckOut) : null;
    if (ciDate && !isNaN(ciDate) && coDate && !isNaN(coDate)) {
      dateFilter.checkIn = { $lt: coDate };
      dateFilter.checkOut = { $gt: ciDate };
    } else if (ciDate && !isNaN(ciDate)) {
      dateFilter.checkIn = { $lte: ciDate };
      dateFilter.checkOut = { $gte: ciDate };
    }
    const busy = await Booking.find(dateFilter).distinct("listing");
    filter._id = { $nin: busy };
  }

  const listings = await Listing.find(filter);

  res.render("listings/index", {
    allListings: formatListingsDate(listings),
    category: activeCategory,
    searchCountry: country || location || null,
    searchDate: date || null,
    searchCheckIn: checkIn || null,
    searchCheckOut: checkOut || null,
    searchGuests: guestCount || null,
    searchFilters: {
      minPrice: !isNaN(minP) ? minP : "",
      maxPrice: !isNaN(maxP) ? maxP : "",
      bedrooms: bedroomsNum || "",
      amenities: selectedAmenities,
      category: activeCategory || ""
    }
  });

};

module.exports.renderEditForm = async (req, res) => {

  let { id } = req.params;
  if (!isValidId(id)) {
    req.flash("error", "Invalid listing ID");
    return res.redirect("/listings");
  }
  let list = await Listing.findById(id);
  if (!list) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }
  let originalimage = list.image && list.image.url ? list.image.url.replace("/upload", "/upload/w_150,h_70,c_fill") : null;

  res.render("listings/edit.ejs", { list, originalimage });

}

module.exports.postEditForm = async (req, res) => {
  let { id } = req.params;
  const { title, description, price, country, location, category, date } = req.body;

  const query = `${location}, ${country}`;


  let latitude = null;
  let longitude = null;


  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`,
      { headers: { "User-Agent": "WanderlustApp/1.0" } }
    );
    const data = await response.json();
    if (data.length > 0) {
      latitude = parseFloat(data[0].lat);
      longitude = parseFloat(data[0].lon);
    }
  } catch (geocodeErr) {
    // geocoding failure is non-fatal; listing saves without updated coordinates
  }

  const update = {
    title, description, price, country, location, category, date, latitude, longitude,
    cleaningFee: req.body.cleaningFee || 0,
    weeklyDiscount: req.body.weeklyDiscount || 0,
    monthlyDiscount: req.body.monthlyDiscount || 0,
    minStay: req.body.minStay || 1,
    maxGuests: req.body.maxGuests || 2,
    bedrooms: req.body.bedrooms || 1,
    beds: req.body.beds || 1,
    bathrooms: req.body.bathrooms || 1,
    amenities: normalizeAmenities(req.body.amenities)
  };
  const editlist = await Listing.findByIdAndUpdate(id, update, { new: true });

  if (!editlist) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  if (req.files && req.files.length > 0) {
    editlist.images = req.files.map((f) => ({ url: f.path, filename: f.filename }));
    editlist.image = editlist.images[0];
    await editlist.save();
  } else if (req.file) {
    editlist.image = { url: req.file.path, filename: req.file.filename };
    editlist.images = [editlist.image];
    await editlist.save();
  }


  req.flash("success", "Successfully updated listing!");
  res.redirect(`/listings/${editlist._id}`);

};



const upgradeUnsplashUrl = (url) => {
  if (!url || !url.includes("images.unsplash.com")) return url;
  return url.replace(/([?&])w=\d+/, "$1w=1600").replace(/([?&])q=\d+/, "$1q=85");
};

module.exports.show = async (req, res) => {
  let { id } = req.params;
  if (!isValidId(id)) {
    req.flash("error", "Invalid listing ID");
    return res.redirect("/listings");
  }
  const list = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");

  if (!list) {
    req.flash("error", "listing is not found")
    return res.redirect("/listings")
  }

  // host stats (superhost, response rate, avg rating)
  let hostStats = null;
  if (list.owner) {
    try {
      const { getHostStats } = require("../utils/hostStats");
      hostStats = await getHostStats(list.owner._id);
    } catch (e) {
      hostStats = null;
    }
  }

  // aggregate sub-ratings from reviews
  const subRatingKeys = ["cleanliness", "accuracy", "location", "communication", "checkIn", "value"];
  const subRatings = {};
  subRatingKeys.forEach(k => {
    const values = (list.reviews || []).map(r => r[k]).filter(v => typeof v === "number");
    subRatings[k] = values.length ? Math.round((values.reduce((s, v) => s + v, 0) / values.length) * 10) / 10 : null;
  });
  const overallRatings = (list.reviews || []).map(r => r.rating).filter(v => typeof v === "number");
  const overallAvg = overallRatings.length ? Math.round((overallRatings.reduce((s, v) => s + v, 0) / overallRatings.length) * 10) / 10 : null;

  if (list.image && list.image.url) {
    list.image.url = upgradeUnsplashUrl(list.image.url);
  }
  if (Array.isArray(list.images)) {
    list.images.forEach((img) => {
      if (img && img.url) img.url = upgradeUnsplashUrl(img.url);
    });
  }

  // Get confirmed bookings for this listing
  const Booking = require("../models/booking");
  const bookings = await Booking.find({
    listing: id,
    status: { $ne: "cancelled" }
  })
  .populate("guest")
  .sort({ checkIn: 1 })
  .limit(10);

  list.bookings = bookings;

  res.render("listings/show", { list, hostStats, subRatings, overallAvg });
}

module.exports.destroy = async (req, res) => {

  let { id } = req.params;
  if (!isValidId(id)) {
    req.flash("error", "Invalid listing ID");
    return res.redirect("/listings");
  }
  const deletedListing = await Listing.findByIdAndDelete(id);

  if (!deletedListing) {
    req.flash("error", "Listing not found or already deleted");
    return res.redirect("/listings");
  }

  req.flash("success", "Successfully deleted listing");
  res.redirect("/listings");

};

module.exports.category = (req, res) => {
  const category = decodeURIComponent(req.params.category || "");
  // Delegate to the unified /listings/search endpoint so advanced filters and
  // category tabs share one rendering path.
  return res.redirect("/listings/search?category=" + encodeURIComponent(category));
};

module.exports.toggleLike = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const user = await require("../models/users").findById(userId);
  const listing = await Listing.findById(id);

  if (!user) {
    req.flash("error", "User not found");
    return res.redirect("/listings");
  }
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  const likeIndex = user.likes.indexOf(id);
  if (likeIndex > -1) {
    // Unlike: remove from array
    user.likes.splice(likeIndex, 1);
  } else {
    // Like: add to array
    user.likes.push(id);
  }

  await user.save();

  // Return JSON for AJAX requests
  if (req.xhr || req.headers.accept && req.headers.accept.includes('json')) {
    return res.json({ liked: likeIndex === -1, count: user.likes.length });
  }

  // Regular redirect
  req.flash("success", likeIndex === -1 ? "Added to favorites!" : "Removed from favorites");
  res.redirect(req.get('Referrer') || "/listings");
};

module.exports.toggleAvailability = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) {
    req.flash("error", "Invalid listing ID");
    return res.redirect("/listings");
  }
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }
  const currentlyAvailable = listing.isAvailable !== false;
  listing.isAvailable = !currentlyAvailable;
  await listing.save();
  req.flash("success", listing.isAvailable ? "Listing marked Available" : "Listing marked Unavailable");
  res.redirect(`/listings/${id}`);
};

module.exports.mapView = async (req, res) => {
  const listings = await Listing.find({
    isAvailable: { $ne: false },
    latitude: { $ne: null },
    longitude: { $ne: null }
  }).select("title location country latitude longitude price image images category");

  const points = listings
    .filter(l => typeof l.latitude === "number" && typeof l.longitude === "number")
    .map(l => ({
      id: l._id.toString(),
      title: l.title,
      location: l.location,
      country: l.country,
      price: l.price,
      lat: l.latitude,
      lng: l.longitude,
      img: (l.images && l.images[0] && l.images[0].url) || (l.image && l.image.url) || null,
      category: l.category
    }));

  res.render("listings/map", { points });
};

module.exports.getLiked = async (req, res) => {
  const user = await require("../models/users").findById(req.user._id).populate("likes");
  const formatListingsDate = require("../utils/DateFormat");

  res.render("listings/liked", {
    allListings: formatListingsDate(user.likes)
  });
};
