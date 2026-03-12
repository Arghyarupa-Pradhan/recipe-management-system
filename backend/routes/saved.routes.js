const express = require("express");
const router = express.Router();
const { saveRecipe, unsaveRecipe, getSavedRecipes } = require("../controllers/saved.controller");
const { verifyToken } = require("../middleware/auth.middleware");

router.get("/", verifyToken, getSavedRecipes);
router.post("/:mealId", verifyToken, saveRecipe);
router.delete("/:mealId", verifyToken, unsaveRecipe);

module.exports = router;
