const yearElement = document.getElementById("year");
const themeToggle = document.getElementById("theme-toggle");
const storedTheme = localStorage.getItem("theme");

if (yearElement) {
  yearElement.textContent = String(new Date().getFullYear());
}

const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const initialTheme = storedTheme || (systemPrefersDark ? "dark" : "light");

document.documentElement.setAttribute("data-theme", initialTheme);

function setToggleLabel(theme) {
  if (!themeToggle) return;
  themeToggle.textContent = theme === "dark" ? "Light" : "Dark";
}

setToggleLabel(initialTheme);

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("theme", nextTheme);
    setToggleLabel(nextTheme);
  });
}
