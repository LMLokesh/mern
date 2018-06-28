const express = require("express");
const router = express.Router();

// @route GET api/posts/test
// @desc Tests port route
// @access Pulbic
router.get("/test", (req, res) => res.json({ msg: "posts test  works" }));

module.exports = router;
