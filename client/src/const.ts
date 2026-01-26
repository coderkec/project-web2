console.log("OAUTH:", import.meta.env.VITE_OAUTH_PORTAL_URL);
console.log("APP_ID:", import.meta.env.VITE_APP_ID);

export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL || "";
  const appId = import.meta.env.VITE_APP_ID || "";
  const redirectUri = `${window.location.origin}/api/auth/callback/google`;
  const state = btoa(redirectUri);

  console.log("[Auth] appId:", appId);
  console.log("[Auth] portalUrl:", oauthPortalUrl);

  // If using standard Google OAuth directly
  if (appId && appId.includes(".apps.googleusercontent.com")) {
    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.searchParams.set("client_id", appId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "openid profile email");
    url.searchParams.set("state", state);
    return url.toString();
  }

  const url = new URL(`${oauthPortalUrl || "https://oauth.manus.run"}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};
