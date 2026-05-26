const express = require("express")
const router = express.Router()
const authController = require("../controllers/authController")
const authMiddleware = require("../middlewares/authMiddleware")

// Step 1: Register route
// Users send their name, email, and password to this endpoint
router.post("/register", authController.register);

// Step 2: Login route
// Users send email and password to receive JWT
router.post("/login", authController.login);

// Step 3: Protected profile route
// Only accessible to authenticated users with a valid JWT
router.get("/profile", authMiddleware, authController.profile);

module.exports = router;