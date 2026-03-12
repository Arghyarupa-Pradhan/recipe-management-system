import {
  searchRecipes, getByIngredients, getCuisines,
  getDiets, getIntolerances, getSaved, saveRecipe, unsaveRecipe, getProfile,
} from "./api.js";
import { isLoggedIn, showToast, buildRecipeCard, cache } from "./utils.js";

const grid = document.getElementById("results-grid");
const cuisineSelect = document.getElementById("filter-cuisine");
const dietSelect = document.getElementById("filter-diet");
const intoleranceSelect = document.getElementById("filter-intolerance");
const timeInput = document.getElementById("filter-time");

async function loadFilters() {
  const [cRes, dRes, iRes] = await Promise.all([
    cache.get("cuisines") ? Promise.resolve({ cuisines: cache.get("cuisines") }) : getCuisines(),
    cache.get("diets") ? Promise.resolve({ diets: cache.get("diets") }) : getDiets(),
    cache.get("intolerances") ? Promise.resolve({ intolerances: cache.get("intolerances") }) : getIntolerances(),
  ]);

  cache.set("cuisines", cRes.cuisines);
  cache.set("diets", dRes.diets);
  cache.set("intolerances", iRes.intolerances);

  cRes.cuisines.forEach((c) => cuisineSelect.innerHTML += `<option value="${c}">${c}</option>`);
  dRes.diets.forEach((d) => dietSelect.innerHTML += `<option value="${d}">${d}</option>`);
  iRes.intolerances.forEach((i) => intoleranceSelect.innerHTML += `<option value="${i}">${i}</option>`);

  // Pre-fill intolerances from user allergies if logged in
  if (isLoggedIn()) {
    try {
      const profile = await getProfile();
      const allergies = profile.preferences?.allergies || [];
      if (allergies.length) {
        intoleranceSelect.value = allergies[0];
        showToast(`Allergy filter auto-set from your profile.`);
      }
    } catch (_) {}
  }
}

async function doSearch(params) {
  grid.innerHTML = `<p class="loading">Searching...</p>`;

  let savedIds = new Set();
  if (isLoggedIn()) {
    const savedRes = await getSaved();
    savedIds = new Set((savedRes.saved || []).map((s) => s.meal_id));
  }

  const res = await searchRecipes(params);
  const meals = res.results || [];

  renderResults(meals, savedIds);
}

async function doIngredientSearch() {
  const input = document.getElementById("ingredient-search-input").value.trim();
  if (!input) return showToast("Enter at least one ingredient.", "error");

  grid.innerHTML = `<p class="loading">Finding recipes you can make...</p>`;

  // Also pull user intolerances automatically
  const params = { ingredients: input };
  if (isLoggedIn()) {
    try {
      const profile = await getProfile();
      const allergies = profile.preferences?.allergies || [];
      if (allergies.length) params.intolerances = allergies.join(",");
    } catch (_) {}
  }

  const res = await getByIngredients(params);
  const meals = res.results || [];

  let savedIds = new Set();
  if (isLoggedIn()) {
    const savedRes = await getSaved();
    savedIds = new Set((savedRes.saved || []).map((s) => s.meal_id));
  }

  renderResults(meals, savedIds);
}

function renderResults(meals, savedIds) {
  grid.innerHTML = meals.length
    ? meals.map((m) => buildRecipeCard(m, savedIds.has(String(m.id)))).join("")
    : `<p class="no-results">No recipes found. Try different filters.</p>`;

  grid.querySelectorAll(".save-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!isLoggedIn()) return showToast("Please login to save recipes.", "error");
      const { id, name, thumb } = btn.dataset;
      const isSaved = btn.classList.contains("saved");
      if (isSaved) {
        await unsaveRecipe(id);
        btn.textContent = "♡ Save";
        btn.classList.remove("saved");
      } else {
        await saveRecipe(id, name, thumb);
        btn.textContent = "♥ Saved";
        btn.classList.add("saved");
        showToast("Saved!");
      }
    });
  });
}

// Tab switching
document.querySelectorAll(".search-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".search-tab").forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".search-panel").forEach((p) => p.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(tab.dataset.panel).classList.add("active");
  });
});

// Regular search form
document.getElementById("search-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const params = {};
  const q = document.getElementById("search-input").value.trim();
  const cuisine = cuisineSelect.value;
  const diet = dietSelect.value;
  const intolerance = intoleranceSelect.value;
  const time = timeInput.value;
  if (q) params.q = q;
  if (cuisine) params.cuisine = cuisine;
  if (diet) params.diet = diet;
  if (intolerance) params.intolerances = intolerance;
  if (time) params.maxReadyTime = time;
  doSearch(params);
});

// Ingredient search
document.getElementById("ingredient-search-btn").addEventListener("click", doIngredientSearch);

// URL param
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has("q")) {
  document.getElementById("search-input").value = urlParams.get("q");
  doSearch({ q: urlParams.get("q") });
}

loadFilters();