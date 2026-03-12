import { getRecipeById, getReviews, submitReview, getSaved, saveRecipe, unsaveRecipe } from "./api.js";
import { isLoggedIn, showToast, renderStars } from "./utils.js";

const params = new URLSearchParams(window.location.search);
const mealId = params.get("id");

if (!mealId) window.location.href = "/index.html";

async function loadRecipe() {
  const [recipeRes, reviewRes] = await Promise.all([
    getRecipeById(mealId),
    getReviews(mealId),
  ]);

  const meal = recipeRes.recipe;
  const instructions = recipeRes.instructions;
  if (!meal) return (document.body.innerHTML = "<p>Recipe not found.</p>");

  const ingredients = (meal.extendedIngredients || [])
    .map((i) => i.original);

  // Build steps from analyzedInstructions
  const steps = instructions?.[0]?.steps || [];
  const stepsHtml = steps.length
    ? `<ol>${steps.map((s) => `<li>${s.step}</li>`).join("")}</ol>`
    : `<p>${meal.instructions || "No instructions available."}</p>`;

  let isSaved = false;
  if (isLoggedIn()) {
    const savedRes = await getSaved();
    isSaved = (savedRes.saved || []).some((s) => s.meal_id === mealId);
  }

  const dietTags = (meal.diets || []).map((d) =>
    `<span class="badge badge-include">${d}</span>`
  ).join(" ");

  document.getElementById("recipe-content").innerHTML = `
    <div class="recipe-hero">
      <img src="${meal.image || ''}" alt="${meal.title}" />
      <div class="recipe-hero-info">
        <h1>${meal.title}</h1>
        <p class="recipe-meta">
          ${meal.readyInMinutes ? `<span>⏱ ${meal.readyInMinutes} mins</span>` : ""}
          ${meal.servings ? `<span>🍽 ${meal.servings} servings</span>` : ""}
          ${meal.cuisines?.[0] ? `<span>🌍 ${meal.cuisines[0]}</span>` : ""}
        </p>
        <div style="margin-bottom:1rem">${dietTags}</div>
        <div class="rating-summary">
          <span class="stars">${renderStars(reviewRes.average || 0)}</span>
          <span>${reviewRes.average} / 5 (${reviewRes.total} review${reviewRes.total !== 1 ? "s" : ""})</span>
        </div>
        <div style="display:flex;gap:.75rem;flex-wrap:wrap;margin-top:1rem">
          <button class="btn ${isSaved ? "btn-saved" : "btn-primary"}" id="save-btn">
            ${isSaved ? "♥ Saved" : "♡ Save Recipe"}
          </button>
          ${meal.sourceUrl ? `<a class="btn btn-outline" href="${meal.sourceUrl}" target="_blank">📄 Source</a>` : ""}
        </div>
      </div>
    </div>

    <div class="recipe-body">
      <div class="ingredients">
        <h2>Ingredients</h2>
        <ul>${ingredients.map((i) => `<li>${i}</li>`).join("")}</ul>
      </div>
      <div class="instructions">
        <h2>Instructions</h2>
        ${stepsHtml}
      </div>
    </div>
  `;

  document.getElementById("save-btn").addEventListener("click", async () => {
    if (!isLoggedIn()) return showToast("Please login to save recipes.", "error");
    const btn = document.getElementById("save-btn");
    if (isSaved) {
      await unsaveRecipe(mealId);
      btn.textContent = "♡ Save Recipe";
      btn.className = "btn btn-primary";
      isSaved = false;
      showToast("Removed from saved.");
    } else {
      await saveRecipe(mealId, meal.title, meal.image);
      btn.textContent = "♥ Saved";
      btn.className = "btn btn-saved";
      isSaved = true;
      showToast("Recipe saved!");
    }
  });

  renderReviews(reviewRes.reviews || []);
}

function renderReviews(reviews) {
  const container = document.getElementById("reviews-list");
  container.innerHTML = reviews.length
    ? reviews.map((r) => `
        <div class="review-card">
          <div class="review-header">
            <strong>${r.user_name}</strong>
            <span class="stars">${renderStars(r.rating)}</span>
          </div>
          <p>${r.comment || ""}</p>
          <small>${new Date(r.created_at).toLocaleDateString()}</small>
        </div>
      `).join("")
    : "<p>No reviews yet. Be the first!</p>";
}

// Review form
if (isLoggedIn()) {
  document.getElementById("review-form-section").style.display = "block";
  const stars = document.querySelectorAll(".star-input");
  let selectedRating = 0;

  stars.forEach((star) => {
    star.addEventListener("click", () => {
      selectedRating = parseInt(star.dataset.value);
      stars.forEach((s) => s.classList.toggle("active", parseInt(s.dataset.value) <= selectedRating));
    });
  });

  document.getElementById("review-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!selectedRating) return showToast("Please select a star rating.", "error");
    const comment = document.getElementById("review-comment").value.trim();
    const res = await submitReview(mealId, { rating: selectedRating, comment });
    if (res.message === "Review saved successfully.") {
      showToast("Review submitted!");
      const reviewRes = await getReviews(mealId);
      renderReviews(reviewRes.reviews || []);
    } else {
      showToast(res.message || "Failed to submit review.", "error");
    }
  });
}

loadRecipe();
