const axios = require("axios");

const BASE = "https://api.spoonacular.com";
const KEY = () => process.env.SPOONACULAR_API_KEY;

function spoonacularParams(extra = {}) {
  return { apiKey: KEY(), ...extra };
}

const searchRecipes = async (req, res) => {
  const { q, cuisine, diet, intolerances, maxReadyTime } = req.query;
  try {
    const { data } = await axios.get(`${BASE}/recipes/complexSearch`, {
      params: spoonacularParams({
        query: q || "",
        cuisine: cuisine || undefined,
        diet: diet || undefined,
        intolerances: intolerances || undefined,
        maxReadyTime: maxReadyTime || undefined,
        addRecipeInformation: true,
        fillIngredients: false,
        number: 24,
      }),
    });
    res.json({ results: data.results || [], totalResults: data.totalResults });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch recipes.", error: err.message });
  }
};

const getRecipeById = async (req, res) => {
  const { id } = req.params;
  try {
    const [infoRes, stepsRes] = await Promise.all([
      axios.get(`${BASE}/recipes/${id}/information`, {
        params: spoonacularParams({ includeNutrition: false }),
      }),
      axios.get(`${BASE}/recipes/${id}/analyzedInstructions`, {
        params: spoonacularParams(),
      }),
    ]);
    res.json({ recipe: infoRes.data, instructions: stepsRes.data });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch recipe.", error: err.message });
  }
};

const getByIngredients = async (req, res) => {
  const { ingredients, intolerances } = req.query;
  if (!ingredients) {
    return res.status(400).json({ message: "ingredients param is required." });
  }
  try {
    const { data: matches } = await axios.get(`${BASE}/recipes/findByIngredients`, {
      params: spoonacularParams({
        ingredients,
        number: 24,
        ranking: 1,
        ignorePantry: true,
      }),
    });

    if (!matches.length) return res.json({ results: [] });

    const ids = matches.map((m) => m.id).join(",");
    const { data: bulk } = await axios.get(`${BASE}/recipes/informationBulk`, {
      params: spoonacularParams({ ids }),
    });

    let results = bulk;
    if (intolerances) {
      const blocked = intolerances.toLowerCase().split(",").map((s) => s.trim());
      results = bulk.filter((r) => {
        const tags = (r.diets || []).concat(r.cuisines || []);
        const titleLower = r.title.toLowerCase();
        return !blocked.some(
          (b) => titleLower.includes(b) || tags.some((t) => t.toLowerCase().includes(b))
        );
      });
    }

    res.json({ results });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch by ingredients.", error: err.message });
  }
};

const getCuisines = async (req, res) => {
  const cuisines = [
    "African","Asian","American","British","Cajun","Caribbean","Chinese",
    "Eastern European","European","French","German","Greek","Indian","Irish",
    "Italian","Japanese","Jewish","Korean","Latin American","Mediterranean",
    "Mexican","Middle Eastern","Nordic","Southern","Spanish","Thai","Vietnamese",
  ];
  res.json({ cuisines });
};

const getDiets = async (req, res) => {
  const diets = [
    "Gluten Free","Ketogenic","Vegetarian","Lacto-Vegetarian","Ovo-Vegetarian",
    "Vegan","Pescetarian","Paleo","Primal","Low FODMAP","Whole30",
  ];
  res.json({ diets });
};

const getIntolerances = async (req, res) => {
  const intolerances = [
    "Dairy","Egg","Gluten","Grain","Peanut","Seafood",
    "Sesame","Shellfish","Soy","Sulfite","Tree Nut","Wheat",
  ];
  res.json({ intolerances });
};

const getSuggestions = async (req, res) => {
  const { diet, intolerances } = req.query;
  try {
    const includeTags = diet ? diet.toLowerCase() : undefined;
    const excludeTags = intolerances ? intolerances.toLowerCase() : undefined;


    const { data } = await axios.get(`${BASE}/recipes/random`, {
      params: spoonacularParams({
        number: 12,
        ...(includeTags && { "include-tags": includeTags }),
        ...(excludeTags && { "exclude-tags": excludeTags }),
      }),
    });
    res.json({ results: data.recipes || [] });
  } catch (err) {
    // Log the actual Spoonacular error response
    console.error("Spoonacular error:", err.response?.data || err.message);
    res.status(500).json({ 
      message: "Failed to fetch suggestions.", 
      error: err.response?.data || err.message  // ← expose real error
    });
  }
};

module.exports = {
  searchRecipes,
  getRecipeById,
  getByIngredients,
  getCuisines,
  getDiets,
  getIntolerances,
  getSuggestions,
};