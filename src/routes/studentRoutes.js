const express = require("express");
const studentController = require("../controllers/studentController");

const router = express.Router();

router.get("/", studentController.renderDashboard);
router.post("/students", studentController.createStudent);
router.post("/marks", studentController.addMarks);

module.exports = router;
