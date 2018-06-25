const express = require("express");
const router = express.Router();

// @route GET api/users/test
// @desc Tests Users route
// @access Pulbic
router.get("/test", (req, res) => res.json({ msg: "users works" }));

module.exports = router;
