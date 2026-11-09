import { actionButton, byId, element, information, section, showToast, skeletonCards, skeletonRows } from "./dom.js";

export const paymentStatusLabel = (status) => String(status || "").replaceAll("_", " ").toLowerCase().replace(/^\w/, (letter) => letter.toUpperCase());
export const formatPaisa = (paisa) => `₹${Math.round((paisa || 0) / 100).toLocaleString("en-IN")}`;
const formatDate = (value) => value ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value)) : "Not yet";

// Money-safe action map. Release retries are idempotent server-side; refunds
// and dispute resolutions always require a written note plus a typed
// confirmation word, so a stray click can never move money.
export function moneyConfirmWord(kind) {
  return kind === "resolve-release" ? "RELEASE" : "REFUND";
}

export function availablePaymentActions(status) {
  if (status === "RELEASE_PENDING") return ["release"];
  if (status === "DISPUTED") return ["resolve-release", "resolve-refund"];
  if (status === "PAID" || status === "HELD") return ["refund"];
  return [];
}

export class PaymentsController {
  constructor(api) {
    this.api = api;
    this.selectedId = "";
    this.selectedPayment = null;
    this.pending = null;
    this.rows = [];
    this.loaded = false;
  }

  bind() {
    byId("payments-refresh").addEventListener("click", () => this.load(true));
    byId("payment-status-filter").addEventListener("change", () => this.load(true));
    byId("money-form").addEventListener("submit", (event) => this.submitDialog(event));
    byId("money-confirm").addEventListener("input", () => {
      if (!this.pending) return;
      byId("money-submit").disabled = byId("money-confirm").value.trim() !== moneyConfirmWord(this.pending.kind);
    });
  }

  async load(force = false) {
    if (this.loaded && !force) return;
    byId("payment-list-status").textContent = "Loading payments…";
    skeletonCards(byId("payments-summary"));
    skeletonRows(byId("payment-list"), 5);
    const query = new URLSearchParams({ limit: "50" });
    const status = byId("payment-status-filter").value;
    if (status) query.set("status", status);
    try {
      const [summary, list] = await Promise.all([
        this.api.get("/payments/admin/summary", { ttl: 20_000, force }),
        this.api.get(`/payments/admin/list?${query}`, { ttl: 15_000, force }),
      ]);
      this.renderSummary(summary);
      this.renderList(list.data, list.meta.total);
      this.rows = list.data;
      this.loaded = true;
      if (this.selectedId && list.data.some((payment) => payment.id === this.selectedId)) await this.select(this.selectedId, false);
    } catch (error) {
      byId("payment-list-status").textContent = error.message;
    }
  }

  renderSummary(rows) {
    const byStatus = Object.fromEntries(rows.map((row) => [row.status, row]));
    const sum = (statuses, field) => statuses.reduce((total, status) => total + (byStatus[status]?.[field] || 0), 0);
    const count = (statuses) => statuses.reduce((total, status) => total + (byStatus[status]?.count || 0), 0);
    const cards = [
      ["Fees collected", formatPaisa(sum(["RELEASED"], "platformFeePaisa")), `${count(["RELEASED"])} released payments`, "success"],
      ["Held now", formatPaisa(sum(["PAID", "HELD"], "professionalAmountPaisa")), "Releases on client confirmation", "navy"],
      ["Needs action", count(["DISPUTED", "RELEASE_PENDING", "REFUND_PENDING"]), "Disputes, stuck releases, refunds", "warning"],
      ["Refunded", formatPaisa(sum(["REFUNDED"], "amountPaisa")), `${count(["REFUNDED"])} full refunds`, "navy"],
    ];
    const summary = byId("payments-summary");
    summary.replaceChildren();
    cards.forEach(([label, value, caption, tone]) => {
      const card = element("article", `metric-card tone-${tone}`);
      card.append(element("span", "metric-label", label), element("strong", "", value), element("small", "", caption));
      summary.append(card);
    });
  }

  renderList(payments, total) {
    byId("payment-list-status").textContent = `${total} payment${total === 1 ? "" : "s"}`;
    const list = byId("payment-list");
    list.replaceChildren();
    if (!payments.length) {
      list.append(element("div", "empty-row", "No payments match this filter."));
      return;
    }
    payments.forEach((payment) => {
      const button = element("button", `queue-item user-item${payment.id === this.selectedId ? " active" : ""}`);
      button.type = "button";
      button.dataset.paymentId = payment.id;
      const copy = element("span", "user-item-copy");
      const name = element("span", "user-name-line");
      name.append(element("strong", "", `${formatPaisa(payment.amountPaisa)} · ${payment.professionalName}`), element("span", `badge ${payment.status}`, paymentStatusLabel(payment.status)));
      copy.append(name, element("small", "", `${payment.clientName || "Direct payment"} · fee ${formatPaisa(payment.platformFeePaisa)}`), element("small", "muted", formatDate(payment.updatedAt)));
      button.append(copy);
      button.addEventListener("click", () => this.select(payment.id));
      list.append(button);
    });
  }

