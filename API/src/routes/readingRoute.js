"use strict";

let express = require("express");
let router = express.Router();
let bodyParser = require("body-parser");
let asyncMiddleware = require("../middleware/asyncMiddleware.js");

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json()); // parse application/json

// Reading API
let readingController = require("../controllers/readingController.js");
router.get("/meter-read/", asyncMiddleware(readingController.getAllReadings));
router.get("/meter-read/:readingId", asyncMiddleware(readingController.getReading));
router.post("/meter-read/", asyncMiddleware(readingController.addReading));

module.exports = router;