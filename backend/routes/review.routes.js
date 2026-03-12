const express = require("express");
const router = express.Router();
const { addOrUpdateReview, getReviewsForMeal } = require("../controllers/review.controller");
const { verifyToken } = require("../middleware/auth.middleware");

router.post("/:mealId", verifyToken, addOrUpdateReview);
router.get("/:mealId", getReviewsForMeal);

module.exports = router;
