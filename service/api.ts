import axios, {
  isAxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import { Platform } from "react-native";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveTokens,
} from "./tokenStorage";

// "localhost" on an Android emulator is the emulator itself; 10.0.2.2 reaches the host machine.
// On a physical phone set EXPO_PUBLIC_API_URL to your computer's LAN IP, e.g. http://192.168.1.10:8080
const DEFAULT_HOST = Platform.OS === "android" ? "10.0.2.2" : "localhost";
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? `http://${DEFAULT_HOST}:8080`;

// Render's free tier sleeps when idle; the first request can take ~50s to wake it.
const TIMEOUT_MS = 60000;

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: TIMEOUT_MS,
  headers: { "Content-Type": "application/json" },
});

// These endpoints never get a Bearer token, and a 401 from them is not a stale token.
const PUBLIC_PATHS = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/verify",
  "/api/auth/refresh",
];
const isPublic = (url?: string) => PUBLIC_PATHS.some((p) => url?.includes(p));

// Attach `Authorization: Bearer <accessToken>` to every protected request.
api.interceptors.request.use(async (config) => {
  if (!isPublic(config.url)) {
    const token = await getAccessToken();
    if (token) config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

type RefreshResponse = { accessToken: string; refreshToken: string };

// One refresh at a time: parallel 401s share the same request.
let refreshing: Promise<string | null> | null = null;

async function refreshTokens(): Promise<string | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;
  try {
    // Bare axios: this call must not pass through the interceptors above.
    const { data } = await axios.post<RefreshResponse>(
      `${API_BASE_URL}/api/auth/refresh`,
      { refreshToken },
      { timeout: TIMEOUT_MS },
    );
    await saveTokens(data.accessToken, data.refreshToken);
    return data.accessToken;
  } catch (e) {
    // Only a rejected refresh token means the session is over; a network error is not.
    if (isAxiosError(e) && e.response) await clearTokens();
    return null;
  }
}

// On 401 (expired access token): refresh once, then retry the original request.
api.interceptors.response.use(undefined, async (error: unknown) => {
  if (!isAxiosError(error) || error.response?.status !== 401 || !error.config) {
    throw error;
  }
  const original = error.config as InternalAxiosRequestConfig & {
    _retried?: boolean;
  };
  if (original._retried || isPublic(original.url)) throw error;
  original._retried = true;

  refreshing ??= refreshTokens().finally(() => {
    refreshing = null;
  });
  const newToken = await refreshing;
  if (!newToken) throw error;

  original.headers.set("Authorization", `Bearer ${newToken}`);
  return api(original);
});

/** Turns any axios failure into an Error with a message that is safe to show. */
export function toApiError(e: unknown, fallback: string): Error {
  if (isAxiosError(e)) {
    const body: unknown = e.response?.data;
    const serverMessage =
      typeof body === "object" && body !== null && "message" in body
        ? String((body as { message: unknown }).message)
        : undefined;
    return new Error(
      serverMessage ??
        (e.response
          ? `${fallback} (${e.response.status})`
          : "Cannot reach the server. Check your connection."),
    );
  }
  return e instanceof Error ? e : new Error(fallback);
}
