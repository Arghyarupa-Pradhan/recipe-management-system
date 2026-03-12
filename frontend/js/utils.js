// ============================================================
// UTILS - Cache, DOM helpers, toast notifications
// ============================================================

const CACHE_TTL = 60 * 60 * 1000; // 1 hour in ms

export const cache = {
  set(key, data) {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  },
  get(key) {
    const item = localStorage.getItem(key);
    if (!item) return null;
    const { data, timestamp } = JSON.parse(item);
    if (Date.now() - timestamp > CACHE_TTL) {
      localStorage.removeItem(key);
      return null;
    }
    return data;
  },
  clear(key) {
    localStorage.removeItem(key);
  },
};

export const getToken = () => localStorage.getItem("token");
export const getUser = () => JSON.parse(localStorage.getItem("user") || "null");
export const isLoggedIn = () => !!getToken();

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login.html";
};

export const redirectIfNotLoggedIn = () => {
  if (!isLoggedIn()) window.location.href = "/login.html";
};

export const redirectIfLoggedIn = () => {
  if (isLoggedIn()) window.location.href = "/index.html";
};

export function showToast(message, type = "success") {
  const existing = document.querySelector(".toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 10);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

export function renderStars(rating) {
  const full = Math.floor(rating);
  const empty = 5 - full;
  return "★".repeat(full) + "☆".repeat(empty);
}

export function buildRecipeCard(recipe, isSaved = false) {
  const time = recipe.readyInMinutes ? `⏱ ${recipe.readyInMinutes} min` : "";
  const servings = recipe.servings ? `🍽 ${recipe.servings} servings` : "";
  return `
    <div class="recipe-card" data-id="${recipe.id}">
      <img src="${recipe.image || ''}" alt="${recipe.title}" loading="lazy" />
      <div class="card-body">
        <h3>${recipe.title}</h3>
        <p class="card-meta">${time} ${servings}</p>
        <div class="card-actions">
          <a href="/recipe.html?id=${recipe.id}" class="btn btn-primary btn-sm">View Recipe</a>
          <button class="btn btn-outline btn-sm save-btn ${isSaved ? "saved" : ""}"
            data-id="${recipe.id}"
            data-name="${recipe.title}"
            data-thumb="${recipe.image || ''}">
            ${isSaved ? "♥ Saved" : "♡ Save"}
          </button>
        </div>
      </div>
    </div>
  `;
}
