import { ServiceUnavailableException } from "@nestjs/common";
import { mkdir, writeFile } from "fs/promises";
import { join, resolve } from "path";

function configuration() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  if (!url.startsWith("https://"))
    throw new ServiceUnavailableException("Storage requires HTTPS");
  return { url, headers: { apikey: key, Authorization: `Bearer ${key}` } };
}

type AssetFolder = "avatars" | "work-photos" | "ai-documents" | "verification-documents";

export async function uploadAsset(
  folder: AssetFolder,
  filename: string,
  content: Buffer,
  mimeType: string
): Promise<string> {
  const config = configuration();
  if (!config) {
    // Public avatars only: private documents must never enter static uploads.
    if (process.env.NODE_ENV === "production" || folder !== "avatars") {
      throw new ServiceUnavailableException("Cloud storage is not configured");
    }
    const directory = resolve(process.env.UPLOAD_DIR ?? "uploads", folder);
    await mkdir(directory, { recursive: true });
    await writeFile(join(directory, filename), content, { flag: "wx" });
    return `/uploads/${folder}/${filename}`;
  }
  const publicAsset = folder === "avatars" || folder === "work-photos";
  const bucket = publicAsset ? "nahtreek-avatars" : "nahtreek-private";
  const key = `${folder}/${filename}`;
  let response: Response;
  try {
    response = await fetch(`${config.url}/storage/v1/object/${bucket}/${key}`, {
      method: "POST",
      headers: {
        ...config.headers,
        "Content-Type": mimeType,
        "x-upsert": "false",
      },
      body: new Uint8Array(content),
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    throw new ServiceUnavailableException(
      "Upload unavailable. Please try again."
    );
  }
  if (!response.ok)
    throw new ServiceUnavailableException(
      "Upload unavailable. Please try again."
    );
  return publicAsset
    ? `${config.url}/storage/v1/object/public/${bucket}/${key}`
    : `supabase://${bucket}/${key}`;
}

// Call only after the owning user has been authorized by the service.
export async function downloadAsset(value: string | null): Promise<Buffer | null> {
  if (!value) return null;
  if (value.startsWith('/uploads/')) {
    if (process.env.NODE_ENV === 'production') return null;
    const {readFile} = await import('fs/promises');
    try {
      return await readFile(resolve(process.env.UPLOAD_DIR ?? 'uploads', value.slice('/uploads/'.length)));
    } catch {
      return null;
    }
  }
  if (!value.startsWith('supabase://')) return null;
  const config = configuration();
  if (!config) return null;
  const key = value.slice('supabase://'.length);
  if (!/^nahtreek-private\/(ai-documents|verification-documents)\/[a-zA-Z0-9.-]+$/.test(key)) return null;
  try {
    const response = await fetch(`${config.url}/storage/v1/object/authenticated/${key}`, {
      headers: config.headers,
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) return null;
    const buffer = Buffer.from(await response.arrayBuffer());
    return buffer.length && buffer.length <= 2_000_000 ? buffer : null;
  } catch {
    return null;
  }
}

// Call only after the owning user has been authorized by the service.
export async function signedAssetUrl(
  value: string | null
): Promise<string | null> {
  if (!value?.startsWith("supabase://")) return value;
  const config = configuration();
  if (!config)
    throw new ServiceUnavailableException("Cloud storage is not configured");
  const key = value.slice("supabase://".length);
  if (
    !/^nahtreek-private\/(ai-documents|verification-documents)\/[a-zA-Z0-9.-]+$/.test(
      key
    )
  ) {
    throw new ServiceUnavailableException("Invalid document reference");
  }
  try {
    const response = await fetch(
      `${config.url}/storage/v1/object/sign/${key}`,
      {
        method: "POST",
        headers: { ...config.headers, "Content-Type": "application/json" },
        body: JSON.stringify({ expiresIn: 300 }),
        signal: AbortSignal.timeout(10000),
      }
    );
    if (!response.ok) throw new Error("Sign failed");
    const result = (await response.json()) as { signedURL: string };
    if (!result.signedURL?.startsWith("/object/sign/"))
      throw new Error("Invalid URL");
    return `${config.url}/storage/v1${result.signedURL}`;
  } catch {
    throw new ServiceUnavailableException("Document temporarily unavailable");
  }
}
