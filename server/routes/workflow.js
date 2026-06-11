const express = require("express")
const router = express.Router()
const workflowController = require("../controllers/workflowController")

router.post("/workflow", workflowController.register);

module.exports = router;