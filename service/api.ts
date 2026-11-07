import axios, { isAxiosError } from "axios";
import { Platform } from "react-native";

// "localhost" on an Android emulator is the emulator itself; 10.0.2.2 reaches the host machine.
// On a physical phone set EXPO_PUBLIC_API_URL to your computer's LAN IP, e.g. http://192.168.1.10:8080
const DEFAULT_HOST = Platform.OS === "android" ? "10.0.2.2" : "localhost";
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? `http://${DEFAULT_HOST}:8080`;

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
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
