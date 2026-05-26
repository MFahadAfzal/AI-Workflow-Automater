const db = require('../db/index')
const { hashPassword, comparePassword } = require("../services/hashService")
const { generateToken } = require("../services/jwtService")

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body // Get user input

    const exists = await db.oneOrNone('SELECT * FROM users WHERE email = $1', email)

    if(exists){
        return res.status(400).json({ message: "User already exists!" })
    }

    const hashedPassword = await hashPassword(password)


    // Step 3: Save user to database
    await db.none('INSERT INTO users (email, password) VALUES ($1, $2)', [email, hashedPassword])

    // Step 4: Send success response
    res.status(201).json({ message: "User registered successfully!" })
  } catch (err) {
    // Handle errors gracefully
    res.status(500).json({ error: err.message })
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body; // Get user input

    // Find user by email
    const user = await db.oneOrNone('SELECT * FROM users WHERE email = $1', email)
    if(!user)
      return res.status(400).json({ message: "Invalid email or password" });

    // Compare provided password with hashed password
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    // Step 3: Generate JWT using jwtService
    const token = generateToken({ id: user.id, email: user.email });

    // Step 4: Send success response with token
    res.json({ message: "Login successful!", token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Protected profile route
exports.profile = (req, res) => {
  // req.user is set by auth middleware after token verification
  res.json({
    message: "Welcome to your profile!",
    user: req.user,
  });
};