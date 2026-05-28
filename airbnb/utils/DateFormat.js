
function formatListingsDate(listings) {
  return listings.map(listing => {
    if (listing.date) {
      listing.formattedDate = listing.date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
    }
    return listing;
  });
}

module.exports = formatListingsDate;
