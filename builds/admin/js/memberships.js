import { byId, element, information, section, skeletonCards, skeletonRows } from "./dom.js";

export const membershipStatusLabel = (status) => String(status || "").replaceAll("_", " ").toLowerCase().replace(/^\w/, (letter) => letter.toUpperCase());
export const formatPaisa = (paisa) => `₹${Math.round((paisa || 0) / 100).toLocaleString("en-IN")}`;
const formatDate = (value) => value ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value)) : "Not yet";
export const aiSummaryCards = (summary) => [
  ["Active AI subscribers", summary.active, `${formatPaisa(summary.mrrPaisa)} monthly recurring`, "success"],
  ["AI plan price", formatPaisa(summary.feePaisa), "per month, Home app", "navy"],
];
export const aiEngineLabel = (health) => {
  if (!health) return "AI engine: checking…";
  if (health.engine === "guided-fallback") return "AI engine: guided mode (no hosted model)";
  const vision = {supported: "photo vision on", unsupported: "photo vision off", untested: "photo vision untested", error: "photo vision error"}[health.vision] || "photo vision unknown";
  return health.ok
    ? `AI engine: live (${health.model || "hosted model"}, ${health.latencyMs}ms) · ${vision}`
    : `AI engine: unreachable — guided fallback serving · ${vision}`;
};

export class MembershipsController {
  constructor(api) {
    this.api = api;
    this.selectedId = "";
    this.rows = [];
    this.aiRows = [];
    this.loaded = false;
  }

  bind() {
    byId("memberships-refresh").addEventListener("click", () => this.load(true));
    byId("membership-status-filter").addEventListener("change", () => this.load(true));
    byId("ai-membership-status-filter").addEventListener("change", () => this.load(true));
  }

  async load(force = false) {
    if (this.loaded && !force) return;
    byId("membership-list-status").textContent = "Loading memberships…";
    byId("ai-membership-list-status").textContent = "Loading AI subscriptions…";
    skeletonCards(byId("memberships-summary"));
    skeletonRows(byId("membership-list"), 4);
    skeletonCards(byId("ai-memberships-summary"), 2);
    skeletonRows(byId("ai-membership-list"), 3);
    const query = new URLSearchParams({ limit: "50" });
    const status = byId("membership-status-filter").value;
    if (status) query.set("status", status);
    const aiQuery = new URLSearchParams({ pageSize: "50" });
    const aiStatus = byId("ai-membership-status-filter").value;
    if (aiStatus) aiQuery.set("status", aiStatus);
    try {
      const [summary, list, aiSummary, aiList, aiHealth] = await Promise.all([
        this.api.get("/memberships/admin/summary", { ttl: 20_000, force }),
        this.api.get(`/memberships/admin/list?${query}`, { ttl: 15_000, force }),
        this.api.get("/ai-billing/admin/summary", { ttl: 20_000, force }),
        this.api.get(`/ai-billing/admin/list?${aiQuery}`, { ttl: 15_000, force }),
        this.api.get("/ai/admin/health", { ttl: 30_000, force }).catch(() => null),
      ]);
      this.renderSummary(summary);
      this.renderList(list.data, list.meta.total);
      this.rows = list.data;
      this.renderAiSummary(aiSummary);
      byId("ai-engine-status").textContent = aiEngineLabel(aiHealth);
      this.renderAiList(aiList.rows, aiList.total);
      this.aiRows = aiList.rows.map((row) => ({ ...row, product: "ai" }));
      this.loaded = true;
      const all = [...list.data, ...this.aiRows];
      if (this.selectedId && all.some((row) => row.id === this.selectedId)) await this.select(this.selectedId, false);
    } catch (error) {
      byId("membership-list-status").textContent = error.message;
      byId("ai-membership-list-status").textContent = error.message;
    }
  }

  renderSummary(summary) {
    const count = (status) => summary.byStatus.find((row) => row.status === status)?.count || 0;
    const cards = [
      ["Active members", summary.activeSubscriptions, `${formatPaisa(summary.monthlyRecurringPaisa)} monthly recurring`, "success"],
      ["Past due", count("PAST_DUE"), "Failed renewals in the paid tail", "warning"],
      ["Paused", count("PAUSED"), "No perks while paused", "navy"],
      ["Ended", count("CANCELLED") + count("EXPIRED"), "Cancelled and expired", "navy"],
    ];
    const target = byId("memberships-summary");
    target.replaceChildren();
    cards.forEach(([label, value, caption, tone]) => {
      const card = element("article", `metric-card tone-${tone}`);
      card.append(element("span", "metric-label", label), element("strong", "", value), element("small", "", caption));
      target.append(card);
    });
  }

