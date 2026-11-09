import { signedAssetUrl, uploadAsset } from "./storage";

describe("cloud storage boundaries", () => {
  const env = { ...process.env };
  const originalFetch = global.fetch;
  beforeEach(() => {
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-only";
  });
  afterEach(() => {
    process.env = { ...env };
    global.fetch = originalFetch;
  });

  it("stores private documents as opaque references", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
    expect(
      await uploadAsset(
        "ai-documents",
        "test.txt",
        Buffer.from("test"),
        "text/plain"
      )
    ).toBe("supabase://nahtreek-private/ai-documents/test.txt");
  });
  it("fails closed when cloud storage is missing in production", async () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    process.env.NODE_ENV = "production";
    await expect(
      uploadAsset("avatars", "test.png", Buffer.from("test"), "image/png")
    ).rejects.toThrow("Cloud storage is not configured");
  });
  it("never writes private documents to local static uploads", async () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    process.env.NODE_ENV = "development";
    await expect(
      uploadAsset("ai-documents", "test.txt", Buffer.from("test"), "text/plain")
    ).rejects.toThrow();
  });
  it("uses five minute signed URLs", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue({
        ok: true,
        json: async () => ({
          signedURL:
            "/object/sign/nahtreek-private/ai-documents/test.txt?token=test",
        }),
      });
    expect(
      await signedAssetUrl("supabase://nahtreek-private/ai-documents/test.txt")
    ).toContain("/storage/v1/object/sign/");
    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ body: JSON.stringify({ expiresIn: 300 }) })
    );
  });
  it("signs professional verification documents from the private bucket", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue({
        ok: true,
        json: async () => ({
          signedURL:
            "/object/sign/nahtreek-private/verification-documents/id.pdf?token=test",
        }),
      });
    expect(
      await signedAssetUrl(
        "supabase://nahtreek-private/verification-documents/id.pdf"
      )
    ).toContain("/storage/v1/object/sign/");
  });
  it("rejects arbitrary private object paths", async () => {
    await expect(
      signedAssetUrl("supabase://other-bucket/secret")
    ).rejects.toThrow("Invalid document reference");
  });
});
