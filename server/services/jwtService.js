// services/jwtService.js

const jwt = require("jsonwebtoken");

// Function to generate a JWT
exports.generateToken = (payload) => {
  // jwt.sign creates a signed token using our secret key from environment variables
  // expiresIn defines how long the token is valid (1 hour here)
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
};

// Function to verify a JWT
exports.verifyToken = (token) => {
  // jwt.verify checks if the token is valid and not expired
  return jwt.verify(token, process.env.JWT_SECRET);
};