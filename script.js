const root = document.documentElement;
const body = document.body;
const progressBar = document.getElementById("progressBar");
const backTop = document.getElementById("backTop");
const navLinks = [...document.querySelectorAll(".nav-pill")];
const sections = [...document.querySelectorAll("section[id]")];

const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark" || (!savedTheme && matchMedia("(prefers-color-scheme: dark)").matches)) {
  body.classList.add("dark");
}

document.getElementById("themeToggle").addEventListener("click", () => {
  body.classList.toggle("dark");
  localStorage.setItem("theme", body.classList.contains("dark") ? "dark" : "light");
});

document.querySelectorAll(".swatch").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".swatch").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    root.style.setProperty("--primary", button.dataset.color);
    root.style.setProperty("--secondary", button.dataset.dark);
  });
});

function updateScrollState() {
  const max = document.documentElement.scrollHeight - innerHeight;
  const progress = max > 0 ? scrollY / max : 0;
  progressBar.style.transform = `scaleX(${progress})`;
  backTop.classList.toggle("show", scrollY > innerHeight * 0.33);
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        link.classList.toggle("active", link.dataset.section === entry.target.id);
      });
    });
  },
  { threshold: 0.55 }
);

sections.forEach((section) => observer.observe(section));
addEventListener("scroll", updateScrollState, { passive: true });
addEventListener("resize", updateScrollState);
updateScrollState();

backTop.addEventListener("click", () => {
  scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
});
