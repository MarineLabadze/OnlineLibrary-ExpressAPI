const express = require("express");
const { registerUser, loginUser, currentUser } = require("../controllers/userController");
const validateToken = require("../middleware/validateTokenHandler");
const router = express.Router();

// router.get("/", (req, res) => {
//   res.send("User route is working!");
// });

router.post("/register", registerUser);

router.post("/login",loginUser);

router.get("/current", validateToken, currentUser);
module.exports = router;