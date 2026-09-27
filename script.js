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

const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

// Local time in Singapore, e.g. "6:25 pm". Stays hidden without JavaScript.
const clock = document.getElementById("local-time");
if (clock) {
  const format = new Intl.DateTimeFormat("en-US", {
    hour: "numeric", minute: "2-digit", hour12: true, timeZone: clock.dataset.zone,
  });
  const tick = () => {
    const now = new Date();
    clock.textContent = format.format(now).replace(/\s/g, " ").toLowerCase();
    clock.dateTime = now.toISOString();
  };
  tick();
  clock.parentElement.hidden = false;
  setInterval(tick, 15000);
}
