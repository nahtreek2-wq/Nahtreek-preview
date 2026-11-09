import { SmsService } from "./sms.service";

describe("SmsService", () => {
  const original = process.env;
  const fetchMock = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    process.env = { ...original };
    global.fetch = fetchMock;
  });

  afterAll(() => {
    process.env = original;
  });

  it("keeps OTP disabled when MSG91 credentials are missing", async () => {
    process.env.SMS_PROVIDER = "msg91";
    delete process.env.MSG91_AUTH_KEY;
    delete process.env.MSG91_TEMPLATE_ID;

    await expect(
      new SmsService().sendOtp("+919999990101", "123456")
    ).resolves.toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends an OTP through MSG91 without exposing the key in the URL", async () => {
    process.env.SMS_PROVIDER = "msg91";
    process.env.MSG91_AUTH_KEY = "test-auth-key";
    process.env.MSG91_TEMPLATE_ID = "test-template";
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ type: "success" }),
    });

    await expect(
      new SmsService().sendOtp("+919999990101", "123456")
    ).resolves.toBe(true);
    const [url, options] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("template_id=test-template");
    expect(String(url)).toContain("mobile=919999990101");
    expect(String(url)).not.toContain("test-auth-key");
    expect(options.headers.authkey).toBe("test-auth-key");
  });

  it("reports whether the resolved provider has credentials", () => {
    process.env.SMS_PROVIDER = "msg91";
    delete process.env.MSG91_AUTH_KEY;
    delete process.env.MSG91_TEMPLATE_ID;
    expect(new SmsService().isConfigured()).toBe(false);
    process.env.MSG91_AUTH_KEY = "test-auth-key";
    process.env.MSG91_TEMPLATE_ID = "test-template";
    expect(new SmsService().isConfigured()).toBe(true);
    process.env.SMS_PROVIDER = "fast2sms";
    delete process.env.SMS_API_KEY;
    expect(new SmsService().isConfigured()).toBe(false);
    process.env.SMS_API_KEY = "legacy-key";
    expect(new SmsService().isConfigured()).toBe(true);
  });

  it("supports the existing Fast2SMS adapter during migration", async () => {
    process.env.SMS_PROVIDER = "fast2sms";
    process.env.SMS_API_KEY = "legacy-key";
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ return: true }),
    });

    await expect(
      new SmsService().sendOtp("+919999990101", "654321")
    ).resolves.toBe(true);
    expect(String(fetchMock.mock.calls[0][0])).toContain("route=otp");
  });
});
