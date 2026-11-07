import { api, toApiError } from "./api";

export type RegisterRequest = {
  email: string;
  password: string;
  mobileNumber: string;
};

export async function registerUser(payload: RegisterRequest): Promise<void> {
  try {
    await api.post("/api/auth/register", payload);
  } catch (e) {
    throw toApiError(e, "Registration failed");
  }
}
