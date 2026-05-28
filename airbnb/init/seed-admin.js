if (process.env.NODE_ENV !== "production") {
    require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
}

const mongoose = require("mongoose");
const User = require("../models/users");

const mongo_url = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/wanderlust";
const adminEmail = process.env.ADMIN_EMAIL || "admin@wunderlust.local";
const adminUsername = process.env.ADMIN_USERNAME || "admin";
const adminPassword = process.env.ADMIN_PASSWORD || "admin12345";

async function main() {
    await mongoose.connect(mongo_url);
    console.log("Connected to DB");

    let existing = await User.findOne({ email: adminEmail });
    if (existing) {
        existing.isAdmin = true;
        existing.isVerified = true;
        await existing.save();
        console.log(`Promoted existing user to admin: ${existing.username} <${existing.email}>`);
    } else {
        const admin = new User({
            email: adminEmail,
            username: adminUsername,
            isAdmin: true,
            isVerified: true,
        });
        const registered = await User.register(admin, adminPassword);
        console.log(`Created admin: ${registered.username} <${registered.email}>  password=${adminPassword}`);
    }

    await mongoose.connection.close();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
