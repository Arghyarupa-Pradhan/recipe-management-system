import { getSaved, unsaveRecipe } from "./api.js";
import { redirectIfNotLoggedIn, showToast } from "./utils.js";

redirectIfNotLoggedIn();

const grid = document.getElementById("saved-grid");

async function loadSaved() {
  grid.innerHTML = `<p class="loading">Loading saved recipes...</p>`;
  const res = await getSaved();
  const saved = res.saved || [];

  grid.innerHTML = saved.length
    ? saved.map((s) => `
        <div class="recipe-card" data-id="${s.meal_id}">
          <img src="${s.meal_thumb}" alt="${s.meal_name}" loading="lazy" />
          <div class="card-body">
            <h3>${s.meal_name}</h3>
            <div class="card-actions">
              <a href="/recipe.html?id=${s.meal_id}" class="btn btn-primary btn-sm">View Recipe</a>
              <button class="btn btn-danger btn-sm remove-btn" data-id="${s.meal_id}">Remove</button>
            </div>
          </div>
        </div>
      `).join("")
    : `<p class="no-results">No saved recipes yet. <a href="/search.html">Start exploring!</a></p>`;

  grid.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      await unsaveRecipe(btn.dataset.id);
      btn.closest(".recipe-card").remove();
      if (!grid.querySelector(".recipe-card")) {
        grid.innerHTML = `<p class="no-results">No saved recipes yet. <a href="/search.html">Start exploring!</a></p>`;
      }
      showToast("Recipe removed.");
    });
  });
}

loadSaved();
