const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const twilio = require("twilio");

const app = express();
app.use(bodyParser.json());
app.use(cors());

// 🔥 YOUR TWILIO DETAILS
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

// 🔥 YOUR TWILIO NUMBER
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

// OTP store
let otpStore = {};

// ✅ ROOT ROUTE (FIX ADDED)
app.get("/", (req, res) => {
  res.send("OTP Server is Running 🚀");
});

// ✅ SEND OTP
app.post("/send-otp", async (req, res) => {
  const { phone } = req.body;

  // phone validation
  if (!phone) {
    return res.send({ success: false, message: "Phone number required" });
  }

  if (!phone.startsWith("+")) {
    return res.send({
      success: false,
      message: "Use phone with country code (e.g. +91XXXXXXXXXX)",
    });
  }

  const otp = Math.floor(1000 + Math.random() * 9000);
  otpStore[phone] = otp;

  // ⏱ OTP expiry (5 minutes)
  setTimeout(() => {
    delete otpStore[phone];
  }, 300000);

  try {
    await client.messages.create({
      body: `🔥 Your Fire Emergency OTP is ${otp}`,
      from: twilioNumber,
      to: phone,
    });

    console.log(`OTP sent to ${phone}: ${otp}`);

    res.send({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.log(err);
    res.send({ success: false, error: err.message });
  }
});

// ✅ VERIFY OTP
app.post("/verify-otp", (req, res) => {
  const { phone, otp } = req.body;

  if (otpStore[phone] == otp) {
    delete otpStore[phone];
    return res.send({ verified: true, message: "OTP verified" });
  } else {
    return res.send({ verified: false, message: "Invalid OTP" });
  }
});

// SERVER START
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});