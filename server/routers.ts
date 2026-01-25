import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import {
  // getLatestWeatherRecords,
  // getLogisticsRecords,
  // getEnergyRecords,
  // saveWeatherRecord,
  // saveLogisticsRecord,
  // saveEnergyRecord,
  // logApiCall,
} from "./db";
import * as db from "./db";
import { getWeatherData, getLogisticsData, getEnergyData } from "./services/dataService";
import { sdk } from "./_core/sdk";
import { z } from "zod";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    manualLogin: publicProcedure
      .input(z.object({ id: z.string(), pw: z.string() }))
      .mutation(async ({ ctx, input }) => {
        if (input.id === "admin" && input.pw === "admin123") {
          // 1. DB에서 어드민 유저 확인 또는 생성
          let user = await db.getUserByOpenId("admin-id");
          if (!user) {
            await db.upsertUser({
              openId: "admin-id",
              name: "Administrator",
              email: "admin@local",
              loginMethod: "manual",
              role: "admin",
            });
            user = await db.getUserByOpenId("admin-id");
          }

          if (!user) throw new Error("Failed to create admin user");

          // 2. 세션 토킹 생성
          const sessionToken = await sdk.createSessionToken(user.openId, {
            name: user.name || "Admin",
          });

          // 3. 쿠키 설정
          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.cookie(COOKIE_NAME, sessionToken, cookieOptions);

          return { success: true, user };
        }
        throw new Error("Invalid credentials");
      }),
  }),

  // 날씨 API 라우터
  weather: router({
    latest: protectedProcedure.query(async ({ ctx }) => {
      return await db.getLatestWeatherRecords(ctx.user.id, 10);
    }),
    fetch: protectedProcedure
      .input(z.object({ location: z.string() }))
      .query(async ({ ctx, input }) => {
        const startTime = Date.now();
        try {
          const data = await getWeatherData(input.location);
          await db.logApiCall({
            userId: ctx.user.id,
            apiName: "weather",
            endpoint: "/api/weather/fetch",
            method: "GET",
            statusCode: 200,
            responseTime: Date.now() - startTime,
            success: 1,
          });
          return data;
        } catch (error) {
          await db.logApiCall({
            userId: ctx.user.id,
            apiName: "weather",
            endpoint: "/api/weather/fetch",
            method: "GET",
            statusCode: 500,
            responseTime: Date.now() - startTime,
            success: 0,
            errorMessage: error instanceof Error ? error.message : "Unknown error",
          });
          throw error;
        }
      }),
    save: protectedProcedure
      .input(
        z.object({
          location: z.string(),
          temperature: z.number(),
          humidity: z.number(),
          windSpeed: z.number(),
          condition: z.string(),
          description: z.string().optional(),
          feelsLike: z.number().optional(),
          uvIndex: z.number().optional(),
          visibility: z.number().optional(),
          pressure: z.number().optional(),
          precipitation: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const startTime = Date.now();
        try {
          await db.saveWeatherRecord({
            userId: ctx.user.id,
            ...input,
          });
          await db.logApiCall({
            userId: ctx.user.id,
            apiName: "weather",
            endpoint: "/api/weather/save",
            method: "POST",
            statusCode: 200,
            responseTime: Date.now() - startTime,
            success: 1,
          });
          return { success: true };
        } catch (error) {
          await db.logApiCall({
            userId: ctx.user.id,
            apiName: "weather",
            endpoint: "/api/weather/save",
            method: "POST",
            statusCode: 500,
            responseTime: Date.now() - startTime,
            success: 0,
            errorMessage: error instanceof Error ? error.message : "Unknown error",
          });
          throw error;
        }
      }),
  }),

  // 물류 API 라우터
  logistics: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getLogisticsRecords(ctx.user.id, 10);
    }),
    fetch: protectedProcedure
      .input(z.object({ trackingNumber: z.string() }))
      .query(async ({ ctx, input }) => {
        const startTime = Date.now();
        try {
          const data = await getLogisticsData(input.trackingNumber);
          await db.logApiCall({
            userId: ctx.user.id,
            apiName: "logistics",
            endpoint: "/api/logistics/fetch",
            method: "GET",
            statusCode: 200,
            responseTime: Date.now() - startTime,
            success: 1,
          });
          return data;
        } catch (error) {
          await db.logApiCall({
            userId: ctx.user.id,
            apiName: "logistics",
            endpoint: "/api/logistics/fetch",
            method: "GET",
            statusCode: 500,
            responseTime: Date.now() - startTime,
            success: 0,
            errorMessage: error instanceof Error ? error.message : "Unknown error",
          });
          throw error;
        }
      }),
    save: protectedProcedure
      .input(
        z.object({
          trackingNumber: z.string(),
          status: z.string(),
          origin: z.string(),
          destination: z.string(),
          carrier: z.string().optional(),
          estimatedDelivery: z.date().optional(),
          actualDelivery: z.date().optional(),
          weight: z.number().optional(),
          distance: z.number().optional(),
          cost: z.number().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const startTime = Date.now();
        try {
          await db.saveLogisticsRecord({
            userId: ctx.user.id,
            ...input,
          });
          await db.logApiCall({
            userId: ctx.user.id,
            apiName: "logistics",
            endpoint: "/api/logistics/save",
            method: "POST",
            statusCode: 200,
            responseTime: Date.now() - startTime,
            success: 1,
          });
          return { success: true };
        } catch (error) {
          await db.logApiCall({
            userId: ctx.user.id,
            apiName: "logistics",
            endpoint: "/api/logistics/save",
            method: "POST",
            statusCode: 500,
            responseTime: Date.now() - startTime,
            success: 0,
            errorMessage: error instanceof Error ? error.message : "Unknown error",
          });
          throw error;
        }
      }),
  }),

  // 에너지 API 라우터
  energy: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getEnergyRecords(ctx.user.id, 10);
    }),
    fetch: protectedProcedure
      .input(z.object({ facility: z.string() }))
      .query(async ({ ctx, input }) => {
        const startTime = Date.now();
        try {
          const data = await getEnergyData(input.facility);
          await db.logApiCall({
            userId: ctx.user.id,
            apiName: "energy",
            endpoint: "/api/energy/fetch",
            method: "GET",
            statusCode: 200,
            responseTime: Date.now() - startTime,
            success: 1,
          });
          return data;
        } catch (error) {
          await db.logApiCall({
            userId: ctx.user.id,
            apiName: "energy",
            endpoint: "/api/energy/fetch",
            method: "GET",
            statusCode: 500,
            responseTime: Date.now() - startTime,
            success: 0,
            errorMessage: error instanceof Error ? error.message : "Unknown error",
          });
          throw error;
        }
      }),
    save: protectedProcedure
      .input(
        z.object({
          facility: z.string(),
          energyType: z.string(),
          consumption: z.number(),
          cost: z.number(),
          efficiency: z.number().optional(),
          carbonEmission: z.number().optional(),
          peakUsage: z.number().optional(),
          averageUsage: z.number().optional(),
          trend: z.string().optional(),
          notes: z.string().optional(),
          recordDate: z.date(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const startTime = Date.now();
        try {
          await db.saveEnergyRecord({
            userId: ctx.user.id,
            ...input,
          });
          await db.logApiCall({
            userId: ctx.user.id,
            apiName: "energy",
            endpoint: "/api/energy/save",
            method: "POST",
            statusCode: 200,
            responseTime: Date.now() - startTime,
            success: 1,
          });
          return { success: true };
        } catch (error) {
          await db.logApiCall({
            userId: ctx.user.id,
            apiName: "energy",
            endpoint: "/api/energy/save",
            method: "POST",
            statusCode: 500,
            responseTime: Date.now() - startTime,
            success: 0,
            errorMessage: error instanceof Error ? error.message : "Unknown error",
          });
          throw error;
        }
      }),
  }),

  // [New] 글로벌/공통 서비스 라우터 (아이디어 구현용)
  global: router({
    trends: protectedProcedure.query(async () => {
      // 실제로는 apiClient.fetchGlobalEnergyTrends() 호출
      // 지금은 Mock 데이터 반환
      return {
        oilPrice: 78.5,     // WTI 기준
        exchangeRate: 1340, // 원/달러
        trend: "stable"
      };
    }),
    notices: protectedProcedure.query(async () => {
      // apiClient.fetchCompanyNotices() 호출
      return [
        { id: 1, title: "⚡ 에너지 절약 캠페인 안내", urgent: true },
        { id: 2, title: "시스템 정기 점검 (1/25)", urgent: false }
      ];
    })
  }),

  // [New] 통합 대시보드 라우터
  dashboard: router({
    getHomeData: protectedProcedure
      .input(z.object({ location: z.string().default("서울") }))
      .query(async ({ input }) => {
        const [weather, energy] = await Promise.all([
          getWeatherData(input.location),
          getEnergyData(input.location),
        ]);
        return { weather, energy };
      }),
  }),
});

export type AppRouter = typeof appRouter;
