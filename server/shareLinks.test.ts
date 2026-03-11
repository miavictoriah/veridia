import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `user-${userId}`,
    email: `user${userId}@example.com`,
    name: `User ${userId}`,
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

function createPublicContext(): { ctx: TrpcContext } {
  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("Share Links", () => {
  it("creates a share link with valid expiry", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const expiryHours = 24;
    const result = await caller.shareLinks.create({
      expiryHours,
      accessType: "dashboard",
    });

    expect(result).toBeDefined();
    expect(result.token).toBeDefined();
    expect(result.token.length).toBeGreaterThan(20); // Random token
    expect(result.expiresAt).toBeInstanceOf(Date);
    expect(result.expiresAt.getTime()).toBeGreaterThan(new Date().getTime());
  });

  it("creates share links with different access types", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const accessTypes: Array<"dashboard" | "specific_property" | "report"> = [
      "dashboard",
      "specific_property",
      "report",
    ];

    for (const accessType of accessTypes) {
      const result = await caller.shareLinks.create({
        expiryHours: 24,
        accessType,
      });

      expect(result.token).toBeDefined();
    }
  });

  it("lists share links for authenticated user", async () => {
    const { ctx } = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    // Create a share link first
    await caller.shareLinks.create({
      expiryHours: 24,
      accessType: "dashboard",
    });

    // List links
    const links = await caller.shareLinks.list();

    expect(Array.isArray(links)).toBe(true);
    expect(links.length).toBeGreaterThan(0);
  });

  it("allows public access to valid share links", async () => {
    const { ctx: authCtx } = createAuthContext();
    const authCaller = appRouter.createCaller(authCtx);

    // Create a share link
    const created = await authCaller.shareLinks.create({
      expiryHours: 24,
      accessType: "dashboard",
    });

    // Access with public context
    const { ctx: publicCtx } = createPublicContext();
    const publicCaller = appRouter.createCaller(publicCtx);

    const link = await publicCaller.shareLinks.getByToken({
      token: created.token,
    });

    expect(link).toBeDefined();
    expect(link?.token).toBe(created.token);
    expect(link?.accessType).toBe("dashboard");
  });

  it("rejects access to expired share links", async () => {
    const { ctx: authCtx } = createAuthContext();
    const authCaller = appRouter.createCaller(authCtx);

    // Create a share link that expires in -1 hours (already expired)
    const created = await authCaller.shareLinks.create({
      expiryHours: -1,
      accessType: "dashboard",
    });

    // Try to access with public context
    const { ctx: publicCtx } = createPublicContext();
    const publicCaller = appRouter.createCaller(publicCtx);

    const link = await publicCaller.shareLinks.getByToken({
      token: created.token,
    });

    expect(link).toBeNull();
  });

  it("revokes share links", async () => {
    const { ctx: authCtx } = createAuthContext();
    const authCaller = appRouter.createCaller(authCtx);

    // Create a share link
    const created = await authCaller.shareLinks.create({
      expiryHours: 24,
      accessType: "dashboard",
    });

    // Revoke it
    await authCaller.shareLinks.revoke({
      token: created.token,
    });

    // Try to access with public context
    const { ctx: publicCtx } = createPublicContext();
    const publicCaller = appRouter.createCaller(publicCtx);

    const link = await publicCaller.shareLinks.getByToken({
      token: created.token,
    });

    expect(link).toBeNull();
  });

  it("tracks view count on share link access", async () => {
    const { ctx: authCtx } = createAuthContext();
    const authCaller = appRouter.createCaller(authCtx);

    // Create a share link
    const created = await authCaller.shareLinks.create({
      expiryHours: 24,
      accessType: "dashboard",
    });

    // Access multiple times with public context
    const { ctx: publicCtx } = createPublicContext();
    const publicCaller = appRouter.createCaller(publicCtx);

    for (let i = 0; i < 3; i++) {
      await publicCaller.shareLinks.getByToken({
        token: created.token,
      });
    }

    // List links to check view count
    const links = await authCaller.shareLinks.list();
    const link = links.find((l) => l.token === created.token);

    expect(link?.viewCount).toBeGreaterThanOrEqual(3);
  });
});
