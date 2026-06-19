const root = document.documentElement;
const body = document.body;
const progressBar = document.getElementById("progressBar");
const backTop = document.getElementById("backTop");
const navLinks = [...document.querySelectorAll(".nav-pill")];
const sections = [...document.querySelectorAll("section[id]")];
const opening = document.getElementById("opening");
const openingEnter = document.getElementById("openingEnter");

body.classList.add("opening-active");

function enterPortfolio() {
  if (!opening || opening.classList.contains("is-leaving")) return;
  opening.classList.add("is-leaving");
  setTimeout(() => {
    opening.classList.add("is-hidden");
    body.classList.remove("opening-active");
  }, 240);
}

openingEnter?.addEventListener("click", enterPortfolio);
opening?.addEventListener("wheel", enterPortfolio, { passive: true, once: true });
opening?.addEventListener("touchmove", enterPortfolio, { passive: true, once: true });
opening?.addEventListener("keydown", (event) => {
  if (["Enter", " ", "ArrowDown", "PageDown"].includes(event.key)) enterPortfolio();
});

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
    root.style.setProperty("--accent-gradient", button.dataset.gradient || "linear-gradient(135deg, " + button.dataset.color + ", " + button.dataset.dark + ")");
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
  { threshold: 0.35 }
);

sections.forEach((section) => observer.observe(section));
addEventListener("scroll", updateScrollState, { passive: true });
addEventListener("resize", updateScrollState);
updateScrollState();

backTop.addEventListener("click", () => {
  scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
});
const menuToggle = document.getElementById("menuToggle");
const topNav = document.querySelector(".top-nav");
const mobileMenu = document.getElementById("mobileMenu");

function closeMenu() {
  topNav?.classList.remove("menu-open");
  menuToggle?.setAttribute("aria-expanded", "false");
}

menuToggle?.addEventListener("click", () => {
  const isOpen = topNav?.classList.toggle("menu-open");
  menuToggle.setAttribute("aria-expanded", String(Boolean(isOpen)));
});

mobileMenu?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

document.addEventListener("click", (event) => {
  if (topNav && !topNav.contains(event.target)) closeMenu();
});
const cursorField = document.getElementById("cursorField");

