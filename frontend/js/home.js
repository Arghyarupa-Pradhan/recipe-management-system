import { getSuggestions, getSaved, saveRecipe, unsaveRecipe, getProfile } from "./api.js";
import { getUser, isLoggedIn, showToast, buildRecipeCard, cache } from "./utils.js";

const grid = document.getElementById("suggestions-grid");
const userName = document.getElementById("user-name");

if (userName) {
  const user = getUser();
  userName.textContent = user ? `Welcome back, ${user.name.split(" ")[0]}! 👋` : "Discover Recipes";
}

async function loadSuggestions() {
  grid.innerHTML = `<p class="loading">Loading recipes...</p>`;

  // Build params from user profile if logged in
  const params = {};
  if (isLoggedIn()) {
    try {
      const profile = await getProfile();
      const prefs = profile.preferences || {};
      const diets = prefs.dietary_tags || [];
      const allergies = prefs.allergies || [];
      if (diets.length) params.diet = diets[0]; // Spoonacular takes one diet
      if (allergies.length) {
        params.intolerances = allergies
          .map((a) => a.toLowerCase().replace(/s$/, "")) // "Peanuts" → "peanut"
          .join(",");
      }
    } catch (_) {}
  }

  const cacheKey = `suggestions_${JSON.stringify(params)}`;
  let meals = cache.get(cacheKey);

  if (!meals) {
    const res = await getSuggestions(params);
    meals = res.results || [];
    if (meals.length) cache.set(cacheKey, meals);
  }

  let savedIds = new Set();
  if (isLoggedIn()) {
    const savedRes = await getSaved();
    savedIds = new Set((savedRes.saved || []).map((s) => s.meal_id));
  }

  grid.innerHTML = meals.map((m) => buildRecipeCard(m, savedIds.has(String(m.id)))).join("") 
    || "<p>No suggestions found.</p>";

  attachSaveHandlers(grid);
}

function attachSaveHandlers(container) {
  container.querySelectorAll(".save-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!isLoggedIn()) return showToast("Please login to save recipes.", "error");
      const { id, name, thumb } = btn.dataset;
      const isSaved = btn.classList.contains("saved");
      if (isSaved) {
        await unsaveRecipe(id);
        btn.textContent = "♡ Save";
        btn.classList.remove("saved");
        showToast("Removed from saved.");
      } else {
        await saveRecipe(id, name, thumb);
        btn.textContent = "♥ Saved";
        btn.classList.add("saved");
        showToast("Recipe saved!");
      }
    });
  });
}

loadSuggestions();