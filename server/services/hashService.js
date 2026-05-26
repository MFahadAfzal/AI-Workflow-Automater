const bcrypt = require("bcrypt");

// Function to hash a plain password
exports.hashPassword = async (plainPassword) => {
  // bcrypt.hash generates a hashed version of the password
  // The number 10 is the salt rounds, which affects the hashing complexity
  return await bcrypt.hash(plainPassword, 10);
};

// Function to compare a plain password with a hashed password
exports.comparePassword = async (plainPassword, hashedPassword) => {
  // bcrypt.compare checks if the plain password matches the hashed one
  return await bcrypt.compare(plainPassword, hashedPassword);
};