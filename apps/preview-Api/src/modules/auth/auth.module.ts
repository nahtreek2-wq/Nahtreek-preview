import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "../../common/strategies/jwt.strategy";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { SmsService } from "./sms.service";
import { AuthThrottleGuard } from "./auth-throttle.guard";
import { EmailOtpService } from "./email-otp.service";

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: "15m",
        issuer: "nahtreek-api",
        audience: "nahtreek-mobile",
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    SmsService,
    EmailOtpService,
    JwtStrategy,
    AuthThrottleGuard,
  ],
  exports: [AuthService],
})
export class AuthModule {}
