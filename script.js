const toggle = document.getElementById("theme-toggle");
const label = document.getElementById("theme-label");
const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
let manualChoice = false;
try { manualChoice = ["light", "dark"].includes(localStorage.getItem("theme")); } catch {}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const next = theme === "dark" ? "light" : "dark";
  label.textContent = next === "dark" ? "Dark" : "Light";
  toggle.setAttribute("aria-label", `Switch to ${next} mode`);
}

if (toggle && label) {
  applyTheme(document.documentElement.dataset.theme);
  toggle.hidden = false;
  toggle.addEventListener("click", () => {
    const theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(theme);
    manualChoice = true;
    try { localStorage.setItem("theme", theme); } catch {}
  });
  systemTheme.addEventListener("change", (event) => {
    if (!manualChoice) applyTheme(event.matches ? "dark" : "light");
  });
}

document.getElementById("year").textContent = new Date().getFullYear();
