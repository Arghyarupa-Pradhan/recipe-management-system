import { getProfile, updateProfile } from "./api.js";
import { redirectIfNotLoggedIn, showToast } from "./utils.js";

redirectIfNotLoggedIn();

const DIETARY_OPTIONS = ["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Keto", "Halal", "Kosher"];
const ALLERGY_OPTIONS = ["Peanuts", "Dairy", "Eggs", "Shellfish", "Wheat", "Soy", "Tree Nuts"];

async function loadProfile() {
  const res = await getProfile();
  if (res.email) {
    document.getElementById("name").value = res.name || "";
    document.getElementById("email").value = res.email || "";
    document.getElementById("skill_level").value = res.skill_level || "beginner";

    const tags = res.preferences?.dietary_tags || [];
    const allergies = res.preferences?.allergies || [];

    renderCheckboxes("dietary-options", DIETARY_OPTIONS, tags, "dietary");
    renderCheckboxes("allergy-options", ALLERGY_OPTIONS, allergies, "allergy");
    renderIngredientPrefs(res.ingredient_prefs || []);
  }
}

function renderCheckboxes(containerId, options, selected, name) {
  const container = document.getElementById(containerId);
  container.innerHTML = options.map((opt) => `
    <label class="checkbox-label">
      <input type="checkbox" name="${name}" value="${opt}" ${selected.includes(opt) ? "checked" : ""} />
      ${opt}
    </label>
  `).join("");
}

function renderIngredientPrefs(prefs) {
  const list = document.getElementById("ingredient-list");
  list.innerHTML = prefs.map((p, i) => `
    <div class="ingredient-item" data-index="${i}">
      <span class="badge badge-${p.type}">${p.type}</span>
      <span>${p.ingredient}</span>
      <button class="btn btn-sm btn-danger remove-ing" data-index="${i}">✕</button>
    </div>
  `).join("") || "<p>No ingredient preferences set.</p>";

  list.querySelectorAll(".remove-ing").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.closest(".ingredient-item").remove();
    });
  });
}

document.getElementById("add-ingredient").addEventListener("click", () => {
  const input = document.getElementById("ingredient-input").value.trim();
  const type = document.getElementById("ingredient-type").value;
  if (!input) return showToast("Enter an ingredient first.", "error");

  const list = document.getElementById("ingredient-list");
  const emptyMsg = list.querySelector("p");
  if (emptyMsg) emptyMsg.remove();

  const item = document.createElement("div");
  item.className = "ingredient-item";
  item.innerHTML = `
    <span class="badge badge-${type}">${type}</span>
    <span>${input}</span>
    <button class="btn btn-sm btn-danger remove-ing">✕</button>
  `;
  item.querySelector(".remove-ing").addEventListener("click", () => item.remove());
  list.appendChild(item);
  document.getElementById("ingredient-input").value = "";
});

document.getElementById("profile-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const dietary_tags = [...document.querySelectorAll('input[name="dietary"]:checked')].map((el) => el.value);
  const allergies = [...document.querySelectorAll('input[name="allergy"]:checked')].map((el) => el.value);
  const ingredient_prefs = [...document.querySelectorAll(".ingredient-item")].map((item) => ({
    ingredient: item.querySelector("span:last-of-type").textContent.trim(),
    type: item.querySelector(".badge").textContent.trim(),
  }));

  const data = {
    name: document.getElementById("name").value.trim(),
    skill_level: document.getElementById("skill_level").value,
    dietary_tags,
    allergies,
    ingredient_prefs,
  };

  const res = await updateProfile(data);
  showToast(res.message || "Profile updated!");
});

loadProfile();
