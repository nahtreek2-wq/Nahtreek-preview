export const byId = (id) => document.getElementById(id);

export function element(tag, className, text) {
  const result = document.createElement(tag);
  if (className) result.className = className;
  if (text !== undefined && text !== null) result.textContent = String(text);
  return result;
}

export function setBusy(button, busy, busyLabel = "Working…") {
  if (!button.dataset.label) button.dataset.label = button.textContent;
  button.disabled = busy;
  button.textContent = busy ? busyLabel : button.dataset.label;
  button.setAttribute("aria-busy", String(busy));
}

const TOAST_TONES = ["info", "success", "error"];
let toastTimer = 0;

export function showToast(message, tone = "info") {
  const toast = byId("toast");
  toast.textContent = message;
  toast.classList.remove(...TOAST_TONES.map((name) => `toast-${name}`));
  toast.classList.add("show", `toast-${TOAST_TONES.includes(tone) ? tone : "info"}`);
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), tone === "error" ? 4200 : 2800);
}

// Links from server data must never become javascript: execution sinks.
// Only absolute https URLs and same-origin paths survive; anything else
// renders as plain text instead of a link.
export function safeHttpUrl(value) {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return trimmed;
  if (!/^https:\/\//i.test(trimmed)) return "";
  try {
    return new URL(trimmed).href;
  } catch {
    return "";
  }
}

export function timeAgo(value) {
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return "Date unavailable";
  const seconds = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(then));
}

export function skeletonRows(container, rows = 4) {
  container.replaceChildren();
  for (let index = 0; index < rows; index += 1) {
    const row = element("div", "skeleton-row");
    row.setAttribute("aria-hidden", "true");
    row.append(element("span", "skeleton skeleton-avatar"), element("span", "skeleton skeleton-lines"));
    container.append(row);
  }
}

export function skeletonCards(container, cards = 4) {
  container.replaceChildren();
  for (let index = 0; index < cards; index += 1) {
    const card = element("div", "skeleton-card");
    card.setAttribute("aria-hidden", "true");
    card.append(element("span", "skeleton skeleton-title"), element("span", "skeleton skeleton-value"));
    container.append(card);
  }
}

export async function copyText(value, label = "Value") {
  try {
    await navigator.clipboard.writeText(String(value));
    showToast(`${label} copied`, "success");
  } catch {
    showToast("Copy is not available in this browser", "error");
  }
}

export function copyButton(value, label = "Copy") {
  const button = element("button", "copy-button", "⧉");
  button.type = "button";
  button.title = label;
  button.setAttribute("aria-label", label);
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    void copyText(value, label);
  });
  return button;
}

export function information(label, value) {
  const box = element("div", "info");
  box.append(element("span", "", label), element("strong", "", value || "Not provided"));
  return box;
}

export function section(title, content) {
  const wrapper = element("section", "detail-section");
  wrapper.append(element("h3", "", title), content);
  return wrapper;
}

export function actionButton(label, className, handler, disabled = false) {
  const button = element("button", `button ${className}`, label);
  button.type = "button";
  button.disabled = disabled;
  // Every money and moderation action runs through here, so the lock lives
  // here too: while an async handler is in flight the button stays disabled,
  // which makes double-clicks and double-taps unable to fire a second PATCH.
  button.addEventListener("click", () => {
    const result = handler();
    if (result && typeof result.then === "function") {
      setBusy(button, true);
      const release = () => setBusy(button, false);
      result.then(release, release);
    }
  });
  return button;
}
