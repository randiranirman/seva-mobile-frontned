import { jwtDecode } from "jwt-decode";
import { clearTokens, getAccessToken, getRefreshToken } from "./tokenStorage";

export type AccessClaims = {
  sub?: string;
  exp?: number;
  isOwner?: boolean;
} & Record<string, unknown>;

/** Decodes the stored access token. This does not verify the signature; the backend does. */
export async function getClaims(): Promise<AccessClaims | null> {
  const token = await getAccessToken();
  if (!token) return null;
  try {
    return jwtDecode<AccessClaims>(token);
  } catch {
    return null;
  }
}

// `sub` is the email; the backend puts the user's id in the `userId` claim.
export function getUserId(claims: AccessClaims): string | null {
  const v = claims.userId;
  return typeof v === "string" && v.length > 0 ? v : null;
}

function isUnexpired(token: string): boolean {
  try {
    const { exp } = jwtDecode<{ exp?: number }>(token);
    return exp === undefined || exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

/**
 * Where the app should open. A session is valid while the access token OR the refresh
 * token has not expired (an expired access token is renewed on the first API call).
 * Valid owner -> store page, valid non-owner -> store setup, no valid session -> login.
 */
export async function getStartRoute(): Promise<"/login" | "/store" | "/welcome"> {
  const [access, refresh] = await Promise.all([
    getAccessToken(),
    getRefreshToken(),
  ]);
  const valid =
    (!!access && isUnexpired(access)) || (!!refresh && isUnexpired(refresh));
  if (!valid) {
    await clearTokens();
    return "/login";
  }
  return getHomeRoute();
}

/** Owners with a store go to their store page; everyone else goes to store setup. */
export async function getHomeRoute(): Promise<"/store" | "/welcome"> {
  const claims = await getClaims();
  return claims?.isOwner === true ? "/store" : "/welcome";
}
