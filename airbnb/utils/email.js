const nodemailer = require("nodemailer");

const FROM = process.env.GMAIL_USER
    ? `"Wunderlust" <${process.env.GMAIL_USER}>`
    : `"Wunderlust" <no-reply@wunderlust.local>`;

let cachedTransporter = null;

function getTransporter() {
    if (cachedTransporter) return cachedTransporter;

    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
        cachedTransporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        });
    } else {
        cachedTransporter = {
            sendMail: async (opts) => {
                console.log("[email:dev]", {
                    to: opts.to,
                    subject: opts.subject,
                    text: opts.text || (opts.html || "").replace(/<[^>]+>/g, " ").slice(0, 300),
                });
                return { accepted: [opts.to], messageId: "dev-" + Date.now() };
            },
        };
    }
    return cachedTransporter;
}

async function send(to, subject, html, text) {
    try {
        const transporter = getTransporter();
        await transporter.sendMail({
            from: FROM,
            to,
            subject,
            html,
            text: text || (html || "").replace(/<[^>]+>/g, " "),
        });
    } catch (err) {
        console.error("[email] send failed:", err.message);
    }
}

function appUrl() {
    return process.env.APP_URL || `http://localhost:${process.env.PORT || 8080}`;
}

module.exports.sendVerificationEmail = async (user, token) => {
    const link = `${appUrl()}/verify/${token}`;
    const html = `
        <h2>Welcome to Wunderlust, ${user.firstName || user.username}!</h2>
        <p>Confirm your email by clicking the link below:</p>
        <p><a href="${link}" style="background:#e8150a;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none">Verify email</a></p>
        <p>Or paste this URL: ${link}</p>
        <p>This link expires in 24 hours.</p>
    `;
    await send(user.email, "Verify your Wunderlust email", html);
};

module.exports.sendBookingRequestToHost = async (host, guest, listing, booking) => {
    const link = `${appUrl()}/bookings/host`;
    const html = `
        <h2>New booking request</h2>
        <p><strong>${guest.username}</strong> requested <strong>${listing.title}</strong>.</p>
        <p>Check-in: ${booking.checkIn.toDateString()}<br/>
           Check-out: ${booking.checkOut.toDateString()}<br/>
           Total: $${booking.totalPrice}</p>
        <p><a href="${link}">Review in host dashboard</a></p>
    `;
    await send(host.email, "New booking request on Wunderlust", html);
};

module.exports.sendBookingStatusToGuest = async (guest, listing, booking) => {
    const link = `${appUrl()}/bookings/guest`;
    const html = `
        <h2>Booking ${booking.status}</h2>
        <p>Your booking for <strong>${listing.title}</strong> is now <strong>${booking.status}</strong>.</p>
        <p>Check-in: ${booking.checkIn.toDateString()}<br/>
           Check-out: ${booking.checkOut.toDateString()}</p>
        <p><a href="${link}">View in dashboard</a></p>
    `;
    await send(guest.email, `Your Wunderlust booking is ${booking.status}`, html);
};

module.exports.sendPaymentReceipt = async (guest, listing, booking) => {
    const html = `
        <h2>Payment received</h2>
        <p>We received your payment for <strong>${listing.title}</strong>.</p>
        <p>Amount: $${booking.totalPrice}<br/>
           Check-in: ${booking.checkIn.toDateString()}<br/>
           Check-out: ${booking.checkOut.toDateString()}</p>
        <p>Your booking is confirmed.</p>
    `;
    await send(guest.email, "Wunderlust payment receipt", html);
};

module.exports.sendMessageNotification = async (recipient, sender, preview) => {
    const link = `${appUrl()}/inbox`;
    const html = `
        <h2>New message from ${sender.username}</h2>
        <p>${preview}</p>
        <p><a href="${link}">Open inbox</a></p>
    `;
    await send(recipient.email, "New message on Wunderlust", html);
};

module.exports.send = send;