if (cursorField) {
  const context = cursorField.getContext("2d", { alpha: true });
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const coarsePointer = matchMedia("(pointer: coarse)");
  const pointer = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    glowX: innerWidth * 0.7,
    glowY: innerHeight * 0.5,
    targetGlowX: innerWidth * 0.7,
    targetGlowY: innerHeight * 0.5,
  };
  let points = [];
  let connections = [];
  let frameId = 0;
  let width = 0;
  let height = 0;
  let dpr = 1;

  function buildSphere() {
    const count = coarsePointer.matches ? 42 : Math.min(100, Math.max(72, Math.floor(width / 16)));
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    points = Array.from({ length: count }, (_, index) => {
      const y = 1 - (index / (count - 1)) * 2;
      const radius = Math.sqrt(1 - y * y);
      const theta = goldenAngle * index;
      return {
        x: Math.cos(theta) * radius,
        y,
        z: Math.sin(theta) * radius,
        color: index % 4 === 0 ? "20,184,166" : "141,84,255",
      };
    });

    connections = [];
    points.forEach((point, index) => {
      const nearest = points
        .map((other, otherIndex) => ({
          index: otherIndex,
          distance: Math.hypot(point.x - other.x, point.y - other.y, point.z - other.z),
        }))
        .filter((item) => item.index !== index)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 1);

      nearest.forEach((item) => {
        if (index < item.index) connections.push([index, item.index]);
      });
    });
  }

  function resizeCursorField() {
    width = innerWidth;
    height = innerHeight;
    dpr = Math.min(devicePixelRatio || 1, 1.25);
    cursorField.width = Math.round(width * dpr);
    cursorField.height = Math.round(height * dpr);
    cursorField.style.width = width + "px";
    cursorField.style.height = height + "px";
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildSphere();
    drawCursorField();
  }

  function updatePointer(event) {
    if (!body.classList.contains("bg-mode-particles")) return;
    pointer.targetX = (event.clientX / width - 0.5) * 0.7;
    pointer.targetY = (event.clientY / height - 0.5) * 0.55;
    pointer.targetGlowX = event.clientX;
    pointer.targetGlowY = event.clientY;
    startPointerAnimation();
  }

  function drawCursorField() {
    context.clearRect(0, 0, width, height);

    const centerX = (width > 900 ? width * 0.7 : width * 0.5) + pointer.x * 36;
    const centerY = height * 0.52 + pointer.y * 28;
    const sphereRadius = Math.min(width, height) * (width > 900 ? 0.34 : 0.3);
    const cosY = Math.cos(pointer.x);
    const sinY = Math.sin(pointer.x);
    const cosX = Math.cos(pointer.y);
    const sinX = Math.sin(pointer.y);
    const darkMode = document.body.classList.contains("dark");

    const cursorGlow = context.createRadialGradient(
      pointer.glowX,
      pointer.glowY,
      0,
      pointer.glowX,
      pointer.glowY,
      Math.min(260, sphereRadius)
    );
    cursorGlow.addColorStop(0, darkMode ? "rgba(20,184,166,0.12)" : "rgba(20,184,166,0.07)");
    cursorGlow.addColorStop(0.45, darkMode ? "rgba(141,84,255,0.08)" : "rgba(141,84,255,0.045)");
    cursorGlow.addColorStop(1, "rgba(141,84,255,0)");
    context.fillStyle = cursorGlow;
    context.fillRect(0, 0, width, height);

    const sphereGlow = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, sphereRadius * 1.35);
    sphereGlow.addColorStop(0, darkMode ? "rgba(141,84,255,0.12)" : "rgba(141,84,255,0.065)");
    sphereGlow.addColorStop(0.65, darkMode ? "rgba(20,184,166,0.035)" : "rgba(20,184,166,0.02)");
    sphereGlow.addColorStop(1, "rgba(141,84,255,0)");
    context.fillStyle = sphereGlow;
    context.fillRect(centerX - sphereRadius * 1.4, centerY - sphereRadius * 1.4, sphereRadius * 2.8, sphereRadius * 2.8);

    const projected = points.map((point) => {
      const rotatedX = point.x * cosY - point.z * sinY;
      const rotatedZ = point.x * sinY + point.z * cosY;
      const rotatedY = point.y * cosX - rotatedZ * sinX;
      const depth = point.y * sinX + rotatedZ * cosX;
      const scale = 0.78 + (depth + 1) * 0.22;

      return {
        x: centerX + rotatedX * sphereRadius * scale,
        y: centerY + rotatedY * sphereRadius * scale,
        depth,
        color: point.color,
      };
    });

    context.globalCompositeOperation = darkMode ? "lighter" : "source-over";
    connections.forEach(([fromIndex, toIndex]) => {
      const from = projected[fromIndex];
      const to = projected[toIndex];
      const depth = (from.depth + to.depth + 2) / 4;
      if (depth < 0.22) return;

      context.beginPath();
      context.moveTo(from.x, from.y);
      context.lineTo(to.x, to.y);
      context.strokeStyle = "rgba(141,84,255," + (depth * 0.2) + ")";
      context.lineWidth = 0.45 + depth * 0.55;
      context.stroke();
    });

    [...projected].sort((a, b) => a.depth - b.depth).forEach((point) => {
      const normalizedDepth = (point.depth + 1) / 2;
      const size = 0.75 + normalizedDepth * 2.6;
      const alpha = 0.14 + normalizedDepth * 0.72;

      context.beginPath();
      context.arc(point.x, point.y, size, 0, Math.PI * 2);
      context.fillStyle = "rgba(" + point.color + "," + alpha + ")";
      context.shadowBlur = 0;
      context.fill();

      if (normalizedDepth > 0.78) {
        context.beginPath();
        context.arc(point.x, point.y, size * 2.2, 0, Math.PI * 2);
        context.fillStyle = "rgba(" + point.color + ",0.07)";
        context.fill();
      }
    });

    context.shadowBlur = 0;
    context.globalCompositeOperation = "source-over";
  }

  function animateToPointer() {
    pointer.x += (pointer.targetX - pointer.x) * 0.075;
    pointer.y += (pointer.targetY - pointer.y) * 0.075;
    pointer.glowX += (pointer.targetGlowX - pointer.glowX) * 0.12;
    pointer.glowY += (pointer.targetGlowY - pointer.glowY) * 0.12;
    drawCursorField();

    const remaining =
      Math.abs(pointer.targetX - pointer.x) +
      Math.abs(pointer.targetY - pointer.y) +
      Math.abs(pointer.targetGlowX - pointer.glowX) / Math.max(width, 1) +
      Math.abs(pointer.targetGlowY - pointer.glowY) / Math.max(height, 1);

    if (remaining > 0.002 && !document.hidden) {
      frameId = requestAnimationFrame(animateToPointer);
    } else {
      frameId = 0;
    }
  }

  function startPointerAnimation() {
    if (reducedMotion.matches || coarsePointer.matches || frameId) return;
    frameId = requestAnimationFrame(animateToPointer);
  }

  resizeCursorField();

  if (!coarsePointer.matches && !reducedMotion.matches) {
    addEventListener("pointermove", updatePointer, { passive: true });
  }

  addEventListener("resize", resizeCursorField, { passive: true });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(frameId);
      frameId = 0;
    } else {
      drawCursorField();
    }
  });

  reducedMotion.addEventListener?.("change", () => {
    cancelAnimationFrame(frameId);
    frameId = 0;
    drawCursorField();
  });
}
const skillsShowcase = document.querySelector(".skills-showcase");
const skillsStage = document.querySelector(".skills-stage");
const skillsTrack = document.querySelector(".skills-track");
const skillsReducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const skillsMobile = matchMedia("(max-width: 760px)");

