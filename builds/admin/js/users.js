import { actionButton, byId, copyButton, element, information, section, showToast, skeletonRows } from "./dom.js";

const roleLabel = (roles) => roles.includes("ENGINEER") ? "Engineer" : roles.includes("SERVICE_PROVIDER") ? "Service provider" : "Client";
const statusLabel = (status) => status.replaceAll("_", " ").toLowerCase().replace(/^\w/, (letter) => letter.toUpperCase());

export class UsersController {
  constructor(api) {
    this.api = api;
    this.selectedId = "";
    this.selectedUser = null;
    this.pendingAction = null;
    this.searchTimer = null;
    this.loaded = false;
  }

  bind() {
    byId("users-refresh").addEventListener("click", () => this.load(true));
    ["user-role-filter", "user-status-filter"].forEach((id) => byId(id).addEventListener("change", () => this.load(true)));
    byId("user-search").addEventListener("input", () => {
      window.clearTimeout(this.searchTimer);
      this.searchTimer = window.setTimeout(() => this.load(true), 250);
    });
    byId("account-form").addEventListener("submit", (event) => this.submitAction(event));
    byId("user-edit-form").addEventListener("submit", (event) => this.submitEdit(event));
  }

  async load(force = false) {
    if (this.loaded && !force) return;
    byId("user-list-status").textContent = "Loading users…";
    skeletonRows(byId("user-list"), 6);
    const query = new URLSearchParams({ limit: "100" });
    const role = byId("user-role-filter").value;
    const status = byId("user-status-filter").value;
    const search = byId("user-search").value.trim();
    if (role) query.set("role", role);
    if (status) query.set("status", status);
    if (search) query.set("search", search);
    try {
      const result = await this.api.get(`/admin/users?${query}`, { ttl: 15_000, force });
      this.renderList(result.data, result.meta.total);
      this.loaded = true;
      if (this.selectedId && result.data.some((user) => user.id === this.selectedId)) await this.select(this.selectedId, false);
    } catch (error) {
      byId("user-list-status").textContent = error.message;
    }
  }

  renderList(users, total) {
    byId("user-list-status").textContent = `${total} user${total === 1 ? "" : "s"}`;
    const list = byId("user-list");
    list.replaceChildren();
    if (!users.length) {
      list.append(element("div", "empty-row", "No users match these filters."));
      return;
    }
    users.forEach((user) => {
      const button = element("button", `queue-item user-item${user.id === this.selectedId ? " active" : ""}`);
      button.type = "button";
      button.dataset.userId = user.id;
      const avatar = element("span", "user-avatar", this.initials(user.fullName));
      const copy = element("span", "user-item-copy");
      const name = element("span", "user-name-line");
      name.append(element("strong", "", user.fullName), element("span", `badge ${user.status}`, statusLabel(user.status)));
      copy.append(name, element("small", "", `${roleLabel(user.roles)} · ${user.location || "Location not provided"}`), element("small", "muted", user.email || user.phoneNumber));
      button.append(avatar, copy);
      button.addEventListener("click", () => this.select(user.id));
      list.append(button);
    });
  }

  async select(id, scroll = true) {
    this.selectedId = id;
    document.querySelectorAll("#user-list .user-item").forEach((item) => item.classList.toggle("active", item.dataset.userId === id));
    byId("user-detail").replaceChildren(element("div", "empty-row", "Loading account…"));
    try {
      this.selectedUser = await this.api.get(`/admin/users/${id}`, { ttl: 30_000 });
      this.renderDetail(this.selectedUser);
      if (scroll && window.matchMedia("(max-width: 1100px)").matches) byId("user-detail").scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
      byId("user-detail").replaceChildren(element("div", "empty-row error", error.message));
    }
  }

