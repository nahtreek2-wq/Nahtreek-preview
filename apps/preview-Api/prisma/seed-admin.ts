import { AccountStatus, PrismaClient, Role } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  if (process.env.ALLOW_ADMIN_SEED !== "true") {
    throw new Error(
      "Set ALLOW_ADMIN_SEED=true to create the preview administrator"
    );
  }
  if (process.env.APP_ENV === "production") {
    throw new Error("Preview administrator seeding is forbidden in production");
  }
  const password = process.env.DEMO_ADMIN_PASSWORD?.trim();
  if (!password || password.length < 12) {
    throw new Error("DEMO_ADMIN_PASSWORD must contain at least 12 characters");
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.upsert({
    where: { email: "admin.demo@nahtreek.example" },
    create: {
      email: "admin.demo@nahtreek.example",
      phoneNumber: "+919999990100",
      passwordHash,
      status: AccountStatus.ACTIVE,
      isPhoneVerified: true,
      isEmailVerified: true,
    },
    update: {
      passwordHash,
      status: AccountStatus.ACTIVE,
      isPhoneVerified: true,
      isEmailVerified: true,
      deletedAt: null,
      authVersion: { increment: 1 },
    },
  });
  await prisma.userRole.upsert({
    where: { userId_role: { userId: user.id, role: Role.ADMIN } },
    create: { userId: user.id, role: Role.ADMIN },
    update: {},
  });
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "SYNTHETIC_PREVIEW_ADMIN_SEEDED",
      entity: "User",
      entityId: user.id,
      metadata: { synthetic: true },
    },
  });
  console.log(JSON.stringify({ userId: user.id, email: user.email }));
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
