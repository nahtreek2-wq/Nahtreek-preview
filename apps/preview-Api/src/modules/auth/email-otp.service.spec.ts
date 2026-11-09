import nodemailer from "nodemailer";
import { EmailOtpService } from "./email-otp.service";

jest.mock("nodemailer", () => ({
  __esModule: true,
  default: { createTransport: jest.fn() },
}));

describe("EmailOtpService", () => {
  const original = process.env;
  const sendMail = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    process.env = {
      ...original,
      APP_ENV: "preview",
      PREVIEW_EMAIL_OTP_ENABLED: "true",
      GMAIL_SMTP_USER: "preview@example.com",
      GMAIL_SMTP_APP_PASSWORD: "test-app-password",
    };
    (nodemailer.createTransport as jest.Mock).mockReturnValue({ sendMail });
    sendMail.mockResolvedValue({ messageId: "test" });
  });

  afterAll(() => {
    process.env = original;
  });

  it("sends the code through server-side Gmail configuration", async () => {
    await expect(
      new EmailOtpService().sendOtp("person@example.com", "123456")
    ).resolves.toBe(true);
    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "person@example.com",
        subject: expect.stringContaining("verification code"),
        text: expect.stringContaining("123456"),
      })
    );
  });

  it("is disabled outside Preview even when Gmail secrets exist", async () => {
    process.env.APP_ENV = "production";
    await expect(
      new EmailOtpService().sendOtp("person@example.com", "123456")
    ).resolves.toBe(false);
    expect(sendMail).not.toHaveBeenCalled();
  });
});
