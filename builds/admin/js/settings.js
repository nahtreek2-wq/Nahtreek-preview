import { byId, setBusy, showToast } from "./dom.js";

export class SettingsController {
  constructor(api, onUpdated) {
    this.api = api;
    this.onUpdated = onUpdated;
    this.loaded = false;
  }

  bind() {
    byId("settings-form").addEventListener("submit", (event) => this.save(event));
  }

  async load(force = false) {
    if (this.loaded && !force) return;
    byId("settings-error").textContent = "";
    try {
      this.render(await this.api.get("/admin/profile", { ttl: 30_000, force }));
      this.loaded = true;
    } catch (error) {
      byId("settings-error").textContent = error.message;
    }
  }

  render(profile) {
    const name = profile.displayName || "NAHTREEK Administrator";
    byId("settings-display-name").value = name;
    byId("settings-name").textContent = name;
    byId("settings-email").value = profile.email || "Not provided";
    byId("settings-phone").value = profile.phoneNumber || "Not provided";
    byId("settings-avatar").textContent = name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  }

  async save(event) {
    event.preventDefault();
    const button = byId("settings-save");
    const displayName = byId("settings-display-name").value.trim();
    byId("settings-error").textContent = "";
    setBusy(button, true, "Saving…");
    try {
      const profile = await this.api.request("/admin/profile", { method: "PATCH", body: JSON.stringify({ displayName }) });
      this.render(profile);
      this.onUpdated(profile.displayName);
      showToast("Administrator profile updated", "success");
    } catch (error) {
      byId("settings-error").textContent = error.message;
    } finally {
      setBusy(button, false);
    }
  }
}
