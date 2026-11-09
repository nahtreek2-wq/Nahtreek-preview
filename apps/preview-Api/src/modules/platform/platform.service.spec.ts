import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import {
  PlatformService,
  pagination,
  PROVIDER_TRANSITIONS,
} from "./platform.service";
import { DiscoveryService } from "../discovery/discovery.service";
import { ClientsService } from "../clients/clients.service";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Role } from "@prisma/client";
import { RequestsService } from "../requests/requests.service";
import { ChatService } from "../chat/chat.service";

describe("platform boundaries (mocked database)", () => {
  it.each(["0", "-1", "1.5", "NaN", "Infinity"])(
    "rejects invalid page %s",
    (page) => expect(() => pagination(page)).toThrow(BadRequestException)
  );
  it("bounds pagination", () => {
    expect(() => pagination("1", "101")).toThrow();
    expect(pagination("2", "10")).toEqual({ page: 2, limit: 10, skip: 10 });
  });
  it("places Home Services before other category groups", async () => {
    const prisma = {
      serviceCategory: {
        findMany: jest
          .fn()
          .mockResolvedValue([
            { group: "Construction & Renovation" },
            { group: "Home Services" },
          ]),
      },
    };
    expect(
      (await new PlatformService(prisma as any).categories())[0].group
    ).toBe("Home Services");
  });
  it("filters provider discovery by district, state, service, verified and active role", async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const count = jest.fn().mockResolvedValue(0);
    const prisma = {
      professionalProfile: { findMany, count },
      serviceCategory: {findFirst: jest.fn().mockResolvedValue({id: 'service-plumbing', slug: 'plumbing'})},
      $transaction: (promises) => Promise.all(promises),
    };
    await new PlatformService(prisma as any).providers({
      city: " Chennai ",
      state: " Tamil Nadu ",
      serviceId: "plumbing",
    });
    expect(findMany.mock.calls[0][0].where).toMatchObject({
      baseCityNorm: "chennai",
      baseStateNorm: "tamilnadu",
      serviceCategories: { hasSome: ['service-plumbing', 'plumbing'] },
      verificationStatus: "VERIFIED",
      user: {
        status: "ACTIVE",
        deletedAt: null,
        roles: { some: { role: "SERVICE_PROVIDER" } },
      },
    });
    expect(findMany.mock.calls[0][0].select.user).toBeUndefined();
  });
  it("filters engineers by district, state and availability", async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const prisma = {
      engineerProfile: { findMany, count: jest.fn().mockResolvedValue(0) },
      $transaction: (promises) => Promise.all(promises),
    };
    await new DiscoveryService(prisma as any).getEngineers({
      city: "Chennai",
      state: "Tamil Nadu",
      sort: "available",
    });
    expect(findMany.mock.calls[0][0].where.profile).toMatchObject({
      baseCityNorm: "chennai",
      baseStateNorm: "tamilnadu",
      isAvailable: true,
      user: { status: "ACTIVE", deletedAt: null },
    });
  });
  it("serves engineer specializations from the backend catalogue", async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    await new DiscoveryService({specialization: {findMany}} as any).specializations();
    expect(findMany).toHaveBeenCalledWith({
      orderBy: {name: "asc"},
      select: {id: true, name: true, description: true, iconUrl: true},
    });
  });
  it("includes the client name in an engineer professional inbox", async () => {
    const row = {
      id: "request",
      clientProfileId: "client-profile",
      engineerProfileId: "engineer-profile",
      projectTitle: "Structural inspection",
      projectDescription: "Inspect an existing residential slab.",
      propertyType: "Residential",
      projectSizeSqFt: null,
      locationAddress: "Coimbatore",
      latitude: 11.01,
      longitude: 76.95,
      status: "PENDING",
      createdAt: new Date(),
      client: {fullName: "Lakshmi"},
      engineer: {profile: {fullName: "Arun"}},
    };
    const findMany = jest.fn().mockResolvedValue([row]);
    const prisma = {
      engineerRequest: {findMany, count: jest.fn().mockResolvedValue(1)},
      $transaction: (promises) => Promise.all(promises),
    };
    const result = await new RequestsService(prisma as any, {emitUserUpdate: jest.fn()} as any, {dispatch: jest.fn()} as any).list("engineer", {});
    expect(findMany.mock.calls[0][0].include.client).toBe(true);
    expect(result.data[0]).toMatchObject({clientName: "Lakshmi"});
  });
  it("scopes all-role account history to the authenticated user", async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const count = jest.fn().mockResolvedValue(0);
    const prisma = {
      auditLog: { findMany, count },
      $transaction: (promises) => Promise.all(promises),
    };
    await new PlatformService(prisma as any).history("owner", {});
    expect(findMany.mock.calls[0][0].where).toEqual({ userId: "owner" });
    expect(count).toHaveBeenCalledWith({ where: { userId: "owner" } });
  });
  it("never returns a service request to a non-participant", async () => {
    const findFirst = jest.fn().mockResolvedValue(null);
    await expect(
      new PlatformService({ serviceRequest: { findFirst } } as any).detail(
        "stranger",
        "request"
      )
    ).rejects.toThrow(NotFoundException);
    expect(findFirst.mock.calls[0][0].where).toMatchObject({
      id: "request",
      OR: [
        { client: { userId: "stranger" } },
        { provider: { userId: "stranger" } },
      ],
    });
  });
  it("flags Plus subscribers on the provider view only", async () => {
    const found = {id: "request", client: {userId: "client-user", fullName: "Asha"},
      provider: {userId: "pro-user", fullName: "Pro"}};
    const prisma = (plus: boolean) => ({serviceRequest: {findFirst: jest.fn().mockResolvedValue(found)},
      aiSubscription: {findUnique: jest.fn().mockResolvedValue(plus
        ? {status: "ACTIVE", currentPeriodEnd: new Date(Date.now() + 86400000)} : null)}});
    await expect(new PlatformService(prisma(true) as any).detail("pro-user", "request"))
      .resolves.toMatchObject({clientPlus: true});
    await expect(new PlatformService(prisma(false) as any).detail("pro-user", "request"))
      .resolves.toMatchObject({clientPlus: false});
    const clientView = await new PlatformService(prisma(true) as any).detail("client-user", "request");
    expect(clientView).not.toHaveProperty("clientPlus");
  });
  it("flags Plus clients on the provider inbox only", async () => {
    const row = (clientUserId: string) => ({id: `req-${clientUserId}`,
      client: {userId: clientUserId, fullName: "Asha"},
      provider: {userId: "pro-user", fullName: "Pro"}});
    const prisma = {
      $transaction: jest.fn().mockResolvedValue([[row("plus-user"), row("free-user")], 2]),
      serviceRequest: {findMany: jest.fn(), count: jest.fn()},
      aiSubscription: {findMany: jest.fn().mockResolvedValue([
        {userId: "plus-user", status: "ACTIVE", currentPeriodEnd: new Date(Date.now() + 86400000)}])},
    };
    const service = new PlatformService(prisma as any);
    const pro = await service.requests("pro-user", {});
    expect(pro.data[0]).toMatchObject({clientPlus: true});
    expect(pro.data[1]).toMatchObject({clientPlus: false});
    expect(prisma.aiSubscription.findMany).toHaveBeenCalledTimes(1);
    const client = await service.requests("plus-user", {});
    expect(client.data[0]).not.toHaveProperty("clientPlus");
  });
  it("does not allow completed requests to reopen", () =>
    expect(PROVIDER_TRANSITIONS.COMPLETED).toEqual([]));
  it("rejects unauthorized client transitions and concurrent status changes", async () => {
    const request = {
      id: "r",
      status: "PENDING",
      client: { userId: "client" },
      provider: { userId: "provider" },
      category: { title: "Plumbing" },
    };
    const tx = {
      serviceRequest: {
        findFirst: jest.fn().mockResolvedValue(request),
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
    };
    const prisma = { ...tx, serviceJourney: {findUnique: jest.fn().mockResolvedValue(null)}, $transaction: (fn) => fn(tx) };
    const service = new PlatformService(prisma as any);
    await expect(
      service.transition("client", "r", { status: "ACCEPTED" })
    ).rejects.toThrow(BadRequestException);
    await expect(
      service.transition("provider", "r", { status: "ACCEPTED" })
    ).rejects.toThrow(ConflictException);
  });
  it("requires an administrator for restricted operations", () => {
    const guard = new RolesGuard({
      getAllAndOverride: () => [Role.ADMIN],
    } as any);
    const ctx = {
      getHandler: () => null,
      getClass: () => null,
      switchToHttp: () => ({
        getRequest: () => ({ user: { roles: ["CLIENT"] } }),
      }),
    };
    expect(() => guard.canActivate(ctx as any)).toThrow();
  });
  it("saves professional identity as a draft without granting verification", async () => {
    const profile = {
      id: "profile",
      userId: "professional",
      verificationStatus: "NOT_SUBMITTED",
      onboardingStep: "CAPABILITIES",
    };
    const upsert = jest.fn().mockResolvedValue(profile);
    const tx = {
      professionalProfile: { upsert },
      auditLog: { create: jest.fn() },
    };
    const prisma = {
      userRole: { findFirst: jest.fn().mockResolvedValue({ id: "role" }) },
      $transaction: (callback) => callback(tx),
    };
    const result = await new PlatformService(
      prisma as any
    ).saveProfessionalIdentity("professional", {
      fullName: "  Arun Kumar  ",
      baseCity: "  Coimbatore  ",
      baseState: "  Tamil Nadu  ",
    });
    expect(upsert.mock.calls[0][0].create).toMatchObject({
      fullName: "Arun Kumar",
      baseCity: "Coimbatore",
      baseState: "Tamil Nadu",
      baseCityNorm: "coimbatore",
      baseStateNorm: "tamilnadu",
      onboardingStep: "CAPABILITIES",
    });
    expect(upsert.mock.calls[0][0].create).not.toHaveProperty(
      "verificationStatus"
    );
    expect(result.verificationStatus).toBe("NOT_SUBMITTED");
  });
  it("does not let a professional switch its account role during setup", async () => {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          roles: [{ role: Role.SERVICE_PROVIDER }],
        }),
      },
    };
    await expect(
      new PlatformService(prisma as any).setup("professional", {
        kind: "engineer",
        fullName: "Arun Kumar",
        title: "Civil Engineer",
        baseCity: "Coimbatore",
        baseState: "Tamil Nadu",
        baseLatitude: 11.0168,
        baseLongitude: 76.9558,
        yearsOfExperience: 4,
        qualificationDegree: "B.E. Civil",
        institution: "Test College",
        graduationYear: 2020,
      })
    ).rejects.toThrow("does not match");
  });
  it("keeps a new profile unavailable even if setup requests immediate availability", async () => {
    const upsert = jest.fn().mockResolvedValue({id: "profile", isAvailable: false});
    const tx = {
      professionalProfile: {upsert},
      providerPresence: {updateMany: jest.fn()},
      auditLog: {create: jest.fn()},
    };
    const prisma = {
      user: {findUnique: jest.fn().mockResolvedValue({roles: [{role: Role.SERVICE_PROVIDER}]})},
      serviceCategory: {count: jest.fn().mockResolvedValue(1)},
      $transaction: (callback: (value: typeof tx) => unknown) => callback(tx),
    };
    await new PlatformService(prisma as any).setup("professional", {
      kind: "service-provider",
      fullName: "Service Professional",
      title: "Painter",
      baseCity: "Coimbatore",
      baseState: "Tamil Nadu",
      baseLatitude: 11.0168,
      baseLongitude: 76.9558,
      yearsOfExperience: 4,
      serviceCategories: ["painting"],
      isAvailable: true,
    });
    expect(upsert.mock.calls[0][0].create).toMatchObject({
      verificationStatus: "PENDING",
      isAvailable: false,
      baseCityNorm: "coimbatore",
      baseStateNorm: "tamilnadu",
    });
    expect(upsert.mock.calls[0][0].update).toMatchObject({
      verificationStatus: "PENDING",
      isAvailable: false,
    });
    expect(tx.providerPresence.updateMany).toHaveBeenCalledWith({
      where: {professionalProfileId: "profile"},
      data: {online: false},
    });
  });
  it("does not allow unverified professionals to become available for work", async () => {
    const updateMany = jest.fn().mockResolvedValue({count: 0});
    const findUnique = jest.fn().mockResolvedValue({id: "profile"});
    const tx = {
      professionalProfile: {updateMany, findUnique},
      auditLog: {create: jest.fn()},
    };
    const prisma = {$transaction: (callback: (value: typeof tx) => unknown) => callback(tx)};
    await expect(new PlatformService(prisma as any).setWorkStatus("professional", true))
      .rejects.toThrow(BadRequestException);
    expect(updateMany).toHaveBeenCalledWith({
      where: {userId: "professional", verificationStatus: "VERIFIED"},
      data: {isAvailable: true},
    });
    expect(tx.auditLog.create).not.toHaveBeenCalled();
  });
  it("allows availability after verification and records the change", async () => {
    const updateMany = jest.fn().mockResolvedValue({count: 1});
    const findUnique = jest.fn().mockResolvedValue({id: "profile", isAvailable: true});
    const tx = {
      professionalProfile: {updateMany, findUnique},
      auditLog: {create: jest.fn()},
    };
    const prisma = {$transaction: (callback: (value: typeof tx) => unknown) => callback(tx)};
    await expect(new PlatformService(prisma as any).setWorkStatus("professional", true))
      .resolves.toEqual({isAvailable: true, retainLocationSharing: false});
    expect(tx.auditLog.create).toHaveBeenCalledWith({
      data: {
        userId: "professional",
        action: "WORK_STATUS_AVAILABLE",
        entity: "ProfessionalProfile",
        entityId: "profile",
      },
    });
  });
  it("keeps location sharing for an active service visit while pausing new work", async () => {
    const tx = {
      professionalProfile: {
        updateMany: jest.fn().mockResolvedValue({count: 1}),
        findUnique: jest.fn().mockResolvedValue({id: "profile", isAvailable: false}),
      },
      serviceRequest: {count: jest.fn().mockResolvedValue(1)},
      auditLog: {create: jest.fn()},
    };
    const prisma = {$transaction: (callback: (value: typeof tx) => unknown) => callback(tx)};
    await expect(new PlatformService(prisma as any).setWorkStatus("professional", false))
      .resolves.toEqual({isAvailable: false, retainLocationSharing: true});
    expect(tx.serviceRequest.count).toHaveBeenCalledWith({
      where: {professionalProfileId: "profile", status: {in: ["ACCEPTED", "IN_PROGRESS"]}},
    });
  });
  it("rejects overlapping professional availability", async () => {
    const startsAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const endsAt = new Date(startsAt.getTime() + 2 * 60 * 60 * 1000);
    const prisma = {
      professionalProfile: {
        findUnique: jest.fn().mockResolvedValue({id: "profile"}),
      },
      availabilitySlot: {
        findFirst: jest.fn().mockResolvedValue({id: "existing"}),
        create: jest.fn(),
      },
    };
    await expect(
      new PlatformService(prisma as any).createAvailability("professional", {
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
      })
    ).rejects.toThrow(ConflictException);
    expect(prisma.availabilitySlot.findFirst).toHaveBeenCalledWith({
      where: {
        professionalProfileId: "profile",
        startsAt: {lt: endsAt},
        endsAt: {gt: startsAt},
      },
    });
    expect(prisma.availabilitySlot.create).not.toHaveBeenCalled();
  });
  it("cannot delete another professional's availability", async () => {
    const prisma = {
      availabilitySlot: {findFirst: jest.fn().mockResolvedValue(null)},
    };
    await expect(
      new PlatformService(prisma as any).deleteAvailability(
        "professional",
        "other-slot"
      )
    ).rejects.toThrow(NotFoundException);
    expect(prisma.availabilitySlot.findFirst).toHaveBeenCalledWith({
      where: {id: "other-slot", profile: {userId: "professional"}},
      select: {id: true, startsAt: true},
    });
  });
  it("opens a service-request conversation for its assigned professional", async () => {
    const serviceRequest = {
      id: "service-request",
      status: "ACCEPTED",
      client: {userId: "client"},
      provider: {userId: "provider", fullName: "Kannan"},
      category: {title: "Plumbing"},
    };
    const conversation = {
      id: "conversation",
      engineerRequestId: null,
      serviceRequestId: serviceRequest.id,
      participants: [
        {userId: "client", user: {clientProfile: {fullName: "Lakshmi"}, professionalProfile: null}},
        {userId: "provider", user: {clientProfile: null, professionalProfile: {fullName: "Kannan"}}},
      ],
      messages: [],
      engineerRequest: null,
      serviceRequest,
    };
    const create = jest.fn().mockResolvedValue(conversation);
    const prisma = {
      serviceRequest: {findUnique: jest.fn().mockResolvedValue(serviceRequest)},
      conversation: {findFirst: jest.fn().mockResolvedValue(null), create},
    };
    const result = await new ChatService(prisma as any).create("provider", {
      serviceRequestId: serviceRequest.id,
    });
    expect(create.mock.calls[0][0].data).toEqual({
      serviceRequestId: serviceRequest.id,
      participants: {create: [{userId: "client"}, {userId: "provider"}]},
    });
    expect(result).toMatchObject({
      serviceRequestId: serviceRequest.id,
      requestKind: "service",
      title: "Lakshmi",
      subtitle: "Re: Plumbing",
    });
  });
  it("rejects an ambiguous conversation request", async () => {
    await expect(
      new ChatService({} as any).create("professional", {
        engineerRequestId: "00000000-0000-4000-8000-000000000001",
        serviceRequestId: "00000000-0000-4000-8000-000000000002",
      })
    ).rejects.toThrow("exactly one");
  });
  it("returns the real unread message count for a conversation", async () => {
    const lastReadAt = new Date("2026-09-22T08:00:00.000Z");
    const conversation = {
      id: "conversation",
      engineerRequestId: null,
      serviceRequestId: "service-request",
      participants: [
        {userId: "professional", lastReadAt, user: {clientProfile: null, professionalProfile: {fullName: "Kannan"}}},
        {userId: "client", lastReadAt: null, user: {clientProfile: {fullName: "Lakshmi"}, professionalProfile: null}},
      ],
      messages: [{content: "Please confirm the visit", createdAt: new Date()}],
      engineerRequest: null,
      serviceRequest: {category: {title: "Plumbing"}, provider: {fullName: "Kannan"}},
    };
    const count = jest.fn().mockResolvedValue(3);
    const prisma = {
      conversation: {
        findMany: jest.fn().mockResolvedValue([conversation]),
        count: jest.fn().mockResolvedValue(1),
      },
      message: {count},
      $transaction: (queries) => Promise.all(queries),
    };
    const result = await new ChatService(prisma as any).list("professional", {});
    expect(count).toHaveBeenCalledWith({
      where: {
        conversationId: "conversation",
        senderUserId: {not: "professional"},
        createdAt: {gt: lastReadAt},
      },
    });
    expect(result.data[0].unread).toBe(3);
  });
  it("notifies the other conversation participant when a message is sent", async () => {
    const createMany = jest.fn().mockResolvedValue({count: 1});
    const tx = {
      conversationParticipant: {
        findMany: jest.fn().mockResolvedValue([{userId: "professional"}, {userId: "client"}]),
      },
      message: {
        create: jest.fn().mockResolvedValue({
          id: "message",
          conversationId: "conversation",
          senderUserId: "professional",
          content: "I can visit tomorrow morning.",
          createdAt: new Date(),
          sender: {clientProfile: null, professionalProfile: {fullName: "Kannan"}},
        }),
      },
      conversation: {update: jest.fn()},
      notification: {createMany},
    };
    const prisma = {
      conversationParticipant: {findUnique: jest.fn().mockResolvedValue({userId: "professional"})},
      $transaction: callback => callback(tx),
    };
    await new ChatService(prisma as any).sendMessage("conversation", "professional", {
      content: "I can visit tomorrow morning.",
    });
    expect(createMany).toHaveBeenCalledWith({
      data: [{
        userId: "client",
        kind: "message",
        title: "New message from Kannan",
        body: "I can visit tomorrow morning.",
        data: {conversationId: "conversation", senderName: "Kannan"},
      }],
    });
  });
  it("rejects uploaded content whose MIME signature is false", async () => {
    const service = new ClientsService({
      clientProfile: {
        findUnique: jest.fn().mockResolvedValue({ id: "profile" }),
      },
    } as any);
    await expect(
      service.photo("owner", {
        mimeType: "image/png",
        contentBase64: Buffer.from("<script>").toString("base64"),
      })
    ).rejects.toThrow(BadRequestException);
  });
  it("rejects a professional photo whose content does not match its MIME type", async () => {
    const service = new PlatformService({
      professionalProfile: {
        findUnique: jest.fn().mockResolvedValue({ id: "profile" }),
      },
    } as any);
    await expect(
      service.professionalPhoto("professional", {
        mimeType: "image/jpeg",
        contentBase64: Buffer.from("not-an-image-file").toString("base64"),
      })
    ).rejects.toThrow(BadRequestException);
  });
  it("rejects a verification document whose content does not match its MIME type", async () => {
    const service = new PlatformService({
      professionalProfile: {
        findUnique: jest.fn().mockResolvedValue({ id: "profile" }),
      },
    } as any);
    await expect(
      service.uploadVerificationDocument("professional", {
        documentType: "identity-proof",
        mimeType: "application/pdf",
        contentBase64: Buffer.from("not-a-pdf-file").toString("base64"),
      })
    ).rejects.toThrow(BadRequestException);
  });
});