  async select(id, scroll = true) {
    this.selectedId = id;
    document.querySelectorAll("#payment-list .user-item").forEach((item) => item.classList.toggle("active", item.dataset.paymentId === id));
    // The detail renders from the already-loaded rows: no extra request, and
    // no 100-row ceiling that a re-fetch-and-search could never see past.
    this.selectedPayment = this.rows.find((payment) => payment.id === id) || null;
    if (!this.selectedPayment) {
      byId("payment-detail").replaceChildren(element("div", "empty-row error", "That payment is no longer in this list. Refresh to reload."));
      return;
    }
    this.renderDetail(this.selectedPayment);
    if (scroll && window.matchMedia("(max-width: 1100px)").matches) byId("payment-detail").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  renderDetail(payment) {
    const detail = byId("payment-detail");
    detail.replaceChildren();
    const heading = element("div", "user-detail-heading");
    const identityCopy = element("div");
    identityCopy.append(element("h2", "", `${formatPaisa(payment.amountPaisa)} · ${payment.professionalName}`), element("p", "muted", `${payment.clientName || "Direct payment"} · ${payment.serviceRequestId || "no booking link"}`));
    heading.append(identityCopy, element("span", `badge ${payment.status}`, paymentStatusLabel(payment.status)));
    const money = element("div", "info-grid");
    money.append(
      information("Platform fee", formatPaisa(payment.platformFeePaisa)), information("Professional share", formatPaisa(payment.professionalAmountPaisa)),
      information("Paid", formatDate(payment.paidAt)), information("Released", formatDate(payment.releasedAt)),
      information("Refunded", formatDate(payment.refundedAt)), information("Booking status", payment.bookingStatus || "Not linked"),
    );
    const controls = element("div", "account-controls");
    const actions = payment.serviceRequestId ? availablePaymentActions(payment.status) : [];
    if (!payment.serviceRequestId) {
      controls.append(element("p", "control-note", "This payment is not linked to a booking, so no money actions are available."));
    } else if (!actions.length) {
      controls.append(element("p", "control-note", "No actions are available in this state. Completed and refunded payments are final."));
    }
    if (actions.includes("release")) controls.append(actionButton("Retry release", "primary", () => this.runRelease(payment)));
    if (actions.includes("refund")) controls.append(actionButton("Refund in full", "danger", () => this.openDialog("refund", payment)));
    if (actions.includes("resolve-release")) controls.append(actionButton("Resolve: release to pro", "primary", () => this.openDialog("resolve-release", payment)));
    if (actions.includes("resolve-refund")) controls.append(actionButton("Resolve: refund client", "danger", () => this.openDialog("resolve-refund", payment)));
    detail.append(heading, section("Money movement", money), section("Admin actions", controls));
  }

  async runRelease(payment) {
    try {
      const result = await this.api.request("/payments/release", { method: "POST", body: JSON.stringify({ serviceRequestId: payment.serviceRequestId }) });
      this.api.clearCache("/payments");
      this.loaded = false;
      await this.load(true);
      showToast(result.released ? "Professional share released" : `Release pending: ${paymentStatusLabel(result.reason || "retry later")}`, result.released ? "success" : "info");
    } catch (error) {
      showToast(error.message, "error");
    }
  }

  openDialog(kind, payment) {
    this.pending = { kind, payment };
    const titles = { refund: `Refund ${formatPaisa(payment.amountPaisa)}?`, "resolve-release": "Release to the professional?", "resolve-refund": "Refund the client?" };
    const copies = {
      refund: "The full amount returns to the client. This cannot be undone.",
      "resolve-release": "The held professional share releases now. The dispute closes.",
      "resolve-refund": "The full amount returns to the client. The dispute closes.",
    };
    byId("money-dialog-title").textContent = titles[kind];
    byId("money-dialog-copy").textContent = copies[kind];
    byId("money-note").value = "";
    byId("money-error").textContent = "";
    byId("money-confirm").value = "";
    byId("money-confirm").placeholder = `Type ${moneyConfirmWord(kind)} to confirm`;
    byId("money-submit").textContent = kind === "refund" ? "Refund in full" : kind === "resolve-release" ? "Release to pro" : "Refund client";
    byId("money-submit").className = `button ${kind === "resolve-release" ? "primary" : "danger"}`;
    byId("money-submit").disabled = true;
    byId("money-dialog").showModal();
  }

  async submitDialog(event) {
    event.preventDefault();
    if (event.submitter?.value === "cancel" || !this.pending) {
      byId("money-dialog").close();
      return;
    }
    const note = byId("money-note").value.trim();
    if (note.length < 10) {
      byId("money-error").textContent = "Write a clear note of at least 10 characters for the audit trail.";
      return;
    }
    const { kind, payment } = this.pending;
    if (byId("money-confirm").value.trim() !== moneyConfirmWord(kind)) {
      byId("money-error").textContent = `Type ${moneyConfirmWord(kind)} to confirm this money movement.`;
      return;
    }
    const button = byId("money-submit");
    button.disabled = true;
    try {
      if (kind === "refund") {
        await this.api.request("/payments/refund", { method: "POST", body: JSON.stringify({ serviceRequestId: payment.serviceRequestId, reason: note }) });
        showToast("Refund started", "success");
      } else {
        await this.api.request("/payments/resolve", { method: "POST", body: JSON.stringify({ serviceRequestId: payment.serviceRequestId, decision: kind === "resolve-release" ? "release" : "refund", note }) });
        showToast("Dispute resolved", "success");
      }
      byId("money-dialog").close();
      this.api.clearCache("/payments");
      this.loaded = false;
      await this.load(true);
    } catch (error) {
      byId("money-error").textContent = error.message;
    } finally {
      button.disabled = false;
    }
  }
}