function updateSkillsShowcase() {
  if (!skillsShowcase || !skillsStage || !skillsTrack) return;

  if (skillsMobile.matches || skillsReducedMotion.matches) {
    skillsShowcase.classList.add("is-grid");
    skillsTrack.style.transform = "none";
    return;
  }

  const rect = skillsShowcase.getBoundingClientRect();
  const scrollDistance = Math.max(skillsShowcase.offsetHeight - innerHeight, 1);
  const progress = Math.min(1, Math.max(0, -rect.top / scrollDistance));
  const gridStart = 0.72;

  if (progress >= gridStart) {
    skillsShowcase.classList.add("is-grid");
    skillsTrack.style.transform = "none";
    return;
  }

  skillsShowcase.classList.remove("is-grid");
  const travelProgress = progress / gridStart;
  const startX = skillsStage.clientWidth * 0.48;
  const overflow = Math.max(skillsTrack.scrollWidth - skillsStage.clientWidth, 0);
  const endX = -(overflow + skillsStage.clientWidth * 0.18);
  const currentX = startX + (endX - startX) * travelProgress;
  skillsTrack.style.transform = "translate3d(" + currentX + "px, 0, 0)";
}

addEventListener("scroll", updateSkillsShowcase, { passive: true });
addEventListener("resize", updateSkillsShowcase, { passive: true });
skillsMobile.addEventListener?.("change", updateSkillsShowcase);
skillsReducedMotion.addEventListener?.("change", updateSkillsShowcase);
updateSkillsShowcase();
const contactShowcase = document.querySelector(".contact-showcase");
const contactReducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const contactMobile = matchMedia("(max-width: 760px)");

