const express = require("express");
const router = express.Router();
const {
  searchRecipes, getRecipeById, getByIngredients,
  getCuisines, getDiets, getIntolerances, getSuggestions,
} = require("../controllers/recipe.controller");

router.get("/search", searchRecipes);
router.get("/by-ingredients", getByIngredients);   
router.get("/cuisines", getCuisines);
router.get("/diets", getDiets);
router.get("/intolerances", getIntolerances);
router.get("/suggestions", getSuggestions);
router.get("/:id", getRecipeById);              

module.exports = router;