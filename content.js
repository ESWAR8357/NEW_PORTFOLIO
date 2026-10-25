function getContentValue(content, path) {
  const value = path.split(".").reduce((current, key) => current?.[key], content);
  if (typeof value !== "string") {
    throw new Error(`Missing text content for "${path}" in content.json.`);
  }
  return value;
}

async function loadPortfolioContent() {
  const response = await fetch("content.json");
  if (!response.ok) {
    throw new Error(`Could not load content.json (${response.status}).`);
  }

  const content = await response.json();
  document.querySelectorAll("[data-content]").forEach((element) => {
    element.textContent = getContentValue(content, element.dataset.content);
  });

  const contentAttributes = {
    "data-content-aria-label": "aria-label",
    "data-content-alt": "alt",
    "data-content-content": "content",
    "data-content-data-label": "data-label",
    "data-content-data-tooltip": "data-tooltip",
    "data-content-placeholder": "placeholder",
  };

  Object.entries(contentAttributes).forEach(([dataAttribute, targetAttribute]) => {
    document.querySelectorAll(`[${dataAttribute}]`).forEach((element) => {
      element.setAttribute(targetAttribute, getContentValue(content, element.getAttribute(dataAttribute)));
      element.removeAttribute(dataAttribute);
    });
  });

  window.portfolioContent = content;
  document.getElementById("openingEnter")?.removeAttribute("disabled");
  document.dispatchEvent(new Event("portfolio:content-ready"));
  return content;
}

window.portfolioContentReady = loadPortfolioContent().catch((error) => {
  console.error("Portfolio content failed to load:", error);
  const feedback = document.getElementById("challengeFeedback");
  const challenge = document.getElementById("decryptChallenge");
  if (feedback && challenge) {
    feedback.textContent = "Unable to load portfolio content. Please refresh and try again.";
    challenge.hidden = false;
    document.getElementById("opening")?.classList.add("challenge-active");
  }
  return null;
});