function updateContactShowcase() {
  if (!contactShowcase) return;

  if (contactMobile.matches || contactReducedMotion.matches) {
    contactShowcase.classList.add("is-active");
    contactShowcase.style.setProperty("--contact-progress", "1");
    return;
  }

  const rect = contactShowcase.getBoundingClientRect();
  const scrollDistance = Math.max(contactShowcase.offsetHeight - innerHeight, 1);
  const progress = Math.min(1, Math.max(0, -rect.top / scrollDistance));
  contactShowcase.style.setProperty("--contact-progress", progress.toFixed(3));
  contactShowcase.classList.toggle("is-active", progress > 0.08 || rect.top < innerHeight * 0.72);
}

addEventListener("scroll", updateContactShowcase, { passive: true });
addEventListener("resize", updateContactShowcase, { passive: true });
contactMobile.addEventListener?.("change", updateContactShowcase);
contactReducedMotion.addEventListener?.("change", updateContactShowcase);
updateContactShowcase();
const consoleTitleStyle = [
  "display:block",
  "padding:18px 24px",
  "border-radius:14px",
  "color:#ffffff",
  "background:linear-gradient(120deg,#8d54ff,#4d179a 58%,#14b8a6)",
  "font:800 28px/1.1 system-ui",
  "letter-spacing:-1px",
  "text-shadow:0 2px 10px rgba(0,0,0,.24)",
].join(";");

const consoleNoteStyle = [
  "color:#8d54ff",
  "font:700 14px/1.6 system-ui",
].join(";");

console.log("%cYOU FOUND THE BACKSTAGE ✦", consoleTitleStyle);
console.log(
  "%cNice instinct. Curious people build the interesting parts of the web.",
  consoleNoteStyle
);
console.log(
  "%cTry: portfolio.secret()  •  portfolio.matrix()  •  portfolio.skills()  •  portfolio.hireMe()",
  "color:#14b8a6;font:600 12px/1.8 ui-monospace,monospace"
);

function launchInspectSurprise() {
  if (document.querySelector(".inspect-surprise")) return "The secret is already awake ✨";

  const surprise = document.createElement("div");
  surprise.className = "inspect-surprise";
  surprise.setAttribute("aria-hidden", "true");
  surprise.innerHTML =
    '<div class="inspect-surprise-message">' +
      '<small>Secret layer unlocked</small>' +
      '<strong>Curiosity<br>looks good<br>on you.</strong>' +
      '<em>You inspect interfaces. I build them. We would probably get along.</em>' +
    '</div>';

  for (let index = 0; index < 26; index += 1) {
    const piece = document.createElement("i");
    piece.className = "inspect-confetti";
    piece.style.setProperty("--x", ((index * 37) % 96 + 2) + "vw");
    piece.style.setProperty("--delay", ((index % 9) * 0.06) + "s");
    piece.style.setProperty("--drift", (((index % 7) - 3) * 9) + "vw");
    piece.style.setProperty("--hue", String((index * 43 + 180) % 360));
    surprise.appendChild(piece);
  }

  document.body.appendChild(surprise);
  setTimeout(() => surprise.remove(), 3300);
  return "✨ Secret unlocked on the page.";
}


