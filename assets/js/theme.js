const themeToggle = document.getElementById("theme-toggle");
const yearElement = document.getElementById("year");

if (yearElement) {
  yearElement.textContent = String(new Date().getFullYear());
}

function setToggleLabel(theme) {
  if (!themeToggle) return;
  themeToggle.textContent = theme === "dark" ? "Light" : "Dark";
}

setToggleLabel(document.documentElement.getAttribute("data-theme") || "light");

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const current =
      document.documentElement.getAttribute("data-theme") || "light";
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    setToggleLabel(next);
  });
}
