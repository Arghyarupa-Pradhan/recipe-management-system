// ============================================================
// API - Single place for all backend fetch() calls
// ============================================================

const BASE_URL = "http://localhost:5000/api";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// AUTH
export const registerUser = (data) =>
  fetch(`${BASE_URL}/auth/register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then((r) => r.json());

export const loginUser = (data) =>
  fetch(`${BASE_URL}/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then((r) => r.json());

// USER
export const getProfile = () =>
  fetch(`${BASE_URL}/user/profile`, { headers: authHeaders() }).then((r) => r.json());

export const updateProfile = (data) =>
  fetch(`${BASE_URL}/user/profile`, { method: "PUT", headers: authHeaders(), body: JSON.stringify(data) }).then((r) => r.json());


// RECIPES
export const searchRecipes = (params) => {
  const query = new URLSearchParams(params).toString();
  return fetch(`${BASE_URL}/recipes/search?${query}`).then((r) => r.json());
};

export const getRecipeById = (id) =>
  fetch(`${BASE_URL}/recipes/${id}`).then((r) => r.json());

export const getByIngredients = (params) => {
  const query = new URLSearchParams(params).toString();
  return fetch(`${BASE_URL}/recipes/by-ingredients?${query}`).then((r) => r.json());
};

export const getCuisines = () =>
  fetch(`${BASE_URL}/recipes/cuisines`).then((r) => r.json());

export const getDiets = () =>
  fetch(`${BASE_URL}/recipes/diets`).then((r) => r.json());

export const getIntolerances = () =>
  fetch(`${BASE_URL}/recipes/intolerances`).then((r) => r.json());

export const getSuggestions = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return fetch(`${BASE_URL}/recipes/suggestions?${query}`).then((r) => r.json());
};
// SAVED
export const getSaved = () =>
  fetch(`${BASE_URL}/saved`, { headers: authHeaders() }).then((r) => r.json());

export const saveRecipe = (mealId, meal_name, meal_thumb) =>
  fetch(`${BASE_URL}/saved/${mealId}`, { method: "POST", headers: authHeaders(), body: JSON.stringify({ meal_name, meal_thumb }) }).then((r) => r.json());

export const unsaveRecipe = (mealId) =>
  fetch(`${BASE_URL}/saved/${mealId}`, { method: "DELETE", headers: authHeaders() }).then((r) => r.json());

// REVIEWS
export const getReviews = (mealId) =>
  fetch(`${BASE_URL}/reviews/${mealId}`).then((r) => r.json());

export const submitReview = (mealId, data) =>
  fetch(`${BASE_URL}/reviews/${mealId}`, { method: "POST", headers: authHeaders(), body: JSON.stringify(data) }).then((r) => r.json());
