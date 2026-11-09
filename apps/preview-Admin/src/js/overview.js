import { byId, element, setBusy, skeletonCards, skeletonRows } from "./dom.js";

const number = (value) => new Intl.NumberFormat("en-IN").format(value || 0);

export class OverviewController {
  constructor(api, navigate) {
    this.api = api;
    this.navigate = navigate;
    this.loaded = false;
  }

  bind() {
    byId("overview-refresh").addEventListener("click", () => this.load(true));
  }

  async load(force = false) {
    if (this.loaded && !force) return;
    const button = byId("overview-refresh");
    setBusy(button, true, "Refreshing…");
    skeletonCards(byId("overview-summary"));
    skeletonRows(byId("attention-list"), 3);
    try {
      const [overview, verifications] = await Promise.all([
        this.api.get("/admin/overview", { ttl: 20_000, force }),
        this.api.get("/admin/verifications/summary", { ttl: 20_000, force }),
      ]);
      this.render(overview, verifications);
      this.loaded = true;
    } catch (error) {
      byId("attention-list").replaceChildren(element("div", "empty-row error", error.message));
    } finally {
      setBusy(button, false);
    }
  }

  render(overview, verifications) {
    const reviewCount = (verifications.PENDING || 0) + (verifications.UNDER_REVIEW || 0);
    byId("verification-nav-count").textContent = number(reviewCount);
    const cards = [
      ["Total users", overview.users.total, "Across both applications", "navy"],
      ["Active accounts", overview.users.byStatus.ACTIVE, "Can currently sign in", "success"],
      ["Needs verification", reviewCount, "Professional applications", "warning"],
      ["Service requests", overview.requests.total, "Engineer and home services", "navy"],
    ];
    const summary = byId("overview-summary");
    summary.replaceChildren();
    cards.forEach(([label, value, caption, tone]) => {
      const card = element("article", `metric-card tone-${tone}`);
      card.append(element("span", "metric-label", label), element("strong", "", number(value)), element("small", "", caption));
      summary.append(card);
    });

    const attention = byId("attention-list");
    attention.replaceChildren();
    this.attentionItem(attention, "Professional applications", reviewCount, "Review identity and qualification documents", "verification");
    this.attentionItem(attention, "Suspended accounts", overview.users.byStatus.SUSPENDED, "Review restricted accounts and reactivate when resolved", "users");
    this.attentionItem(attention, "Pending user accounts", overview.users.byStatus.PENDING_VERIFICATION, "Check accounts awaiting verification", "users");

    const roles = byId("role-breakdown");
    roles.replaceChildren();
    [["Clients", "CLIENT"], ["Engineers", "ENGINEER"], ["Service providers", "SERVICE_PROVIDER"]].forEach(([label, key]) => {
      const row = element("div", "role-row");
      row.append(element("span", "", label), element("strong", "", number(overview.users.byRole[key])));
      roles.append(row);
    });
    byId("overview-updated").textContent = `Updated ${new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit" }).format(new Date())}`;
  }

  attentionItem(container, title, count, copy, view) {
    const item = element("button", "attention-item");
    item.type = "button";
    const countNode = element("span", `attention-count${count ? " has-items" : ""}`, number(count));
    const text = element("span", "attention-copy");
    text.append(element("strong", "", title), element("small", "", count ? copy : "Nothing needs attention right now"));
    item.append(countNode, text, element("span", "attention-arrow", "›"));
    item.addEventListener("click", () => this.navigate(view));
    container.append(item);
  }
}
