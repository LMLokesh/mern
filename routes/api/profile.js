const express = require("express");
const router = express.Router();

// @route GET api/profile/test
// @desc Tests Profile route
// @access Pulbic
router.get("/test", (req, res) => res.json({ msg: "profile works" }));

module.exports = router;