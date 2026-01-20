import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * 날씨 데이터 기록 테이블
 * 실시간 날씨 API로부터 수집한 데이터를 저장
 */
export const weatherRecords = mysqlTable("weather_records", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  location: varchar("location", { length: 255 }).notNull(),
  temperature: int("temperature").notNull(), // 섭씨 온도
  humidity: int("humidity").notNull(), // 습도 (%)
  windSpeed: int("windSpeed").notNull(), // 풍속 (km/h)
  condition: varchar("condition", { length: 100 }).notNull(), // 날씨 상태 (맑음, 흐림, 비 등)
  description: text("description"), // 상세 설명
  feelsLike: int("feelsLike"), // 체감 온도
  uvIndex: int("uvIndex"), // 자외선 지수
  visibility: int("visibility"), // 시정 (m)
  pressure: int("pressure"), // 기압 (hPa)
  precipitation: int("precipitation"), // 강수량 (mm)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WeatherRecord = typeof weatherRecords.$inferSelect;
export type InsertWeatherRecord = typeof weatherRecords.$inferInsert;

/**
 * 물류/로지스틱스 데이터 기록 테이블
 * 배송 상태, 물류 정보 등을 저장
 */
export const logisticsRecords = mysqlTable("logistics_records", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  trackingNumber: varchar("tracking_number", { length: 100 }).notNull().unique(),
  status: varchar("status", { length: 50 }).notNull(), // 배송 상태 (배송중, 배송완료, 배송대기 등)
  origin: varchar("origin", { length: 255 }).notNull(), // 출발지
  destination: varchar("destination", { length: 255 }).notNull(), // 목적지
  carrier: varchar("carrier", { length: 100 }), // 배송사
  estimatedDelivery: timestamp("estimated_delivery"), // 예상 배송일
  actualDelivery: timestamp("actual_delivery"), // 실제 배송일
  weight: int("weight"), // 무게 (g)
  distance: int("distance"), // 거리 (km)
  cost: int("cost"), // 배송비 (원)
  notes: text("notes"), // 특이사항
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LogisticsRecord = typeof logisticsRecords.$inferSelect;
export type InsertLogisticsRecord = typeof logisticsRecords.$inferInsert;

/**
 * 에너지 효율 데이터 기록 테이블
 * 에너지 사용량, 효율성 지표 등을 저장
 */
export const energyRecords = mysqlTable("energy_records", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  facility: varchar("facility", { length: 255 }).notNull(), // 시설명
  energyType: varchar("energy_type", { length: 50 }).notNull(), // 에너지 종류 (전기, 가스, 수도 등)
  consumption: int("consumption").notNull(), // 사용량 (kWh, m³ 등)
  cost: int("cost").notNull(), // 비용 (원)
  efficiency: int("efficiency"), // 효율성 지표 (%)
  carbonEmission: int("carbon_emission"), // 탄소 배출량 (kg CO2)
  peakUsage: int("peak_usage"), // 최대 사용량
  averageUsage: int("average_usage"), // 평균 사용량
  trend: varchar("trend", { length: 20 }), // 추세 (상승, 하강, 유지)
  notes: text("notes"), // 특이사항
  recordDate: timestamp("record_date").notNull(), // 기록 날짜
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EnergyRecord = typeof energyRecords.$inferSelect;
export type InsertEnergyRecord = typeof energyRecords.$inferInsert;

/**
 * API 호출 기록 테이블
 * 외부 API 호출 이력, 응답 시간, 에러 등을 추적
 */
export const apiCalls = mysqlTable("api_calls", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  apiName: varchar("api_name", { length: 100 }).notNull(), // API 이름 (weather, logistics, energy)
  endpoint: varchar("endpoint", { length: 255 }).notNull(), // API 엔드포인트
  method: varchar("method", { length: 10 }).notNull(), // HTTP 메서드 (GET, POST 등)
  statusCode: int("status_code"), // HTTP 상태 코드
  responseTime: int("response_time"), // 응답 시간 (ms)
  success: int("success").notNull().default(1), // 성공 여부 (1: 성공, 0: 실패)
  errorMessage: text("error_message"), // 에러 메시지
  dataSize: int("data_size"), // 응답 데이터 크기 (bytes)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ApiCall = typeof apiCalls.$inferSelect;
export type InsertApiCall = typeof apiCalls.$inferInsert;