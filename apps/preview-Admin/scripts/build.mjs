import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { URL } from "node:url";

const environment = process.env.ADMIN_ENV || "preview";
if (!/^[a-z][a-z0-9-]*$/.test(environment)) {
  throw new Error("ADMIN_ENV must be a lowercase environment name");
}

const profile = JSON.parse(
  await readFile(new URL(`../config/${environment}.json`, import.meta.url), "utf8"),
);
const apiBaseUrl = (process.env.NAHTREEK_API_BASE_URL || profile.apiBaseUrl || "").replace(/\/$/, "");
if (!apiBaseUrl) {
  throw new Error(`NAHTREEK_API_BASE_URL is required for the ${environment} admin build`);
}

const isSameOriginPath = apiBaseUrl.startsWith("/") && !apiBaseUrl.startsWith("//");
const apiUrl = isSameOriginPath ? null : new URL(apiBaseUrl);
if (apiUrl && apiUrl.protocol !== "https:") throw new Error("NAHTREEK_API_BASE_URL must use HTTPS");

await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });
await Promise.all([
  cp("src/assets", "dist/assets", { recursive: true }),
  cp("src/js", "dist/js", { recursive: true }),
  cp("src/styles", "dist/styles", { recursive: true }),
]);

const indexTemplate = await readFile("src/index.html", "utf8");
await writeFile(
  "dist/index.html",
  indexTemplate.replaceAll("__NAHTREEK_API_ORIGIN__", apiUrl?.origin || ""),
);
await writeFile(
  "dist/config.js",
  `window.NAHTREEK_ADMIN_CONFIG = Object.freeze(${JSON.stringify({
    apiBaseUrl,
    environment,
  })});\n`,
);
