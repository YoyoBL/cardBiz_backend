const mongoose = require("mongoose");

const loginsSchema = new mongoose.Schema({
   email: { type: String, required: true },
   attempts: { type: Number, default: 0 },
   timestamp: { type: Date, default: Date.now },
});

const LoginAttempt = mongoose.model(
   "LoginAttempt",
   loginsSchema,
   "loginAttempts"
);

module.exports = { LoginAttempt };
