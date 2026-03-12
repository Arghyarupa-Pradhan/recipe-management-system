import { registerUser, loginUser } from "./api.js";
import { showToast, redirectIfLoggedIn } from "./utils.js";

redirectIfLoggedIn();

const isLoginPage = document.getElementById("login-form");
const isRegisterPage = document.getElementById("register-form");

if (isLoginPage) {
  document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    const res = await loginUser({ email, password });
    if (res.token) {
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      showToast("Login successful!");
      setTimeout(() => (window.location.href = "/index.html"), 800);
    } else {
      showToast(res.message || "Login failed.", "error");
    }
  });
}

if (isRegisterPage) {
  document.getElementById("register-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const skill_level = document.getElementById("skill_level").value;

    if (password.length < 6) {
      return showToast("Password must be at least 6 characters.", "error");
    }

    const res = await registerUser({ name, email, password, skill_level });
    if (res.token) {
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      showToast("Account created!");
      setTimeout(() => (window.location.href = "/profile.html"), 800);
    } else {
      showToast(res.message || "Registration failed.", "error");
    }
  });
}
