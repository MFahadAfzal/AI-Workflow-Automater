const express = require("express")
const router = express.Router()
const workflowController = require("../controllers/workflowController")


router.post("/run", workflowController.runWorkflow);

module.exports = router;