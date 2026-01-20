import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  InsertUser,
  users,
  weatherRecords,
  InsertWeatherRecord,
  logisticsRecords,
  InsertLogisticsRecord,
  energyRecords,
  InsertEnergyRecord,
  apiCalls,
  InsertApiCall,
  User,
} from "../drizzle/schema";
import { ENV } from './_core/env';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.resolve(__dirname, "../../local_db.json");

interface LocalStore {
  users: User[];
  weatherRecords: any[];
  logisticsRecords: any[];
  energyRecords: any[];
  apiCalls: any[];
}

function readLocalDb(): LocalStore {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
    }
  } catch (e) {
    console.error("[LocalDB] Read failed:", e);
  }
  return { users: [], weatherRecords: [], logisticsRecords: [], energyRecords: [], apiCalls: [] };
}

function writeLocalDb(data: LocalStore) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("[LocalDB] Write failed:", e);
  }
}

let _db: ReturnType<typeof drizzle> | null = null;
let _usingFallback = false;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && !_usingFallback && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
      // Quick connectivity check
      await _db.select({ one: 1 }).from(users).limit(1).catch(() => {
        throw new Error("Table or connection missing");
      });
      console.log("[Database] Connected successfully.");
    } catch (error) {
      console.warn("[Database] MySQL not available, using JSON fallback.");
      _db = null;
      _usingFallback = true;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  const db = await getDb();
  if (!db) {
    const store = readLocalDb();
    const existingIdx = store.users.findIndex(u => u.openId === user.openId);
    const now = new Date();

    if (existingIdx >= 0) {
      store.users[existingIdx] = {
        ...store.users[existingIdx],
        name: user.name ?? store.users[existingIdx].name,
        email: user.email ?? store.users[existingIdx].email,
        loginMethod: user.loginMethod ?? store.users[existingIdx].loginMethod,
        lastSignedIn: user.lastSignedIn ?? now,
        updatedAt: now,
      };
    } else {
      const newUser: User = {
        id: store.users.length + 1,
        openId: user.openId!,
        name: user.name ?? null,
        email: user.email ?? null,
        loginMethod: user.loginMethod ?? null,
        role: user.role ?? (user.openId === ENV.ownerOpenId ? 'admin' : 'user'),
        createdAt: now,
        updatedAt: now,
        lastSignedIn: user.lastSignedIn ?? now,
      };
      store.users.push(newUser);
    }
    writeLocalDb(store);
    return;
  }

  await db.insert(users).values(user).onDuplicateKeyUpdate({
    set: {
      name: user.name,
      email: user.email,
      loginMethod: user.loginMethod,
      lastSignedIn: user.lastSignedIn,
    }
  });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    const store = readLocalDb();
    return store.users.find(u => u.openId === openId);
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function saveWeatherRecord(data: InsertWeatherRecord): Promise<void> {
  const db = await getDb();
  if (!db) {
    const store = readLocalDb();
    store.weatherRecords.push({ ...data, id: store.weatherRecords.length + 1, createdAt: new Date() });
    writeLocalDb(store);
    return;
  }
  await db.insert(weatherRecords).values(data);
}

export async function getLatestWeatherRecords(userId: number, limit: number = 10) {
  const db = await getDb();
  if (!db) {
    const store = readLocalDb();
    return store.weatherRecords
      .filter(r => r.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
  return db.select().from(weatherRecords).where(eq(weatherRecords.userId, userId)).orderBy(desc(weatherRecords.createdAt)).limit(limit);
}

// Simplified remaining exports for fallback
export async function saveLogisticsRecord(data: InsertLogisticsRecord) {
  const db = await getDb();
  if (!db) {
    const store = readLocalDb();
    store.logisticsRecords.push({ ...data, id: store.logisticsRecords.length + 1, createdAt: new Date() });
    writeLocalDb(store);
    return;
  }
  await db.insert(logisticsRecords).values(data);
}

export async function getLogisticsRecords(userId: number, limit: number = 10) {
  const db = await getDb();
  if (!db) {
    const store = readLocalDb();
    return store.logisticsRecords.filter(r => r.userId === userId).slice(0, limit);
  }
  return db.select().from(logisticsRecords).where(eq(logisticsRecords.userId, userId)).limit(limit);
}

export async function saveEnergyRecord(data: InsertEnergyRecord) {
  const db = await getDb();
  if (!db) {
    const store = readLocalDb();
    store.energyRecords.push({ ...data, id: store.energyRecords.length + 1, createdAt: new Date() });
    writeLocalDb(store);
    return;
  }
  await db.insert(energyRecords).values(data);
}

export async function getEnergyRecords(userId: number, limit: number = 10) {
  const db = await getDb();
  if (!db) {
    const store = readLocalDb();
    return store.energyRecords.filter(r => r.userId === userId).slice(0, limit);
  }
  return db.select().from(energyRecords).where(eq(energyRecords.userId, userId)).limit(limit);
}

export async function logApiCall(data: InsertApiCall) {
  const db = await getDb();
  if (!db) {
    const store = readLocalDb();
    store.apiCalls.push({ ...data, id: store.apiCalls.length + 1, createdAt: new Date() });
    writeLocalDb(store);
    return;
  }
  await db.insert(apiCalls).values(data);
}
