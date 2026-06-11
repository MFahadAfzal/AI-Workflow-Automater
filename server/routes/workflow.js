const express = require("express")
const router = express.Router()
const workflowController = require("../controllers/workflowController")
const authMiddleware = require("../middlewares/authMiddleware")


router.post("/run", workflowController.runWorkflow)
router.post("/save", authMiddleware, workflowController.saveWorkflow)

module.exports = router;