function launchMatrixSurprise() {
  if (document.querySelector(".inspect-matrix")) return "Matrix mode is already running.";

  const matrix = document.createElement("div");
  matrix.className = "inspect-matrix";
  matrix.setAttribute("aria-hidden", "true");
  matrix.innerHTML =
    '<div class="inspect-matrix-title">' +
      '<small>Developer access granted</small>' +
      '<strong>YOU SEE<br>THE CODE.</strong>' +
      '<em>The best interfaces reward the people curious enough to look closer.</em>' +
    '</div>';

  const symbols = "01{}[]&lt;/&gt;JSREACTNODEMERN";
  for (let column = 0; column < 28; column += 1) {
    const rain = document.createElement("span");
    rain.className = "matrix-column";
    rain.style.setProperty("--left", ((column * 37) % 100) + "%");
    rain.style.setProperty("--speed", (2.4 + (column % 6) * 0.35) + "s");
    rain.style.setProperty("--delay", (-0.15 * (column % 11)) + "s");
    let characters = "";
    for (let charIndex = 0; charIndex < 42; charIndex += 1) {
      characters += symbols[(column * 7 + charIndex * 11) % symbols.length] + " ";
    }
    rain.textContent = characters;
    matrix.appendChild(rain);
  }

  document.body.appendChild(matrix);
  setTimeout(() => matrix.remove(), 4300);
  return "Green-code mode activated.";
}
Object.defineProperty(window, "portfolio", {
  configurable: false,
  enumerable: true,
  value: Object.freeze({
    hello() {
      console.log(
        "%cHey, explorer! I am Tholeti Durgeswara Rao — Full Stack Developer.",
        "color:#ffffff;background:#141313;padding:9px 12px;border-left:4px solid #8d54ff;font:600 13px system-ui"
      );
      return "Thanks for visiting the code side of my portfolio.";
    },
    skills() {
      const skills = [
        "HTML5", "CSS3", "JavaScript", "React", "Node.js", "Express",
        "MongoDB", "Git", "GitHub", "Vercel", "Netlify", "Postman"
      ];
      console.table(skills.map((skill, index) => ({ number: index + 1, skill })));
      return "Built with curiosity, tested with coffee.";
    },
    matrix: launchMatrixSurprise,
    hireMe() {
      console.log(
        "%cLET’S BUILD SOMETHING MEMORABLE",
        "color:#fff;background:linear-gradient(90deg,#8d54ff,#14b8a6);padding:12px 16px;border-radius:8px;font:800 16px system-ui"
      );
      console.table({
        LinkedIn: "linkedin.com/in/tholeti-eswar57",
        GitHub: "github.com/ESWAR8357",
        Portfolio: "eswarprofile7.netlify.app",
        Discord: "tdreswar3967",
      });
      return "The contact section is waiting for you.";
    },
    source() {
      return "Readable code is a love letter to the next developer.";
    },
    secret: launchInspectSurprise,
  }),
});
const skillsSticky = document.querySelector(".skills-sticky");
const skillsPointerGlow = document.querySelector(".skills-pointer-glow");

if (skillsSticky && skillsPointerGlow && !matchMedia("(pointer: coarse)").matches) {
  let skillsPointerFrame = 0;
  let skillsPointerX = 0;
  let skillsPointerY = 0;

  skillsSticky.addEventListener("pointermove", (event) => {
    const bounds = skillsSticky.getBoundingClientRect();
    skillsPointerX = event.clientX - bounds.left;
    skillsPointerY = event.clientY - bounds.top;
    if (skillsPointerFrame) return;
    skillsPointerFrame = requestAnimationFrame(() => {
      skillsPointerGlow.style.setProperty("--pointer-x", skillsPointerX + "px");
      skillsPointerGlow.style.setProperty("--pointer-y", skillsPointerY + "px");
      skillsSticky.classList.add("is-pointer-active");
      skillsPointerFrame = 0;
    });
  }, { passive: true });

  skillsSticky.addEventListener("pointerleave", () => {
    skillsSticky.classList.remove("is-pointer-active");
  });
}
const backgroundModeButtons = [...document.querySelectorAll("[data-bg-mode]")];
const backgroundModes = ["particles", "silk", "rays", "minimal"];

function setBackgroundMode(mode, persist = true) {
  const safeMode = backgroundModes.includes(mode) ? mode : "particles";
  backgroundModes.forEach((item) => body.classList.remove("bg-mode-" + item));
  body.classList.add("bg-mode-" + safeMode);

  backgroundModeButtons.forEach((button) => {
    const active = button.dataset.bgMode === safeMode;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  if (persist) localStorage.setItem("background-mode", safeMode);
}

backgroundModeButtons.forEach((button) => {
  button.addEventListener("click", () => setBackgroundMode(button.dataset.bgMode));
});

setBackgroundMode(localStorage.getItem("background-mode") || "particles", false);