  renderDetail(user) {
    const detail = byId("user-detail");
    detail.replaceChildren();
    const heading = element("div", "user-detail-heading");
    const identity = element("div", "user-identity");
    const identityCopy = element("div");
    identityCopy.append(element("h2", "", user.fullName), element("p", "muted", `${roleLabel(user.roles)} · ${user.location || "Location not provided"}`));
    identity.append(element("span", "user-avatar large", this.initials(user.fullName)), identityCopy);
    const headingActions = element("div", "user-heading-actions");
    headingActions.append(element("span", `badge ${user.status}`, statusLabel(user.status)), actionButton("Edit details", "secondary", () => this.openEdit()));
    heading.append(identity, headingActions);
    const account = element("div", "info-grid");
    const emailInfo = information("Email", user.email);
    if (user.email) emailInfo.append(copyButton(user.email, "Copy email"));
    const mobileInfo = information("Mobile", user.phoneNumber);
    if (user.phoneNumber) mobileInfo.append(copyButton(user.phoneNumber, "Copy mobile number"));
    account.append(
      emailInfo, mobileInfo,
      information("Phone verified", user.isPhoneVerified ? "Yes" : "No"), information("Email verified", user.isEmailVerified ? "Yes" : "No"),
      information("Active sessions", user.activeSessions), information("Joined", new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(user.createdAt))),
    );
    const controls = element("div", "account-controls");
    if (user.status === "ACTIVE") {
      controls.append(actionButton("Suspend access", "secondary", () => this.openAction("SUSPENDED")), actionButton("Deactivate account", "danger", () => this.openAction("DEACTIVATED")));
    } else {
      controls.append(actionButton("Reactivate account", "primary", () => this.openAction("ACTIVE")));
    }
    const note = element("p", "control-note", "Deactivation is reversible. The user is signed out immediately and disappears from client discovery.");
    controls.append(note);
    detail.append(heading, section("Account information", account), section("Access controls", controls));
  }

  openEdit() {
    const user = this.selectedUser;
    const professional = user.roles.includes("ENGINEER") || user.roles.includes("SERVICE_PROVIDER");
    byId("user-edit-name").value = user.fullName || "";
    byId("user-edit-city").value = user.city || "";
    byId("user-edit-state").value = user.state || "";
    byId("user-edit-title").value = user.professionalTitle || "";
    byId("user-edit-title").required = professional;
    byId("user-edit-title-label").classList.toggle("hidden", !professional);
    byId("user-edit-error").textContent = "";
    byId("user-edit-dialog").showModal();
  }

  async submitEdit(event) {
    event.preventDefault();
    if (event.submitter?.value === "cancel") {
      byId("user-edit-dialog").close();
      return;
    }
    const professional = this.selectedUser.roles.includes("ENGINEER") || this.selectedUser.roles.includes("SERVICE_PROVIDER");
    const body = {
      fullName: byId("user-edit-name").value.trim(),
      city: byId("user-edit-city").value.trim(),
      state: byId("user-edit-state").value.trim(),
      ...(professional ? { professionalTitle: byId("user-edit-title").value.trim() } : {}),
    };
    const button = byId("user-edit-submit");
    button.disabled = true;
    button.textContent = "Saving…";
    byId("user-edit-error").textContent = "";
    try {
      this.selectedUser = await this.api.request(`/admin/users/${this.selectedId}/details`, { method: "PATCH", body: JSON.stringify(body) });
      byId("user-edit-dialog").close();
      this.renderDetail(this.selectedUser);
      this.loaded = false;
      await this.load(true);
      showToast("User details updated and recorded", "success");
    } catch (error) {
      byId("user-edit-error").textContent = error.message;
    } finally {
      button.disabled = false;
      button.textContent = "Save changes";
    }
  }

  openAction(status) {
    const user = this.selectedUser;
    this.pendingAction = status;
    const reactivating = status === "ACTIVE";
    byId("account-dialog-title").textContent = reactivating ? `Reactivate ${user.fullName}?` : status === "SUSPENDED" ? `Suspend ${user.fullName}?` : `Deactivate ${user.fullName}?`;
    byId("account-dialog-copy").textContent = reactivating ? "This user will be able to sign in and use NAHTREEK again." : "This immediately ends active sessions and blocks sign-in. The action is recorded in the audit history.";
    byId("account-reason-label").classList.toggle("hidden", reactivating);
    byId("account-reason").value = "";
    byId("account-error").textContent = "";
    byId("account-submit").textContent = reactivating ? "Reactivate account" : status === "SUSPENDED" ? "Suspend access" : "Deactivate account";
    byId("account-submit").className = `button ${reactivating ? "primary" : "danger"}`;
    byId("account-dialog").showModal();
  }

  async submitAction(event) {
    event.preventDefault();
    if (event.submitter?.value === "cancel") {
      byId("account-dialog").close();
      return;
    }
    const reason = byId("account-reason").value.trim();
    if (this.pendingAction !== "ACTIVE" && reason.length < 3) {
      byId("account-error").textContent = "Enter a clear reason for this action.";
      return;
    }
    byId("account-dialog").close();
    try {
      const updated = await this.api.request(`/admin/users/${this.selectedId}/status`, { method: "PATCH", body: JSON.stringify({ status: this.pendingAction, ...(reason ? { reason } : {}) }) });
      this.selectedUser = updated;
      this.renderDetail(updated);
      this.loaded = false;
      await this.load(true);
      showToast(this.pendingAction === "ACTIVE" ? "Account reactivated" : this.pendingAction === "SUSPENDED" ? "Account access suspended" : "Account deactivated safely", "success");
    } catch (error) {
      showToast(error.message, "error");
    }
  }

  initials(name) {
    return String(name || "U").split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  }
}
