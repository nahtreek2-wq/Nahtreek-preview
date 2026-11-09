import { byId, element, skeletonRows, timeAgo } from "./dom.js";

const label = (value) => String(value || "Activity").replaceAll("_", " ").toLowerCase().replace(/^\w/, (letter) => letter.toUpperCase());

export class ActivityController {
  constructor(api) {
    this.api = api;
    this.loaded = false;
  }

  bind() {
    byId("activity-refresh").addEventListener("click", () => this.load(true));
  }

  async load(force = false) {
    if (this.loaded && !force) return;
    byId("activity-status").textContent = "Loading recent activity…";
    skeletonRows(byId("activity-list"), 6);
    try {
      const result = await this.api.get("/admin/activity?limit=100", { ttl: 15_000, force });
      this.render(result.data, result.meta.total);
      this.loaded = true;
    } catch (error) {
      byId("activity-status").textContent = error.message;
    }
  }

  render(items, total) {
    byId("activity-status").textContent = `${total} recorded admin action${total === 1 ? "" : "s"}`;
    const list = byId("activity-list");
    list.replaceChildren();
    if (!items.length) {
      list.append(element("div", "empty-row", "No administrator activity has been recorded yet."));
      return;
    }
    items.forEach((item) => {
      const row = element("article", "activity-row");
      const icon = element("span", "activity-icon", item.action.includes("VERIFICATION") ? "✓" : item.action.includes("USER") ? "◎" : "⚙");
      const copy = element("div", "activity-copy");
      copy.append(
        element("strong", "", label(item.action)),
        element("span", "", `${item.administrator} · ${item.entity}${item.entityId ? ` · ${String(item.entityId).slice(0, 8)}` : ""}`),
      );
      const time = element("time", "", timeAgo(item.createdAt));
      time.dateTime = item.createdAt;
      time.title = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.createdAt));
      row.append(icon, copy, time);
      list.append(row);
    });
  }
}
