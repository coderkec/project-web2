import { AXIOS_TIMEOUT_MS, COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { ForbiddenError } from "@shared/_core/errors";
import axios, { type AxiosInstance } from "axios";
import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";
import { SignJWT, jwtVerify } from "jose";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "./env";
import type {
  ExchangeTokenRequest,
  ExchangeTokenResponse,
  GetUserInfoResponse,
  GetUserInfoWithJwtRequest,
  GetUserInfoWithJwtResponse,
} from "./types/manusTypes";

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0;

export type SessionPayload = {
  openId: string;
  appId: string;
  name: string;
};

// Safe URL utility to prevent "Invalid URL" crash
function safeUrl(base: string, path: string = ""): string {
  try {
    if (!base) return path;
    return new URL(path, base).toString();
  } catch (e) {
    console.error(`[SDK] Invalid URL components: base=${base}, path=${path}`);
    return base + path;
  }
}

const EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
const GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
const GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;

class OAuthService {
  constructor(private client: ReturnType<typeof axios.create>) {
    console.log("[OAuth] Initialized. baseURL:", this.client.defaults.baseURL);
  }

  private decodeState(state: string): string {
    try {
      if (!state) return "";
      const normalizedState = state.replace(/-/g, '+').replace(/_/g, '/');
      return Buffer.from(normalizedState, 'base64').toString('utf8').trim();
    } catch (e) {
      console.error("[OAuth] decodeState FAILED:", state, e);
      return "";
    }
  }

  async getTokenByCode(
    code: string,
    state: string
  ): Promise<ExchangeTokenResponse> {
    const redirectUri = this.decodeState(state);
    const payload: ExchangeTokenRequest = {
      clientId: ENV.googleClientId,
      grantType: "authorization_code",
      code,
      redirectUri,
    };

    if (!this.client.defaults.baseURL || this.client.defaults.baseURL.includes("manus.run")) {
      throw new Error("Misconfigured OAuth Service: No valid Portal URL provided and Google flow was not triggered.");
    }

    try {
      const { data } = await this.client.post<ExchangeTokenResponse>(
        EXCHANGE_TOKEN_PATH,
        payload
      );
      return data;
    } catch (err: any) {
      console.error("[OAuth] getTokenByCode failed:", err.response?.data || err.message);
      throw err;
    }
  }

  async getUserInfoByToken(
    token: ExchangeTokenResponse
  ): Promise<GetUserInfoResponse> {
    const { data } = await this.client.post<GetUserInfoResponse>(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken,
      }
    );
    return data;
  }
}

const createOAuthHttpClient = (): AxiosInstance =>
  axios.create({
    baseURL: ENV.oAuthServerUrl || "", // REMOVED MANUS FALLBACK
    timeout: AXIOS_TIMEOUT_MS,
  });

class SDKServer {
  private readonly client: AxiosInstance;
  private readonly oauthService: OAuthService;

  constructor(client: AxiosInstance = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }

  private isGoogleFlow(): boolean {
    const id = ENV.googleClientId || "";
    const secret = ENV.googleClientSecret || "";
    const isGoogle = id.includes(".apps.googleusercontent.com") || secret.startsWith("GOCSPX-");
    console.log(`[SDK] Flow Detection - Google: ${isGoogle}, ClientID: ${id.substring(0, 10)}..., Secret: ${!!secret}`);
    return isGoogle;
  }

  async exchangeCodeForToken(
    code: string,
    state: string
  ): Promise<ExchangeTokenResponse> {

    if (this.isGoogleFlow()) {
      console.log("[SDK] Executing Google OAuth Exchange");
      const normalizedState = state.replace(/-/g, '+').replace(/_/g, '/');
      const redirectUri = Buffer.from(normalizedState, 'base64').toString('utf8').trim();

      const decodedCode = code.includes("%") ? decodeURIComponent(code) : code;
      const params = new URLSearchParams();
      params.append("code", decodedCode);
      params.append("client_id", ENV.googleClientId);
      params.append("client_secret", ENV.googleClientSecret);
      params.append("redirect_uri", redirectUri);
      params.append("grant_type", "authorization_code");

      const { data } = await axios.post("https://oauth2.googleapis.com/token", params.toString(), {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      return {
        accessToken: data.access_token,
        tokenType: data.token_type,
        expiresIn: data.expires_in,
        idToken: data.id_token,
        scope: data.scope,
      };
    }

    console.warn("[SDK] Google flow not detected, falling back to Portal (likely failure)");
    return this.oauthService.getTokenByCode(code, state);
  }

  async getUserInfo(accessToken: string): Promise<GetUserInfoResponse> {
    if (this.isGoogleFlow()) {
      const { data } = await axios.get("https://openidconnect.googleapis.com/v1/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return {
        openId: data.sub,
        projectId: ENV.googleClientId,
        name: data.name || data.email?.split("@")[0] || "Google User",
        email: data.email ?? null,
        platform: "google",
        loginMethod: "google",
      };
    }
    const data = await this.oauthService.getUserInfoByToken({ accessToken } as ExchangeTokenResponse);
    return { ...data, platform: "google", loginMethod: "google" } as GetUserInfoResponse;
  }

  async authenticateRequest(req: Request): Promise<User> {
    const cookies = this.parseCookies(req.headers.cookie);
    let sessionToken = cookies.get(COOKIE_NAME);

    // ✅ 쿠키가 없거나 유효하지 않을 경우를 대비해 헤더(Bearer Token)에서도 토큰을 찾습니다.
    if (!sessionToken && req.headers.authorization?.startsWith("Bearer ")) {
      sessionToken = req.headers.authorization.substring(7);
      console.log("[SDK] Authenticating via Authorization Header");
    }

    const session = await this.verifySession(sessionToken);

    if (!session) throw ForbiddenError("Invalid session sessionToken");

    let user = await db.getUserByOpenId(session.openId);
    if (!user) {
      // Simple fallback if user is in-session but not in DB (rare)
      await db.upsertUser({
        openId: session.openId,
        name: session.name || "User",
        email: null,
        loginMethod: "google",
        lastSignedIn: new Date(),
      });
      user = await db.getUserByOpenId(session.openId);
    }
    return user!;
  }

  private parseCookies(header: string | undefined) {
    if (!header) return new Map<string, string>();
    return new Map(Object.entries(parseCookieHeader(header)));
  }

  private getSessionSecret() {
    return new TextEncoder().encode(ENV.cookieSecret);
  }

  async createSessionToken(openId: string, options: { name?: string; expiresInMs?: number } = {}) {
    const payload: SessionPayload = { openId, appId: ENV.googleClientId, name: options.name || "" };
    const expires = Math.floor((Date.now() + (options.expiresInMs ?? ONE_YEAR_MS)) / 1000);
    return new SignJWT(payload).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expires).sign(this.getSessionSecret());
  }

  async verifySession(token: string | undefined | null): Promise<SessionPayload | null> {
    if (!token) return null;
    try {
      const { payload } = await jwtVerify(token, this.getSessionSecret(), { algorithms: ["HS256"] });
      return payload as SessionPayload;
    } catch { return null; }
  }
}

export const sdk = new SDKServer();
