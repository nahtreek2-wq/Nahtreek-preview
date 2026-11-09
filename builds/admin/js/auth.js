import { byId, setBusy } from "./dom.js";

const TOKEN_KEY = "nahtreekAdminToken";
const REFRESH_KEY = "nahtreekAdminRefreshToken";
// Inactive admin tabs sign out automatically: money and PII views must not
// sit open unattended. A warning precedes the logout by two minutes.
export const IDLE_TIMEOUT_MS = 15 * 60_000;
export const IDLE_WARN_MS = 13 * 60_000;
const IDLE_EVENTS = ["pointerdown", "keydown", "submit"];
const MAX_LOGIN_COOLDOWN_MS = 10_000;

export function loginCooldownMs(failedAttempts) {
  return Math.min(Math.max(failedAttempts, 1) * 2000, MAX_LOGIN_COOLDOWN_MS);
}

export class AuthController {
  constructor(api, callbacks) {
    this.api = api;
    this.callbacks = callbacks;
    this.failedAttempts = 0;
    this.idleTimer = 0;
    this.warnTimer = 0;
    this.onIdle = null;
    this.onIdleWarning = null;
    this.handleActivity = () => this.resetIdleTimers();
    this.api.onUnauthorized = () => this.logout();
    // Refresh rotates the pair, so every silent refresh must persist the new
    // tokens — otherwise a reload reuses a revoked refresh token and logs out.
    this.api.onTokensRefreshed = (accessToken, refreshToken) => {
      sessionStorage.setItem(TOKEN_KEY, accessToken);
      sessionStorage.setItem(REFRESH_KEY, refreshToken);
    };
  }

  async login(event) {
    event.preventDefault();
    const button = byId("login-button");
    byId("login-error").textContent = "";
    setBusy(button, true, "Signing in…");
    let failed = false;
    try {
      const result = await this.api.request("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: byId("email").value.trim(),
          password: byId("password").value,
        }),
      });
      this.requireAdministrator(result.user);
      this.api.setTokens(result.accessToken, result.refreshToken);
      sessionStorage.setItem(TOKEN_KEY, result.accessToken);
      if (result.refreshToken) sessionStorage.setItem(REFRESH_KEY, result.refreshToken);
      this.failedAttempts = 0;
      await this.callbacks.onAuthenticated(result.user);
    } catch (error) {
      failed = true;
      this.failedAttempts += 1;
      byId("password").value = "";
      byId("login-error").textContent = error.message;
    } finally {
      setBusy(button, false);
    }
    if (!failed) return;
    // Gentle client-side throttle on top of the server guard: slow down
    // rapid credential replay without locking out a mistyped password.
    // Runs after setBusy restores the label so the countdown text survives.
    const cooldown = loginCooldownMs(this.failedAttempts);
    button.disabled = true;
    button.textContent = `Try again in ${Math.ceil(cooldown / 1000)}s`;
    window.setTimeout(() => {
      button.disabled = false;
      button.textContent = button.dataset.label || "Sign in securely";
      byId("password").focus();
    }, cooldown);
  }

  startIdleWatch({ onIdle, onIdleWarning }) {
    this.stopIdleWatch();
    this.onIdle = onIdle;
    this.onIdleWarning = onIdleWarning;
    IDLE_EVENTS.forEach((name) => document.addEventListener(name, this.handleActivity, { passive: true }));
    this.resetIdleTimers();
  }

  stopIdleWatch() {
    IDLE_EVENTS.forEach((name) => document.removeEventListener(name, this.handleActivity));
    window.clearTimeout(this.idleTimer);
    window.clearTimeout(this.warnTimer);
    this.idleTimer = 0;
    this.warnTimer = 0;
  }

  resetIdleTimers() {
    if (!this.onIdle) return;
    window.clearTimeout(this.idleTimer);
    window.clearTimeout(this.warnTimer);
    const warning = this.onIdleWarning;
    const idle = this.onIdle;
    this.warnTimer = window.setTimeout(() => warning?.(IDLE_TIMEOUT_MS - IDLE_WARN_MS), IDLE_WARN_MS);
    this.idleTimer = window.setTimeout(() => idle?.(), IDLE_TIMEOUT_MS);
  }

  async resume() {
    const token = sessionStorage.getItem(TOKEN_KEY);
    // No stored session: leave the boot splash for the sign-in form.
    if (!token) {
      this.callbacks.onLogout();
      return;
    }
    // /auth/me goes through the silent-refresh path, so a reload with an
    // expired access token still resumes when the refresh token is valid.
    this.api.setTokens(token, sessionStorage.getItem(REFRESH_KEY));
    try {
      const user = await this.api.request("/auth/me");
      this.requireAdministrator(user);
      await this.callbacks.onAuthenticated(user);
    } catch {
      this.logout();
    }
  }

  requireAdministrator(user) {
    if (!user?.roles?.includes("ADMIN")) {
      throw new Error("This account is not authorised for administration");
    }
  }

  logout(reason) {
    this.stopIdleWatch();
    this.api.clearTokens();
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_KEY);
    this.callbacks.onLogout(reason);
  }
}
