import { describe, expect, it, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createMockContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as TrpcContext["res"],
  };
}

describe("API Routers", () => {
  describe("weather.fetch", () => {
    it("should fetch weather data for a location", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.weather.fetch({ location: "서울" });

      expect(result).toBeDefined();
      expect(result.location).toBe("서울, 대한민국");
      expect(result.temperature).toBe(15);
      expect(result.humidity).toBe(65);
      expect(result.condition).toBe("맑음");
    });

    it("should return default weather data for unknown location", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.weather.fetch({ location: "unknown" });

      expect(result).toBeDefined();
      expect(result.location).toBe("서울, 대한민국");
    });
  });

  describe("logistics.fetch", () => {
    it("should fetch logistics data for a tracking number", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.logistics.fetch({ trackingNumber: "CJ123456789" });

      expect(result).toBeDefined();
      expect(result.trackingNumber).toBe("CJ123456789");
      expect(result.status).toBe("배송중");
      expect(result.carrier).toBe("CJ대한통운");
    });

    it("should return default logistics data for unknown tracking number", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.logistics.fetch({ trackingNumber: "unknown" });

      expect(result).toBeDefined();
      expect(result.trackingNumber).toBe("CJ123456789");
    });
  });

  describe("energy.fetch", () => {
    it("should fetch energy data for a facility", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.energy.fetch({ facility: "본사빌딩" });

      expect(result).toBeDefined();
      expect(result.facility).toBe("본사 빌딩");
      expect(result.energyType).toBe("전기");
      expect(result.consumption).toBe(1250);
      expect(result.efficiency).toBe(78);
    });

    it("should return default energy data for unknown facility", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.energy.fetch({ facility: "unknown" });

      expect(result).toBeDefined();
      expect(result.facility).toBe("본사 빌딩");
    });
  });

  describe("auth.me", () => {
    it("should return current user info", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.me();

      expect(result).toBeDefined();
      expect(result?.id).toBe(1);
      expect(result?.openId).toBe("test-user");
      expect(result?.email).toBe("test@example.com");
    });
  });

  describe("auth.logout", () => {
    it("should clear session cookie and return success", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.logout();

      expect(result).toEqual({ success: true });
      expect(ctx.res.clearCookie).toHaveBeenCalled();
    });
  });
});
