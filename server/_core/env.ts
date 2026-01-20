console.log("[ENV] Loading process.env.VITE_APP_ID:", process.env.VITE_APP_ID ? "PRESENT" : "MISSING");

export const ENV = {
  appId: (process.env.VITE_APP_ID ?? "").trim(),
  cookieSecret: (process.env.JWT_SECRET ?? "").trim(),
  databaseUrl: (process.env.DATABASE_URL ?? "").trim(),
  oAuthServerUrl: (process.env.OAUTH_SERVER_URL ?? "").trim(),
  ownerOpenId: (process.env.OWNER_OPEN_ID ?? "").trim(),
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: (process.env.BUILT_IN_FORGE_API_URL ?? "").trim(),
  forgeApiKey: (process.env.BUILT_IN_FORGE_API_KEY ?? "").trim(),
  googleClientSecret: (process.env.GOOGLE_CLIENT_SECRET ?? "").trim(),
};

console.log("[ENV] appId Length:", ENV.appId.length);
console.log("[ENV] secret Length:", ENV.googleClientSecret.length);
console.log("[ENV] secret Prefix:", ENV.googleClientSecret.substring(0, 10) + "...");
