import { api, toApiError } from "./api";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveTokens,
} from "./tokenStorage";

type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  accessTokenExpiresInMs: number;
  refreshTokenExpiresInMs: number;
};

export async function verifyEmail(email: string, code: string): Promise<void> {
  try {
    await api.post("/api/auth/verify", { email, code });
  } catch (e) {
    throw toApiError(e, "Verification failed");
  }
}

/**
 * Revokes the refresh token on the server, then clears local tokens.
 * Local tokens are cleared even if the request fails (offline, expired token),
 * so the user is never stuck signed in on this device.
 */
export async function logout(): Promise<void> {
  const [refreshToken, accessToken] = await Promise.all([
    getRefreshToken(),
    getAccessToken(),
  ]);
  try {
    if (refreshToken) {
      await api.post(
        "/api/auth/logout",
        { refreshToken },
        accessToken
          ? { headers: { Authorization: `Bearer ${accessToken}` } }
          : undefined,
      );
    }
  } catch {
    // Ignore: the server may be unreachable or the token already expired.
  } finally {
    await clearTokens();
  }
}

export async function login(email: string, password: string): Promise<void> {
  try {
    const { data } = await api.post<LoginResponse>("/api/auth/login", {
      email,
      password,
    });
    await saveTokens(data.accessToken, data.refreshToken);
  } catch (e) {
    throw toApiError(e, "Login failed");
  }
}