  renderList(rows, total) {
    byId("membership-list-status").textContent = `${total} membership${total === 1 ? "" : "s"}`;
    const list = byId("membership-list");
    list.replaceChildren();
    if (!rows.length) {
      list.append(element("div", "empty-row", "No memberships match this filter."));
      return;
    }
    rows.forEach((row) => {
      const button = element("button", `queue-item user-item${row.id === this.selectedId ? " active" : ""}`);
      button.type = "button";
      button.dataset.membershipId = row.id;
      const copy = element("span", "user-item-copy");
      const name = element("span", "user-name-line");
      name.append(element("strong", "", row.professionalName), element("span", `badge ${row.status}`, membershipStatusLabel(row.status)));
      copy.append(name, element("small", "", row.phoneNumber || row.email || "No contact"), element("small", "muted", row.effective ? `Benefits through ${formatDate(row.currentPeriodEnd)}` : "No active benefits"));
      button.append(copy);
      button.addEventListener("click", () => this.select(row.id));
      list.append(button);
    });
  }

  renderAiSummary(summary) {
    const target = byId("ai-memberships-summary");
    target.replaceChildren();
    aiSummaryCards(summary).forEach(([label, value, caption, tone]) => {
      const card = element("article", `metric-card tone-${tone}`);
      card.append(element("span", "metric-label", label), element("strong", "", value), element("small", "", caption));
      target.append(card);
    });
  }

  renderAiList(rows, total) {
    byId("ai-membership-list-status").textContent = `${total} AI subscription${total === 1 ? "" : "s"}`;
    const list = byId("ai-membership-list");
    list.replaceChildren();
    if (!rows.length) {
      list.append(element("div", "empty-row", "No AI subscriptions match this filter."));
      return;
    }
    rows.forEach((row) => {
      const button = element("button", `queue-item user-item${row.id === this.selectedId ? " active" : ""}`);
      button.type = "button";
      button.dataset.membershipId = row.id;
      const copy = element("span", "user-item-copy");
      const name = element("span", "user-name-line");
      name.append(element("strong", "", row.displayName || "Home user"), element("span", `badge ${row.status}`, membershipStatusLabel(row.status)));
      copy.append(name, element("small", "", row.phoneNumber || row.email || "No contact"), element("small", "muted", row.effective ? `Unlimited AI through ${formatDate(row.currentPeriodEnd)}` : "No active AI access"));
      button.append(copy);
      button.addEventListener("click", () => this.select(row.id));
      list.append(button);
    });
  }

  async select(id, scroll = true) {
    this.selectedId = id;
    document.querySelectorAll("#membership-list .user-item, #ai-membership-list .user-item").forEach((item) => item.classList.toggle("active", item.dataset.membershipId === id));
    // The detail renders from the already-loaded rows: no extra request, and
    // no 100-row ceiling that a re-fetch-and-search could never see past.
    const row = this.rows.find((item) => item.id === id) || this.aiRows.find((item) => item.id === id) || null;
    if (!row) {
      byId("membership-detail").replaceChildren(element("div", "empty-row error", "That membership is no longer in this list. Refresh to reload."));
      return;
    }
    this.renderDetail(row);
    if (scroll && window.matchMedia("(max-width: 1100px)").matches) byId("membership-detail").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  renderDetail(row) {
    const detail = byId("membership-detail");
    detail.replaceChildren();
    if (row.product === "ai") {
      const heading = element("div", "user-detail-heading");
      const identityCopy = element("div");
      identityCopy.append(element("h2", "", row.displayName || "Home user"), element("p", "muted", row.phoneNumber || row.email || "No contact"));
      heading.append(identityCopy, element("span", `badge ${row.status}`, membershipStatusLabel(row.status)));
      const info = element("div", "info-grid");
      info.append(
        information("AI access active", row.effective ? "Yes" : "No"), information("Renews or ends", formatDate(row.currentPeriodEnd)),
        information("Cancel at period end", row.cancelAtPeriodEnd ? "Yes" : "No"), information("Last charge", formatDate(row.lastChargeAt)),
        information("Plan", "NAHTREEK AI · ₹99/month"), information("Contact", row.email || row.phoneNumber),
      );
      const note = element("p", "control-note", "AI subscriptions change only from the Home app or billing webhooks. There are no admin money actions here by design.");
      detail.append(heading, section("Subscription", info), section("Notes", note));
      return;
    }
    const heading = element("div", "user-detail-heading");
    const identityCopy = element("div");
    identityCopy.append(element("h2", "", row.professionalName), element("p", "muted", row.phoneNumber || row.email || "No contact"));
    heading.append(identityCopy, element("span", `badge ${row.status}`, membershipStatusLabel(row.status)));
    const info = element("div", "info-grid");
    info.append(
      information("Benefits active", row.effective ? "Yes" : "No"), information("Renews or ends", formatDate(row.currentPeriodEnd)),
      information("Cancel at period end", row.cancelAtPeriodEnd ? "Yes" : "No"), information("Last charge", formatDate(row.lastChargeAt)),
      information("Subscription", row.providerSubscriptionId || "Never subscribed"), information("Contact", row.email || row.phoneNumber),
    );
    const note = element("p", "control-note", "Memberships change only from the professional app or billing webhooks. There are no admin money actions here by design.");
    detail.append(heading, section("Subscription", info), section("Notes", note));
  }
}
